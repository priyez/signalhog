import { prisma } from '../config';

export const logActivity = async (projectId: string, userId: string, type: string, action: string, target: string) => {
  try {
    await (prisma as any).activity.create({
      data: { projectId, userId, type, action, target }
    });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
};
