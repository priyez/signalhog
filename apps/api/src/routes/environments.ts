import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../config';
import { logActivity } from '../utils/logger';

export default async function environmentsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/environments',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, name } = request.body as any;
      const user = (request as any).user as { id: string };

      const env = await prisma.environment.create({
        data: {
          projectId,
          name,
        }
      });

      // Create default API keys for new environment
      await Promise.all([
        prisma.apiKey.create({
          data: {
            projectId,
            environmentId: env.id,
            type: 'PUBLIC',
            name: 'Default Public Key',
            key: `pk_${Math.random().toString(36).substring(2, 15)}`,
          }
        }),
        prisma.apiKey.create({
          data: {
            projectId,
            environmentId: env.id,
            type: 'SECRET',
            name: 'Default Secret Key',
            key: `sk_${Math.random().toString(36).substring(2, 15)}`,
          }
        })
      ]);

      await logActivity(projectId, user.id, 'environment', 'Created', name);
      return env;
    }
  );

  fastify.patch(
    '/environments/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const { name } = request.body as any;
      const user = (request as any).user as { id: string };

      const env = await prisma.environment.update({
        where: { id },
        data: { name },
        include: { project: true }
      });

      await logActivity(env.projectId, user.id, 'environment', 'Updated', name);
      return env;
    }
  );

  fastify.delete(
    '/environments/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const user = (request as any).user as { id: string };

      const env = await prisma.environment.findUnique({ where: { id } });
      if (!env) throw new Error('Environment not found');

      await logActivity(env.projectId, user.id, 'environment', 'Deleted', env.name);
      await prisma.environment.delete({ where: { id } });
      return { success: true };
    }
  );
}
