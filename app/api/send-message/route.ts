import { NextRequest, NextResponse } from 'next/server'
import { MessagingService } from '@/lib/messaging/service'
import { Channel, MessageConfig } from '@/lib/messaging/types'

const requestHistory = new Map<string, { count: number, firstRequest: number, lastRequest: number }>()
const FREE_SPAM_LIMIT = 10 // First 10 are unlimited speed
const SPAM_WINDOW_MS = 300000 // 5 minute window
const RATE_LIMIT_AFTER_SPAM_MS = 30000 // 30 seconds after hitting limit

function checkRateLimit(identifier: string): { allowed: boolean, message?: string } {
  const now = Date.now()
  const history = requestHistory.get(identifier) || { count: 0, firstRequest: now, lastRequest: 0 }

  // Reset if it's been more than 5 minutes since first request
  if (now - history.firstRequest > SPAM_WINDOW_MS) {
    history.count = 0
    history.firstRequest = now
  }

  // First 10 messages: no limit, spam away!
  if (history.count < FREE_SPAM_LIMIT) {
    history.count++
    history.lastRequest = now
    requestHistory.set(identifier, history)
    return { allowed: true }
  }

  // After 10: rate limit to prevent bankruptcy
  if (now - history.lastRequest < RATE_LIMIT_AFTER_SPAM_MS) {
    const secondsLeft = Math.ceil((RATE_LIMIT_AFTER_SPAM_MS - (now - history.lastRequest)) / 1000)

    const messages = [
      `Thank you for your ${history.count} acts of sandwich advocacy! You're making real change. Cooldown: ${secondsLeft}s #SandwichEquality`,
      `${history.count} messages sent! Your voice matters in the fight for sandwich accessibility. Rest for ${secondsLeft}s. ✊`,
      `You've raised sandwich awareness ${history.count} times today! Even activists need ${secondsLeft}s to recharge. #BreadJustice`,
      `${history.count} powerful messages! Together we'll end sandwich inequality at CCB. Next action in ${secondsLeft}s.`,
      `Your ${history.count} notifications are disrupting systemic sandwich withholding! Revolution resumes in ${secondsLeft}s.`,
      `${history.count} acts of digital resistance! You're on the right side of sandwich history. Cooldown: ${secondsLeft}s`,
      `BREAKING: Local activist sends ${history.count} messages demanding sandwich transparency! Next update in ${secondsLeft}s.`,
      `${history.count} messages sent! Your sandwich solidarity is changing hearts and minds. Recharge for ${secondsLeft}s.`,
      `You've submitted ${history.count} formal sandwich inquiries! Democracy requires ${secondsLeft}s between petitions.`,
      `Your ${history.count} messages prove that sandwich silence is sandwich violence! Cooldown: ${secondsLeft}s`,
      `${history.count} acts of courage! The arc of history bends toward sandwich justice. Next bend in ${secondsLeft}s.`,
      `You've sparked ${history.count} crucial conversations about sandwich availability! Dialogue resumes in ${secondsLeft}s.`,
      `${history.count} messages sent! Your grassroots sandwich organizing is inspiring. Regroup for ${secondsLeft}s.`
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    return {
      allowed: false,
      message: randomMessage
    }
  }

  history.count++
  history.lastRequest = now
  requestHistory.set(identifier, history)
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    const rateLimit = checkRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message || 'Too many requests. Please wait before trying again.' },
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