import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Temporary type augmentation to help IDE resolve new Prisma models
declare module '@prisma/client' {
  interface PrismaClient {
    session: any;
    account: any;
    verificationToken: any;
  }
}
