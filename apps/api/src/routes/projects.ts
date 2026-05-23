import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../config';
import { CreateProjectSchema } from '../schemas';
import { logActivity } from '../utils/logger';

export default async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/projects',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const user = (request as any).user as { id: string };
      return prisma.project.findMany({
        where: { ownerId: user.id },
        include: { 
          environments: { include: { apiKeys: true } },
          _count: {
            select: { flags: true }
          }
        },
      });
    }
  );

  fastify.get(
    '/projects/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      return prisma.project.findUnique({
        where: { id },
        include: { 
          environments: { include: { apiKeys: true } },
          _count: { select: { flags: true } }
        },
      });
    }
  );

  fastify.patch(
    '/projects/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const { name } = request.body as any;
      const user = (request as any).user as { id: string };
      
      const project = await prisma.project.update({
        where: { id },
        data: { name }
      });

      await logActivity(id, user.id, 'project', 'Updated', name);
      return project;
    }
  );

  fastify.delete(
    '/projects/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const user = (request as any).user as { id: string };
      
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) throw new Error('Project not found');

      await logActivity(id, user.id, 'project', 'Deleted', project.name);
      
      await prisma.project.delete({ where: { id } });
      return { success: true };
    }
  );

  fastify.get(
    '/projects/:id/stats',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      
      const [flags, events, experiments] = await Promise.all([
        prisma.flag.count({ where: { projectId: id } }),
        (prisma as any).event.count({ where: { projectId: id } }),
        prisma.experiment.count({ where: { projectId: id, status: 'RUNNING' } }),
      ]);

      return {
        flags,
        events,
        activeExperiments: experiments
      };
    }
  );

  fastify.post(
    '/projects',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { name } = CreateProjectSchema.parse(request.body);
      const user = (request as any).user as { id: string };

      const project = await prisma.project.create({
        data: {
          name,
          ownerId: user.id,
          environments: {
            create: [
              { name: 'Development' },
              { name: 'Staging' },
              { name: 'Production' },
            ],
          },
        },
        include: { environments: true },
      });

      await logActivity(project.id, user.id, 'project', 'Created', name);

      // Generate SDK API keys for each environment
      for (const env of project.environments) {
        // Public key for client-side SDKs
        await prisma.apiKey.create({
          data: {
            projectId: project.id,
            environmentId: env.id,
            type: 'PUBLIC',
            name: 'Default Public Key',
            key: `pk_${Math.random().toString(36).substring(2, 15)}`,
          },
        });

        // Secret key for server-side / admin access
        await prisma.apiKey.create({
          data: {
            projectId: project.id,
            environmentId: env.id,
            type: 'SECRET',
            name: 'Default Secret Key',
            key: `sk_${Math.random().toString(36).substring(2, 15)}`,
          },
        });
      }

      return project;
    }
  );
}
