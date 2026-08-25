import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_WS_URL: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export const APP_BASE_URL = env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
export const API_BASE_URL = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
export const WS_BASE_URL = env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
