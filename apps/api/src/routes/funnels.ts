import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../config';
import { logActivity } from '../utils/logger';

export default async function funnelsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/funnels',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId } = request.query as any;
      return (prisma as any).funnel.findMany({
        where: { projectId, environmentId },
        orderBy: { createdAt: 'desc' },
      });
    }
  );

  fastify.post(
    '/funnels',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId, name, steps } = request.body as any;
      const funnel = await (prisma as any).funnel.create({
        data: {
          projectId,
          environmentId,
          name,
          steps,
        },
      });

      const user = (request as any).user as { id: string };
      await logActivity(projectId, user.id, 'funnel', 'Created', name);

      return funnel;
    }
  );

  fastify.delete(
    '/funnels/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      await (prisma as any).funnel.delete({ where: { id } });
      return { success: true };
    }
  );
}
