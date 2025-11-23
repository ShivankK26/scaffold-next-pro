import fs from "fs-extra";
import * as path from "path";

export function generatePackageJson(basePackageJson: any, integrations: string[]) {
  const scripts = {
    ...basePackageJson.scripts,
    "type-check": "tsc --noEmit",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky install",
    commit: "cz",
  };

  const dependencies = {
    ...basePackageJson.dependencies,
    zod: "^3.23.8",
    "@tanstack/react-query": "^5.62.11",
    "@trpc/server": "^10.45.2",
    "@trpc/client": "^10.45.2",
    "@trpc/react-query": "^10.45.2",
    "@trpc/next": "^10.45.2",
    superjson: "^2.2.2",
    "framer-motion": "^11.15.0",
  };

  if (integrations.includes("supabase")) {
    dependencies["@supabase/supabase-js"] = "^2.47.10";
  }

  if (integrations.includes("stripe")) {
    dependencies["stripe"] = "^17.4.0";
  }

  if (integrations.includes("ai")) {
    dependencies["ai"] = "^3.4.36";
    dependencies["openai"] = "^4.73.1";
  }

  const devDependencies = {
    ...basePackageJson.devDependencies,
    "@types/node": "^22.10.5",
    prettier: "^3.4.2",
    "eslint-config-prettier": "^9.1.0",
    husky: "^9.1.7",
    "lint-staged": "^15.2.11",
    "@commitlint/cli": "^19.6.0",
    "@commitlint/config-conventional": "^19.6.0",
    commitizen: "^4.3.1",
    "cz-conventional-changelog": "^3.3.0",
  };

  return {
    ...basePackageJson,
    scripts,
    dependencies,
    devDependencies,
    config: {
      commitizen: {
        path: "cz-conventional-changelog",
      },
    },
  };
}

export function generateEnvExample(integrations: string[]) {
  let content = `# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

`;

  if (integrations.includes("supabase")) {
    content += `# Supabase
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
# Example test credentials (replace with your actual values):
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDE5OTIwMCwiZXhwIjoxOTU1Nzc1MjAwfQ.example_anon_key_replace_with_your_actual_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMTk5MjAwLCJleHAiOjE5NTU3NzUyMDB9.example_service_role_key_replace_with_your_actual_key

`;
  }

  if (integrations.includes("stripe")) {
    content += `# Stripe
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
# Test keys (safe to use in development):
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
# Webhook secret (get from Stripe Dashboard > Developers > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890abcdefghijklmnopqrstuvwxyz

`;
  }

  if (integrations.includes("ai")) {
    content += `# OpenAI
# Get your API key from: https://platform.openai.com/api-keys
# Example test key format (replace with your actual key):
OPENAI_API_KEY=sk-test-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz

`;
  }

  return content;
}

export function generateEnvMjs(integrations: string[]) {
  let schema = `import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
`;

  if (integrations.includes("supabase")) {
    schema += `  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
`;
  }

  if (integrations.includes("stripe")) {
    schema += `  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
`;
  }

  if (integrations.includes("ai")) {
    schema += `  OPENAI_API_KEY: z.string().startsWith("sk-"),
`;
  }

  schema += `});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
`;

  if (integrations.includes("supabase")) {
    schema += `  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
`;
  }

  if (integrations.includes("stripe")) {
    schema += `  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
`;
  }

  if (integrations.includes("ai")) {
    schema += `  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
`;
  }

  schema += `});
`;

  return schema;
}

export function generateDockerfile() {
  return `FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`;
}

export function generateDockerignore() {
  return `Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env
.env.local
.env*.local
.next
.git
.gitignore
`;
}

export function generateVercelJson() {
  return `{
  "buildCommand": "yarn build",
  "devCommand": "yarn dev",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
`;
}

export function generateGitHubActions() {
  return `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn build
`;
}

export function generateLintStagedConfig() {
  return `{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
`;
}

export function generateCommitlintConfig() {
  return `module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert",
      ],
    ],
  },
};
`;
}

export async function generateTRPCSetup(projectPath: string) {
  const trpcPath = path.join(projectPath, "src/server/trpc");
  await fs.ensureDir(trpcPath);

  // Context
  await fs.writeFile(
    path.join(trpcPath, "context.ts"),
    `import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
`
  );

  // TRPC instance
  await fs.writeFile(
    path.join(trpcPath, "trpc.ts"),
    `import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
`
  );

  // Root router
  await fs.writeFile(
    path.join(trpcPath, "root.ts"),
    `import { router } from "./trpc";
import { publicProcedure } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return {
      greeting: "Hello from tRPC!",
    };
  }),
});

export type AppRouter = typeof appRouter;
`
  );

  // API route handler
  const apiPath = path.join(projectPath, "src/app/api/trpc/[trpc]");
  await fs.ensureDir(apiPath);
  await fs.writeFile(
    path.join(apiPath, "route.ts"),
    `import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
`
  );

  // Client setup
  await fs.writeFile(
    path.join(projectPath, "src/lib/trpc.ts"),
    `import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/trpc/root";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});
`
  );
}

export async function generateSupabaseSetup(projectPath: string) {
  await fs.writeFile(
    path.join(projectPath, "src/lib/supabase.ts"),
    `import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
`
  );
}

export async function generateStripeSetup(projectPath: string) {
  await fs.writeFile(
    path.join(projectPath, "src/lib/stripe.ts"),
    `import Stripe from "stripe";
import { env } from "@/env.mjs";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
`
  );

  // Example webhook route
  const webhookPath = path.join(projectPath, "src/app/api/webhooks/stripe");
  await fs.ensureDir(webhookPath);
  await fs.writeFile(
    path.join(webhookPath, "route.ts"),
    `import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        break;
      default:
        console.log(\`Unhandled event type \${event.type}\`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: \`Webhook Error: \${error}\` },
      { status: 400 }
    );
  }
}
`
  );
}

export async function generateAISetup(projectPath: string) {
  await fs.writeFile(
    path.join(projectPath, "src/lib/ai.ts"),
    `import { openai } from "ai/openai";
import { env } from "@/env.mjs";

export const openaiClient = new openai({
  apiKey: env.OPENAI_API_KEY,
});

export { streamText, generateText } from "ai";
`
  );

  // Example AI route
  const aiPath = path.join(projectPath, "src/app/api/ai/chat");
  await fs.ensureDir(aiPath);
  await fs.writeFile(
    path.join(aiPath, "route.ts"),
    `import { streamText } from "ai";
import { openaiClient } from "@/lib/ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openaiClient("gpt-4"),
    messages,
  });

  return result.toDataStreamResponse();
}
`
  );
}

export async function generateLibFiles(
  projectPath: string,
  integrations: string[]
) {
  // Base db.ts (placeholder for future database setup)
  await fs.writeFile(
    path.join(projectPath, "src/lib/db.ts"),
    `// Database client setup
// Add your database client here (e.g., Prisma, Drizzle, etc.)
`
  );
}

export async function generateExamplePages(
  projectPath: string,
  integrations: string[]
) {
  // Update root layout to include tRPC provider (always included)
  const layoutPath = path.join(projectPath, "src/app/layout.tsx");
  if (await fs.pathExists(layoutPath)) {
    let layout = await fs.readFile(layoutPath, "utf-8");
    
    // Add tRPC provider
    if (!layout.includes("TRPCProvider")) {
      // Add import
      if (layout.includes('import type { Metadata } from "next";')) {
        layout = layout.replace(
          'import type { Metadata } from "next";',
          `import type { Metadata } from "next";
import { TRPCProvider } from "@/components/providers/trpc-provider";`
        );
      } else if (layout.includes('import { Metadata } from "next";')) {
        layout = layout.replace(
          'import { Metadata } from "next";',
          `import { Metadata } from "next";
import { TRPCProvider } from "@/components/providers/trpc-provider";`
        );
      }
      
      // Wrap body content
      const bodyMatch = layout.match(/<body([^>]*)>([\s\S]*?)<\/body>/);
      if (bodyMatch) {
        const bodyAttrs = bodyMatch[1];
        const bodyContent = bodyMatch[2];
        layout = layout.replace(
          bodyMatch[0],
          `<body${bodyAttrs}>
        <TRPCProvider>${bodyContent}
        </TRPCProvider>
      </body>`
        );
      }
      
      await fs.writeFile(layoutPath, layout);
    }
  }

  // Create TRPC provider component (always included)
  const providersPath = path.join(projectPath, "src/components/providers");
  await fs.ensureDir(providersPath);
  await fs.writeFile(
    path.join(providersPath, "trpc-provider.tsx"),
    `"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, trpcClient } from "@/lib/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
`
  );

  // Create example page
  const examplePath = path.join(projectPath, "src/app/example");
  await fs.ensureDir(examplePath);
  
  let exampleContent = `"use client";

import { trpc } from "@/lib/trpc";

`;

  if (integrations.includes("stripe")) {
    exampleContent += `import { stripe } from "@/lib/stripe";

`;
  }

  if (integrations.includes("supabase")) {
    exampleContent += `import { supabase } from "@/lib/supabase";

`;
  }

  if (integrations.includes("ai")) {
    exampleContent += `import { generateText } from "@/lib/ai";

`;
  }

  exampleContent += `export default function ExamplePage() {
  const { data, isLoading } = trpc.hello.useQuery();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Example Page</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p className="text-lg">{data?.greeting}</p>
      )}
    </div>
  );
}
`;

  await fs.writeFile(
    path.join(examplePath, "page.tsx"),
    exampleContent
  );
}

