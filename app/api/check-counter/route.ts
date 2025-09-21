import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

  let kvCount = null
  let kvError = null

  if (hasKV) {
    try {
      kvCount = await kv.get('sandwich_requests_total')
    } catch (error) {
      kvError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json({
    kvConfigured: hasKV,
    kvUrl: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
    kvToken: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
    currentCount: kvCount,
    kvError: kvError,
    timestamp: new Date().toISOString()
  })
}