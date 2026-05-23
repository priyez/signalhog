import { FastifyInstance } from 'fastify';
import authRoutes from './auth';
import projectsRoutes from './projects';
import environmentsRoutes from './environments';
import flagsRoutes from './flags';
import sdkRoutes from './sdk';
import eventsRoutes from './events';
import funnelsRoutes from './funnels';
import activitiesRoutes from './activities';
import aiRoutes from './ai';

export default async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes);
  fastify.register(projectsRoutes);
  fastify.register(environmentsRoutes);
  fastify.register(flagsRoutes);
  fastify.register(sdkRoutes);
  fastify.register(eventsRoutes);
  fastify.register(funnelsRoutes);
  fastify.register(activitiesRoutes);
  fastify.register(aiRoutes);
}
