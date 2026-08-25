import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { isValidSignature } from '@sanity/webhook'
import { getClientIP, rateLimit, rateLimiters } from '@/lib/utils/rate-limit'

const SIGNATURE_HEADER_NAME = 'sanity-webhook-signature'

export async function POST(request: NextRequest) {
  // Rate limit to prevent cache flooding
  const ip = getClientIP(request)
  const rateLimitResult = rateLimit(`revalidate:${ip}`, rateLimiters.standard)

  if (!rateLimitResult.success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': String(rateLimitResult.resetIn),
      },
    })
  }

  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET
    if (!secret) {
      return new Response('Webhook secret not configured', { status: 503 })
    }

    const signature = request.headers.get(SIGNATURE_HEADER_NAME)
    const rawBody = await request.text()
    const hasValidSignature =
      signature && (await isValidSignature(rawBody, signature, secret.trim()))

    if (!hasValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    const body = (rawBody.trim() ? JSON.parse(rawBody) : null) as {
      _type?: string
      slug?: { current?: string }
    } | null

    if (!body?._type) {
      return new Response('Bad Request', { status: 400 })
    }

    revalidateTag(body._type)

    // If there's a slug, revalidate the specific page
    if (body.slug?.current) {
      revalidateTag(`${body._type}:${body.slug.current}`)
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
