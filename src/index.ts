#!/usr/bin/env node

import { program } from "commander";
import * as p from "@clack/prompts";
import { execa } from "execa";
import * as fs from "fs-extra";
import * as path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";
import {
  setupProject,
  enhanceNextApp,
  installDependencies,
  initializeGit,
} from "./setup.js";
import { showIntro, showSuccess } from "./ui.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name("create-next-pro")
  .description("Scaffold a production-ready Next.js 15 app")
  .argument("[project-name]", "Name of the project")
  .option("--with <integrations>", "Comma-separated list of integrations (stripe,supabase,ai)")
  .option("--minimal", "Minimal setup without optional integrations")
  .action(async (projectName, options) => {
    try {
      showIntro();

      // Get project name
      let name = projectName;
      if (!name) {
        const result = await p.text({
          message: "What is your project named?",
          placeholder: "my-app",
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return "Project name is required";
            }
            if (!/^[a-z0-9-]+$/.test(value)) {
              return "Project name must be lowercase and contain only letters, numbers, and hyphens";
            }
            return;
          },
        });

        if (p.isCancel(result)) {
          p.cancel("Operation cancelled.");
          process.exit(0);
        }
        name = result as string;
      }

      // Parse integrations
      let integrations: string[] = [];
      if (options.minimal) {
        integrations = [];
      } else if (options.with) {
        integrations = (options.with as string).split(",").map((i) => i.trim());
      } else {
        const selected = await p.multiselect({
          message: "Which integrations would you like to include?",
          options: [
            { value: "stripe", label: "Stripe (payments)" },
            { value: "supabase", label: "Supabase (database & auth)" },
            { value: "ai", label: "AI (Vercel AI SDK / OpenAI)" },
          ],
          required: false,
        });

        if (p.isCancel(selected)) {
          p.cancel("Operation cancelled.");
          process.exit(0);
        }
        integrations = selected as string[];
      }

      const spinner = p.spinner();
      spinner.start("Creating your Next.js project...");

      // Create Next.js app
      const projectPath = path.resolve(process.cwd(), name);
      
      await execa("npx", [
        "create-next-app@latest",
        name,
        "--typescript",
        "--tailwind",
        "--app",
        "--src-dir",
        "--import-alias",
        "@/*",
        "--use-yarn",
        "--yes",
        "--no-git",
      ], {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      spinner.stop("✅ Next.js app created");

      // Enhance the project
      spinner.start("Enhancing project with production configurations...");
      await enhanceNextApp(projectPath, integrations);
      spinner.stop("✅ Project enhanced");

      // Install dependencies
      spinner.start("Installing dependencies...");
      await installDependencies(projectPath, integrations);
      spinner.stop("✅ Dependencies installed");

      // Initialize git
      spinner.start("Initializing git repository...");
      await initializeGit(projectPath);
      spinner.stop("✅ Git initialized");

      showSuccess(name);
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse();

