import twilio from 'twilio'
import { MessageProvider, MessageResult, MessageConfig } from '../types'

export class SMSProvider implements MessageProvider {
  private client: twilio.Twilio
  private fromNumber: string

  constructor(private config: MessageConfig) {
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken)
    this.fromNumber = config.twilioSmsNumber || ''
  }

  async send(message: string, recipient?: string): Promise<MessageResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('SMS provider not configured properly')
      }

      const to = recipient || this.config.smsRecipient
      if (!to) {
        throw new Error('No recipient phone number provided')
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      })

      return {
        success: true,
        messageId: result.sid,
        provider: this.getName()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.getName()
      }
    }
  }

  isAvailable(): boolean {
    return !!(
      this.config.twilioAccountSid &&
      this.config.twilioAuthToken &&
      this.config.twilioSmsNumber &&
      this.config.smsRecipient
    )
  }

  getName(): string {
    return 'SMS'
  }
}