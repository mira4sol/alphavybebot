# Vybe Bot 🤖

A Telegram bot for tracking and managing token calls in crypto communities.

## Features

- Track token calls and performance
- Generate leaderboards for community members
- Real-time token price monitoring
- Group chat integration
- Solana token support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Telegram Bot Token
- Supabase account
- Solana RPC endpoint

## Installation

1. Clone the repository
```bash
git clone https://github.com/mira4sol/alphavybebot.git
cd alphavybebot
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure your environment variables
```env
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Development

Run the bot in development mode with hot-reload:
```bash
npm run dev
```

Or without hot-reload:
```bash
npm run dev1
```

## Production

Build the project:
```bash
npm run build
```

Start the bot:
```bash
npm start
```

## Project Structure

```
vybe_bot/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Helper functions
│   └── index.ts       # Entry point
├── prisma/            # Database schema
└── package.json       # Project configuration
```

## Tech Stack

- TypeScript
- Node.js
- Telegraf
- Prisma
- Supabase
- Solana Web3.js

## License

ISC