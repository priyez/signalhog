import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

export const prisma = new PrismaClient();
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});
