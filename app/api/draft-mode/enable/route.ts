import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const secret =
    process.env.SANITY_REVALIDATE_SECRET ?? process.env.SANITY_PRIVATE_TOKEN
  const providedSecret = request.nextUrl.searchParams.get('secret')

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ error: 'Invalid draft mode secret' }, { status: 401 })
  }

  ;(await draftMode()).enable()
  return NextResponse.redirect(new URL('/', request.url))
}
