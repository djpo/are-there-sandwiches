# Are There Sandwiches? 🥪

A simple web app to notify someone that you want sandwiches via SMS or WhatsApp.

## Features

- **One-click sandwich requests** - Big button to send your sandwich request
- **Multiple channels** - Choose between SMS and WhatsApp
- **Rate limiting** - Prevents spam (1 message per minute)
- **Provider-agnostic architecture** - Easy to add new messaging channels

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Twilio

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token from the Twilio Console
3. For SMS: Purchase a phone number from Twilio
4. For WhatsApp: Use the Twilio Sandbox (for testing) or set up WhatsApp Business API

### 3. Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Twilio credentials and recipient numbers.

#### For WhatsApp Sandbox:
1. Go to Twilio Console > Messaging > Try it out > Send a WhatsApp message
2. Follow instructions to join the sandbox (send "join [sandbox-name]" to the Twilio number)
3. Use `whatsapp:+14155238886` as your `TWILIO_WHATSAPP_NUMBER`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Architecture

```
app/
├── page.tsx                 # Main UI with sandwich button
└── api/
    └── send-message/       # API endpoint for messaging
lib/
└── messaging/
    ├── types.ts            # TypeScript interfaces
    ├── service.ts          # Messaging service orchestrator
    └── providers/
        ├── sms.ts          # SMS provider implementation
        └── whatsapp.ts     # WhatsApp provider implementation
```

## Adding New Providers

To add a new messaging channel (e.g., Slack, Discord):

1. Create a new provider in `lib/messaging/providers/`
2. Implement the `MessageProvider` interface
3. Add the provider to `MessagingService` in `lib/messaging/service.ts`
4. Update the UI to include the new channel option

## Deployment

### Deploy to Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Remember to add your environment variables in the Vercel dashboard.

## License

MIT
