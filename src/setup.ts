import * as fs from "fs-extra";
import * as path from "path";
import { execa } from "execa";
import {
  generatePackageJson,
  generateEnvExample,
  generateEnvMjs,
  generateDockerfile,
  generateDockerignore,
  generateVercelJson,
  generateGitHubActions,
  generateLintStagedConfig,
  generateCommitlintConfig,
  generateTRPCSetup,
  generateSupabaseSetup,
  generateStripeSetup,
  generateAISetup,
  generateExamplePages,
  generateLibFiles,
} from "./templates.js";

export async function enhanceNextApp(
  projectPath: string,
  integrations: string[]
) {
  // Update package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);
  const enhancedPackageJson = generatePackageJson(packageJson, integrations);
  await fs.writeJson(packageJsonPath, enhancedPackageJson, { spaces: 2 });

  // Update next.config to enable standalone output for Docker
  await updateNextConfig(projectPath);

  // Create lib directory
  const libPath = path.join(projectPath, "src/lib");
  await fs.ensureDir(libPath);

  // Generate lib files
  await generateLibFiles(projectPath, integrations);

  // Generate env files
  await fs.writeFile(
    path.join(projectPath, ".env.example"),
    generateEnvExample(integrations)
  );
  await fs.writeFile(
    path.join(projectPath, "src/env.mjs"),
    generateEnvMjs(integrations)
  );

  // Generate Docker files
  await fs.writeFile(
    path.join(projectPath, "Dockerfile"),
    generateDockerfile()
  );
  await fs.writeFile(
    path.join(projectPath, ".dockerignore"),
    generateDockerignore()
  );

  // Generate vercel.json
  await fs.writeFile(
    path.join(projectPath, "vercel.json"),
    generateVercelJson()
  );

  // Generate GitHub Actions
  const workflowsPath = path.join(projectPath, ".github/workflows");
  await fs.ensureDir(workflowsPath);
  await fs.writeFile(
    path.join(workflowsPath, "ci.yml"),
    generateGitHubActions()
  );

  // Generate Husky config
  await fs.ensureDir(path.join(projectPath, ".husky"));
  await fs.writeFile(
    path.join(projectPath, ".husky/pre-commit"),
    "yarn lint-staged\n"
  );
  await fs.writeFile(
    path.join(projectPath, ".husky/commit-msg"),
    "yarn commitlint --edit $1\n"
  );

  // Generate config files
  await fs.writeFile(
    path.join(projectPath, ".lintstagedrc.json"),
    generateLintStagedConfig()
  );
  await fs.writeFile(
    path.join(projectPath, "commitlint.config.js"),
    generateCommitlintConfig()
  );

  // Generate integration-specific setups
  // tRPC is always included as it's part of the base stack
  await generateTRPCSetup(projectPath);

  if (integrations.includes("supabase")) {
    await generateSupabaseSetup(projectPath);
  }

  if (integrations.includes("stripe")) {
    await generateStripeSetup(projectPath);
  }

  if (integrations.includes("ai")) {
    await generateAISetup(projectPath);
  }

  // Generate example pages
  await generateExamplePages(projectPath, integrations);

  // Update ESLint config
  await updateESLintConfig(projectPath);

  // Add Prettier config
  await fs.writeFile(
    path.join(projectPath, ".prettierrc"),
    JSON.stringify({
      semi: true,
      trailingComma: "es5",
      singleQuote: false,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    }, null, 2)
  );

  // Create components/ui directory for shadcn
  await fs.ensureDir(path.join(projectPath, "src/components/ui"));
  await fs.writeFile(
    path.join(projectPath, "src/components/ui/.gitkeep"),
    ""
  );
}

async function updateESLintConfig(projectPath: string) {
  const eslintConfigPath = path.join(projectPath, ".eslintrc.json");
  if (await fs.pathExists(eslintConfigPath)) {
    const config = await fs.readJson(eslintConfigPath);
    config.extends = [
      ...(config.extends || []),
      "next/core-web-vitals",
      "prettier",
    ];
    await fs.writeJson(eslintConfigPath, config, { spaces: 2 });
  }
}

async function updateNextConfig(projectPath: string) {
  const nextConfigPath = path.join(projectPath, "next.config.ts");
  const nextConfigMjsPath = path.join(projectPath, "next.config.mjs");
  const nextConfigJsPath = path.join(projectPath, "next.config.js");

  // Try TypeScript config first
  if (await fs.pathExists(nextConfigPath)) {
    let config = await fs.readFile(nextConfigPath, "utf-8");
    if (!config.includes("output: 'standalone'")) {
      // Add standalone output for Docker
      config = config.replace(
        /const nextConfig = \{/,
        `const nextConfig = {
  output: 'standalone',`
      );
      await fs.writeFile(nextConfigPath, config);
    }
  } else if (await fs.pathExists(nextConfigMjsPath)) {
    let config = await fs.readFile(nextConfigMjsPath, "utf-8");
    if (!config.includes("output: 'standalone'")) {
      config = config.replace(
        /const nextConfig = \{/,
        `const nextConfig = {
  output: 'standalone',`
      );
      await fs.writeFile(nextConfigMjsPath, config);
    }
  } else if (await fs.pathExists(nextConfigJsPath)) {
    let config = await fs.readFile(nextConfigJsPath, "utf-8");
    if (!config.includes("output: 'standalone'")) {
      config = config.replace(
        /const nextConfig = \{/,
        `const nextConfig = {
  output: 'standalone',`
      );
      await fs.writeFile(nextConfigJsPath, config);
    }
  }
}

export async function installDependencies(
  projectPath: string,
  integrations: string[]
) {
  const deps: string[] = [
    "zod",
    "@tanstack/react-query",
    "@trpc/server",
    "@trpc/client",
    "@trpc/react-query",
    "@trpc/next",
    "superjson",
    "framer-motion",
  ];

  const devDeps: string[] = [
    "@types/node",
    "prettier",
    "eslint-config-prettier",
    "husky",
    "lint-staged",
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "commitizen",
    "cz-conventional-changelog",
  ];

  if (integrations.includes("supabase")) {
    deps.push("@supabase/supabase-js");
  }

  if (integrations.includes("stripe")) {
    deps.push("stripe");
  }

  if (integrations.includes("ai")) {
    deps.push("ai", "openai");
  }

  // Install dependencies
  if (deps.length > 0) {
    await execa("yarn", ["add", ...deps], {
      cwd: projectPath,
      stdio: "inherit",
    });
  }

  if (devDeps.length > 0) {
    await execa("yarn", ["add", "-D", ...devDeps], {
      cwd: projectPath,
      stdio: "inherit",
    });
  }

  // Setup Husky (only if .husky doesn't exist)
  const huskyPath = path.join(projectPath, ".husky");
  if (!(await fs.pathExists(huskyPath))) {
    try {
      await execa("yarn", ["husky", "init"], {
        cwd: projectPath,
        stdio: "inherit",
      });
    } catch (error) {
      // Husky init might fail, but we've already created the hooks manually
      console.warn("Warning: Husky initialization had issues, but hooks are already set up");
    }
  }
}

export async function initializeGit(projectPath: string) {
  try {
    await execa("git", ["init"], { cwd: projectPath });
    await execa("git", ["add", "."], { cwd: projectPath });
    await execa(
      "git",
      ["commit", "-m", "chore: initial commit from create-next-pro"],
      { cwd: projectPath }
    );
  } catch (error) {
    // Git might not be available, that's okay
    console.warn("Warning: Could not initialize git repository");
  }
}

