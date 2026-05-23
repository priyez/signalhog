import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../config';
import { RegisterSchema, LoginSchema } from '../schemas';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = RegisterSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = (fastify as any).jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  });

  fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return reply.status(401).send({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return reply.status(401).send({ error: 'Invalid credentials' });

    const token = (fastify as any).jwt.sign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  });
}
