import pc from "picocolors";
import * as p from "@clack/prompts";

export function showIntro() {
  console.log(
    pc.bold(
      pc.cyan(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║          ${pc.bold(pc.white("scaffold-next-pro"))}        ║
║                                                       ║
║     Production-ready Next.js 15 scaffolding tool     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`)
    )
  );
}

export function showSuccess(projectName: string) {
  console.log("\n");
  p.note(
    `Run the following commands to get started:\n\n  ${pc.cyan(`cd ${projectName}`)}\n  ${pc.cyan("yarn dev")}\n`,
    "Project ready!"
  );
  console.log("\n");
}

