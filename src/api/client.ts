import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100';

/** Typed client generated from api/openapi.json. Regenerate types with: pnpm api:types */
export const api = createClient<paths>({ baseUrl: API_URL, credentials: 'include' });
