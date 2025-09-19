import twilio from 'twilio'
import { MessageProvider, MessageResult, MessageConfig } from '../types'

export class WhatsAppProvider implements MessageProvider {
  private client: twilio.Twilio
  private fromNumber: string

  constructor(private config: MessageConfig) {
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken)
    this.fromNumber = config.twilioWhatsappNumber || ''
  }

  async send(message: string, recipient?: string): Promise<MessageResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('WhatsApp provider not configured properly')
      }

      const to = recipient || this.config.whatsappRecipient
      if (!to) {
        throw new Error('No recipient WhatsApp number provided')
      }

      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
      const formattedFrom = this.fromNumber.startsWith('whatsapp:')
        ? this.fromNumber
        : `whatsapp:${this.fromNumber}`

      const result = await this.client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
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
      this.config.twilioWhatsappNumber &&
      this.config.whatsappRecipient
    )
  }

  getName(): string {
    return 'WhatsApp'
  }
}