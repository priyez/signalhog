import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../config';
import { CreateFlagSchema } from '../schemas';
import { logActivity } from '../utils/logger';

export default async function flagsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/flags',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId, environmentId } = request.query as any;
      return prisma.flag.findMany({ where: { projectId, environmentId } });
    }
  );

  fastify.post(
    '/flags',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const body = request.body as any;
      const { createInAllEnvs, ...data } = body;
      
      if (createInAllEnvs) {
        // Get all environments for this project
        const environments = await prisma.environment.findMany({
          where: { projectId: data.projectId }
        });
        
        const createdFlags = await Promise.all(
          environments.map((env: any) => 
            prisma.flag.create({
              data: {
                ...data,
                environmentId: env.id,
              }
            }).catch((err: any) => {
              // Ignore if key already exists in some envs
              console.error(`Flag ${data.key} already exists in ${env.name}`);
              return null;
            })
          )
        );
        
        return createdFlags.filter((f: any) => f !== null)[0] || { success: true };
      }

      const validatedData = CreateFlagSchema.parse(data);
      const flag = await prisma.flag.create({ data: validatedData });
      
      const user = (request as any).user as { id: string };
      await logActivity(data.projectId, user.id, 'flag', 'Created', data.key);

      return flag;
    }
  );

  fastify.patch(
    '/flags/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const body = request.body as Partial<{ enabled: boolean; rolloutPercentage: number; rules: any[] }>;
      const flag = await prisma.flag.update({ where: { id }, data: body });
      
      const user = (request as any).user as { id: string };
      await logActivity(flag.projectId, user.id, 'flag', 'Updated', flag.key);

      return flag;
    }
  );

  fastify.delete(
    '/flags/:id',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { id } = request.params as any;
      const flag = await prisma.flag.findUnique({ where: { id } });
      if (flag) {
        const user = (request as any).user as { id: string };
        await logActivity(flag.projectId, user.id, 'flag', 'Deleted', flag.key);
        await prisma.flag.delete({ where: { id } });
      }
      return { success: true };
    }
  );
}
