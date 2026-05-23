import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
});

export const TargetingRuleSchema = z.object({
  property: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with']),
  value: z.any(),
});

export const CreateFlagSchema = z.object({
  projectId: z.string().uuid(),
  environmentId: z.string().uuid(),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/, 'Flag key must be lowercase letters, numbers, and underscores only'),
  enabled: z.boolean().optional().default(false),
  rolloutPercentage: z.number().min(0).max(100).optional().default(100),
  rules: z.array(TargetingRuleSchema).optional().default([]),
});

export const CaptureSchema = z.object({
  event: z.string().min(1),
  distinctId: z.string().min(1),
  properties: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional(),
});
