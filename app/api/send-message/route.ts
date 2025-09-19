import { NextRequest, NextResponse } from 'next/server'
import { MessagingService } from '@/lib/messaging/service'
import { Channel, MessageConfig } from '@/lib/messaging/types'

const lastRequestTime = new Map<string, number>()
const RATE_LIMIT_MS = 60000 // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const lastRequest = lastRequestTime.get(identifier) || 0

  if (now - lastRequest < RATE_LIMIT_MS) {
    return false
  }

  lastRequestTime.set(identifier, now)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      )
    }

    const { channel, message, recipient } = await request.json()

    if (!channel || !['sms', 'whatsapp'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be "sms" or "whatsapp"' },
        { status: 400 }
      )
    }

    const config: MessageConfig = {
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
      twilioSmsNumber: process.env.TWILIO_SMS_NUMBER,
      twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
      smsRecipient: process.env.SMS_RECIPIENT,
      whatsappRecipient: process.env.WHATSAPP_RECIPIENT
    }

    if (!config.twilioAccountSid || !config.twilioAuthToken) {
      console.error('Twilio credentials not configured')
      return NextResponse.json(
        { error: 'Messaging service not configured' },
        { status: 500 }
      )
    }

    const messagingService = new MessagingService(config)

    if (!messagingService.isChannelAvailable(channel as Channel)) {
      return NextResponse.json(
        { error: `${channel} channel is not configured properly` },
        { status: 500 }
      )
    }

    const result = await messagingService.sendMessage(
      channel as Channel,
      message,
      recipient
    )

    if (!result.success) {
      console.error(`Failed to send ${channel} message:`, result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      provider: result.provider
    })
  } catch (error) {
    console.error('Error in send-message API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}