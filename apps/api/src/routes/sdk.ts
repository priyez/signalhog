import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config';

export default async function sdkRoutes(fastify: FastifyInstance) {
  fastify.get('/sdk/flags', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const apiKey = authHeader.split(' ')[1];

    try {
      const keyData = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        include: {
          environment: {
            include: { flags: true },
          },
        },
      });

      if (!keyData) return reply.status(401).send({ error: 'Invalid API Key' });

      // Update lastUsedAt asynchronously
      prisma.apiKey.update({
        where: { id: keyData.id },
        data: { lastUsedAt: new Date() },
      }).catch(err => fastify.log.error(err));

      const flags = keyData.environment.flags.reduce(
        (acc: Record<string, { enabled: boolean; rolloutPercentage: number }>, flag: any) => {
          acc[flag.key] = {
            enabled: flag.enabled,
            rolloutPercentage: flag.rolloutPercentage,
          };
          return acc;
        },
        {}
      );

      return flags;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
