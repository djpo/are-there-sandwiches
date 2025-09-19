import { MessageProvider, MessageResult, Channel, MessageConfig } from './types'
import { SMSProvider } from './providers/sms'
import { WhatsAppProvider } from './providers/whatsapp'

export class MessagingService {
  private providers: Map<Channel, MessageProvider>
  private defaultMessage = "🥪 Hey Noah, are there sandwiches right now?? I'm so excited about the sandwiches at CCB! 😋"

  constructor(config: MessageConfig) {
    this.providers = new Map()
    this.providers.set('sms', new SMSProvider(config))
    this.providers.set('whatsapp', new WhatsAppProvider(config))
  }

  async sendMessage(
    channel: Channel,
    customMessage?: string,
    recipient?: string
  ): Promise<MessageResult> {
    const provider = this.providers.get(channel)

    if (!provider) {
      return {
        success: false,
        error: `Unknown channel: ${channel}`,
        provider: channel
      }
    }

    if (!provider.isAvailable()) {
      return {
        success: false,
        error: `${provider.getName()} is not configured properly`,
        provider: provider.getName()
      }
    }

    const message = customMessage || this.defaultMessage
    return provider.send(message, recipient)
  }

  getAvailableChannels(): Channel[] {
    const available: Channel[] = []
    for (const [channel, provider] of this.providers.entries()) {
      if (provider.isAvailable()) {
        available.push(channel)
      }
    }
    return available
  }

  isChannelAvailable(channel: Channel): boolean {
    const provider = this.providers.get(channel)
    return provider ? provider.isAvailable() : false
  }
}