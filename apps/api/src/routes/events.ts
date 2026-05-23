import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config';
import { CaptureSchema } from '../schemas';

export default async function eventsRoutes(fastify: FastifyInstance) {
  fastify.post('/capture', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const apiKey = authHeader.split(' ')[1];
    const eventData = CaptureSchema.parse(request.body);

    try {
      const keyData = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        select: { id: true, projectId: true, environmentId: true, type: true },
      });

      if (!keyData) return reply.status(401).send({ error: 'Invalid API Key' });

      // Write directly to PostgreSQL Event table
      await (prisma as any).event.create({
        data: {
          projectId: keyData.projectId,
          environmentId: keyData.environmentId,
          event: eventData.event,
          distinctId: eventData.distinctId,
          properties: eventData.properties || {},
          timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
        }
      });

      return { status: 'success' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get(
    '/events',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId } = request.query as any;
      const events = await (prisma as any).event.findMany({
        where: { projectId, environmentId },
        orderBy: { timestamp: 'desc' },
        take: 100
      });

      return events.map((e: any) => ({
        event: e.event,
        distinct_id: e.distinctId,
        properties: e.properties,
        timestamp: e.timestamp.toISOString()
      }));
    }
  );

  fastify.get(
    '/events/names',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId } = request.query as any;
      const events = await (prisma as any).event.groupBy({
        by: ['event'],
        where: { projectId, environmentId },
      });
      return events.map((e: any) => e.event);
    }
  );

  fastify.get(
    '/metrics/trends',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId } = request.query as any;
      
      const results = await prisma.$queryRaw`
        SELECT 
          DATE("timestamp") as date,
          COUNT(*)::int as count
        FROM "Event"
        WHERE "projectId" = ${projectId} 
          AND "environmentId" = ${environmentId}
          AND "timestamp" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("timestamp")
        ORDER BY date ASC
      `;

      return (results as any[]).map(r => ({
        date: new Date(r.date).toISOString().split('T')[0],
        count: Number(r.count)
      }));
    }
  );

  fastify.post(
    '/metrics/funnel',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { projectId, environmentId, steps, window = 3600, funnelId } = request.body as any;
      
      let funnelSteps = steps;
      if (funnelId) {
        const funnel = await (prisma as any).funnel.findUnique({ where: { id: funnelId } });
        if (funnel) {
          funnelSteps = funnel.steps;
        }
      }

      if (!funnelSteps || (funnelSteps as string[]).length === 0) {
        return reply.status(400).send({ error: 'Steps are required' });
      }

      const stepNames = funnelSteps as string[];
      let cte = '';
      let args: any[] = [projectId, environmentId];
      
      for (let i = 0; i < stepNames.length; i++) {
        args.push(stepNames[i]);
        const stepIndex = args.length; 
        
        if (i === 0) {
          cte += `
            step0 AS (
              SELECT "distinctId", min("timestamp") as t
              FROM "Event"
              WHERE "projectId" = $1 AND "environmentId" = $2 AND "event" = $${stepIndex}
              GROUP BY "distinctId"
            )
          `;
        } else {
          cte += `,
            step${i} AS (
              SELECT e."distinctId", min(e."timestamp") as t
              FROM "Event" e
              JOIN step${i-1} s ON e."distinctId" = s."distinctId"
              WHERE e."projectId" = $1 AND e."environmentId" = $2 
                AND e."event" = $${stepIndex}
                AND e."timestamp" > s.t 
                AND e."timestamp" <= s.t + interval '${window} seconds'
              GROUP BY e."distinctId"
            )
          `;
        }
      }

      let unions = stepNames.map((_, i) => `SELECT ${i + 1} as level, count(*)::int as count FROM step${i}`).join(' UNION ALL ');

      const fullQuery = `WITH ${cte} ${unions} ORDER BY level ASC;`;
      
      try {
        const results = await prisma.$queryRawUnsafe(fullQuery, ...args);
        return results;
      } catch(e) {
        console.error('Funnel query error:', e);
        return [];
      }
    }
  );

  fastify.get(
    '/metrics/retention',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId, cohortEvent, activityEvent } = request.query as any;
      
      let cohortFilter = '';
      let activityFilter = '';
      let queryArgs: any[] = [projectId, environmentId];

      if (cohortEvent) {
        queryArgs.push(cohortEvent);
        cohortFilter = `AND "event" = $${queryArgs.length}`;
      }
      if (activityEvent) {
        queryArgs.push(activityEvent);
        activityFilter = `AND "event" = $${queryArgs.length}`;
      }

      const query = `
        WITH 
          initial_users AS (
            SELECT 
              "distinctId",
              DATE(MIN("timestamp")) as cohort_date
            FROM "Event"
            WHERE "projectId" = $1 AND "environmentId" = $2
              ${cohortFilter}
              AND "timestamp" >= NOW() - INTERVAL '30 days'
            GROUP BY "distinctId"
          ),
          returning_activity AS (
            SELECT 
              e."distinctId",
              DATE(e."timestamp") as activity_date,
              i.cohort_date
            FROM "Event" e
            JOIN initial_users i ON e."distinctId" = i."distinctId"
            WHERE e."projectId" = $1 AND e."environmentId" = $2
              ${activityFilter}
          )
        SELECT 
          TO_CHAR(cohort_date, 'YYYY-MM-DD') || 'T00:00:00.000Z' as cohort_date,
          (activity_date - cohort_date)::int as day_offset,
          count(DISTINCT returning_activity."distinctId")::int as count
        FROM returning_activity
        WHERE (activity_date - cohort_date) >= 0 AND (activity_date - cohort_date) <= 14
        GROUP BY cohort_date, day_offset
        ORDER BY cohort_date DESC, day_offset ASC
      `;

      try {
        const results = await prisma.$queryRawUnsafe(query, ...queryArgs);
        return results;
      } catch(e) {
        console.error('Retention query error:', e);
        return [];
      }
    }
  );
}
