# scaffold-next-pro

A CLI tool to scaffold production-ready Next.js 15 applications with TypeScript, tRPC, Supabase, Stripe, AI integrations, and more.

## Features

- 🚀 **Next.js 15** with App Router and Server Actions
- 📘 **TypeScript** + **Yarn** by default
- 🎨 **Tailwind CSS** + **shadcn/ui** + **Framer Motion**
- 🔌 **tRPC** setup for type-safe APIs
- 🗄️ **Supabase** integration (database & auth)
- 💳 **Stripe** integration for payments
- 🤖 **AI** integration (Vercel AI SDK / OpenAI)
- ✅ **Zod** for validation
- 🐳 **Docker** support
- ⚡ **Vercel** configuration
- 🔄 **GitHub Actions** CI/CD
- 🪝 **Husky** + **lint-staged** + **Commitlint** + **Commitizen**
- 📝 **ESLint** + **Prettier** configured

## Usage

```bash
npx scaffold-next-pro my-app
```

### Options

- `--with <integrations>`: Comma-separated list of integrations (e.g., `--with=stripe,supabase,ai`)
- `--minimal`: Minimal setup without optional integrations

### Interactive Mode

If you don't provide options, the CLI will prompt you for:
- Project name
- Integrations to include

## What Gets Generated

The CLI creates a fully configured Next.js project with:

```
my-app/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and integrations
│   │   ├── db.ts
│   │   ├── stripe.ts
│   │   ├── trpc.ts
│   │   ├── ai.ts
│   │   └── supabase.ts
│   ├── server/
│   │   └── trpc/        # tRPC setup
│   └── env.mjs          # Environment validation
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions CI
├── .husky/              # Git hooks
├── Dockerfile
├── vercel.json
└── .env.example
```

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run in development mode
yarn dev
```

## License

MIT

