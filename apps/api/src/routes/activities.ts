import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../config';

export default async function activitiesRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/activities',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { projectId } = request.query as any;
      return (prisma as any).activity.findMany({
        where: { projectId },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }
  );
}
