import { isConfigured } from '@/integrations/registry'
import { client } from '../client'

/**
 * Sanity fetch wrapper
 *
 * The admin panel only needs server-side product reads. Keeping this on the
 * standalone Sanity client avoids shipping Studio/live-editing packages in
 * production.
 */
const sanityReady = isConfigured('sanity') && client

export async function sanityFetch<T = unknown>({
  query,
  params,
}: {
  query: string
  params?: Record<string, unknown>
}): Promise<{ data: T | null }> {
  if (!sanityReady) {
    return { data: null }
  }

  const data = await client!.fetch<T>(query, params ?? {})
  return { data }
}

/**
 * Placeholder retained for layouts that expect a component export.
 */
export const SanityLive = () => null
