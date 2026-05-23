import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import authPlugin from './plugins/auth';
import apiRoutes from './routes';

const app = Fastify({ logger: true });

app.register(cors);
app.register(helmet);
app.register(authPlugin);

// Zod error handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof z.ZodError) {
    reply.status(400).send({
      error: 'Validation Error',
      details: error.errors,
    });
    return;
  }
  
  if (error.statusCode) {
    reply.send(error);
    return;
  }

  app.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

app.get('/health', async () => ({ status: 'ok' }));

app.register(apiRoutes);

export default app;
