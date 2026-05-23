import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import { prisma } from '../config';

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecretkey_change_in_prod',
  });

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // 1. Try JWT
        await request.jwtVerify();
      } catch (err) {
        // 2. Fallback: Try Session Token (from NextAuth)
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const session = await prisma.session.findUnique({
            where: { sessionToken: token },
            include: { user: true },
          });

          if (session && session.expires > new Date()) {
            (request as any).user = session.user;
            return;
          }
        }
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  );
});
