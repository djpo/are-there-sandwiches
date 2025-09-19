export interface MessageProvider {
  send(message: string, recipient: string): Promise<MessageResult>
  isAvailable(): boolean
  getName(): string
}

export interface MessageResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

export type Channel = 'sms' | 'whatsapp'

export interface MessageConfig {
  twilioAccountSid: string
  twilioAuthToken: string
  twilioSmsNumber?: string
  twilioWhatsappNumber?: string
  smsRecipient?: string
  whatsappRecipient?: string
}