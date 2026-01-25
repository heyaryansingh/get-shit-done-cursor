#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Get version from package.json
const pkg = require('../package.json');

const banner = `
${cyan}   ██████╗ ███████╗██████╗
  ██╔════╝ ██╔════╝██╔══██╗
  ██║  ███╗███████╗██║  ██║
  ██║   ██║╚════██║██║  ██║
  ╚██████╔╝███████║██████╔╝
   ╚═════╝ ╚══════╝╚═════╝${reset}

  Get Shit Done ${dim}v${pkg.version}${reset}
  A meta-prompting, context engineering and spec-driven
  development system for Claude Code, Antigravity, and Cursor by TÂCHES.
`;

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasCursor = args.includes('--cursor');
const hasAntigravity = args.includes('--antigravity');

// Parse --config-dir argument
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    // Error if --config-dir is provided without a value or next arg is another flag
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  // Also handle --config-dir=value format
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) {
    return configDirArg.split('=')[1];
  }
  return null;
}
const explicitConfigDir = parseConfigDirArg();
const hasHelp = args.includes('--help') || args.includes('-h');

console.log(banner);

// Show help if requested
if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx get-shit-done-cursor [options]

  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}              Install globally (to config directory)
    ${cyan}-l, --local${reset}               Install locally (to ./.claude or ./.cursor)
    ${cyan}--cursor${reset}                  Install for Cursor IDE (default: Claude Code)
    ${cyan}--antigravity${reset}             Install for Antigravity (default: Claude Code)
    ${cyan}-c, --config-dir <path>${reset}   Specify custom config directory
    ${cyan}-h, --help${reset}                Show this help message

  ${yellow}Platform Differences:${reset}
    ${cyan}Claude Code${reset}  Uses colon syntax: /gsd:help, /gsd:plan-phase
    ${cyan}Cursor IDE${reset}   Uses slash syntax: /gsd/help, /gsd/plan-phase
    ${cyan}Antigravity${reset}  Uses slash syntax: /gsd/help, /gsd/plan-phase

  ${yellow}Examples:${reset}
    ${dim}# Install to default ~/.claude directory (Claude Code)${reset}
    npx get-shit-done-cursor --global

    ${dim}# Install to ~/.cursor directory (Cursor IDE)${reset}
    npx get-shit-done-cursor --cursor --global

    ${dim}# Install to custom config directory${reset}
    npx get-shit-done-cursor --global --config-dir ~/.claude-bc

    ${dim}# Using environment variable (Claude Code)${reset}
    CLAUDE_CONFIG_DIR=~/.claude-bc npx get-shit-done-cursor --global

    ${dim}# Using environment variable (Cursor)${reset}
    CURSOR_CONFIG_DIR=~/.cursor-custom npx get-shit-done-cursor --cursor --global

    ${dim}# Install to current project only${reset}
    npx get-shit-done-cursor --local
    npx get-shit-done-cursor --cursor --local

  ${yellow}Notes:${reset}
    The --config-dir option takes priority over environment variables.
    Use --cursor flag to install for Cursor IDE instead of Claude Code.
    Use --antigravity flag to install for Antigravity instead of Claude Code.
`);
  process.exit(0);
}

/**
 * Expand ~ to home directory (shell doesn't expand in env vars passed to node)
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Transform content for Cursor IDE
 * - Convert command syntax from gsd: to gsd/
 * - Convert /clear to "start a new chat" instructions
 */
function transformForCursor(content) {
  // Convert name: field in frontmatter (gsd:command -> gsd/command)
  content = content.replace(/^(name:\s*)gsd:/gm, '$1gsd/');

  // Convert documentation references (/gsd:command -> /gsd/command)
  content = content.replace(/\/gsd:/g, '/gsd/');

  // Convert /clear command references to Cursor-friendly instructions
  // Pattern 1: "/clear" as a standalone instruction
  content = content.replace(/`\/clear`/g, '`start a new chat`');

  // Pattern 2: Instructions mentioning /clear
  content = content.replace(/\/clear first/gi, 'Start a new chat first');
  content = content.replace(/Run \/clear/gi, 'Start a new chat');
  content = content.replace(/run \/clear/gi, 'start a new chat');

  // Pattern 3: Inline /clear mentions with specific context
  content = content.replace(/<sub>`\/clear` first → fresh context window<\/sub>/g,
    '<sub>Start a new chat → fresh context window</sub>');

  // Pattern 4: Debug workflow specific patterns
  content = content.replace(/Safe to \/clear/gi, 'Safe to start a new chat');
  content = content.replace(/Survives `\/clear`/g, 'Survives chat resets');
  content = content.replace(/across `\/clear`/g, 'across chat resets');

  return content;
}

/**
 * Recursively copy directory, replacing paths in .md files
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix, useSlashSyntax) {
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix, useSlashSyntax);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf8');

      // Replace config directory paths with the appropriate prefix for the target platform
      // Source files may use either ~/.cursor/ or ~/.claude/, install transforms for target
      content = content.replace(/~\/\.cursor\//g, pathPrefix);
      content = content.replace(/~\/\.claude\//g, pathPrefix);

      // For Cursor: transform command syntax and /clear references
      if (useSlashSyntax) {
        content = transformForCursor(content);
      }

      fs.writeFileSync(destPath, content);
    } else if (entry.name.endsWith('.json')) {
      // Copy JSON files with path replacement if needed
      let content = fs.readFileSync(srcPath, 'utf8');
      content = content.replace(/~\/\.cursor\//g, pathPrefix);
      content = content.replace(/~\/\.claude\//g, pathPrefix);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Install to the specified directory
 */
function install(isGlobal) {
  const src = path.join(__dirname, '..');

  // Determine target platform and directory
  const isCursor = hasCursor;
  const isAntigravity = hasAntigravity;
  let defaultDirName = '.claude';
  if (isCursor) defaultDirName = '.cursor';
  if (isAntigravity) defaultDirName = '.agent';

  // Priority: explicit --config-dir arg > platform-specific env var > default
  let configDir;
  if (explicitConfigDir) {
    configDir = expandTilde(explicitConfigDir);
  } else if (isCursor) {
    configDir = expandTilde(process.env.CURSOR_CONFIG_DIR);
  } else if (isAntigravity) {
    configDir = expandTilde(process.env.ANTIGRAVITY_CONFIG_DIR);
  } else {
    configDir = expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }

  // For Antigravity, always use local .agent directory (it's workspace-specific)
  let targetDir;
  if (isAntigravity) {
    targetDir = path.join(process.cwd(), '.agent');
  } else {
    const defaultGlobalDir = configDir || path.join(os.homedir(), defaultDirName);
    targetDir = isGlobal
      ? defaultGlobalDir
      : path.join(process.cwd(), defaultDirName);
  }

  const locationLabel = isAntigravity
    ? './.agent'
    : (isGlobal
      ? targetDir.replace(os.homedir(), '~')
      : targetDir.replace(process.cwd(), '.'));

  // Path prefix for file references - always use forward slashes for AI compatibility
  let pathPrefix;
  if (isAntigravity) {
    pathPrefix = './.agent/';
  } else {
    pathPrefix = isGlobal
      ? (configDir ? `${targetDir.replace(/\\/g, '/')}/` : `~/${defaultDirName}/`)
      : `./${defaultDirName}/`;
  }

  let platformName = 'Claude Code';
  if (isCursor) platformName = 'Cursor';
  if (isAntigravity) platformName = 'Antigravity';

  const commandSyntax = (isCursor || isAntigravity) ? '/gsd/help' : '/gsd:help';

  console.log(`  Installing to ${cyan}${locationLabel}${reset} (${platformName})\n`);

  // For Antigravity, workflows go in workflows/ (not commands/)
  const subDirName = isAntigravity ? 'workflows' : 'commands';
  const commandsDir = path.join(targetDir, subDirName);
  fs.mkdirSync(commandsDir, { recursive: true });

  // Copy commands/gsd with path replacement
  const gsdSrc = path.join(src, 'commands', 'gsd');
  const gsdDest = path.join(commandsDir, 'gsd');
  copyWithPathReplacement(gsdSrc, gsdDest, pathPrefix, isCursor || isAntigravity);
  console.log(`  ${green}✓${reset} Installed ${subDirName}/gsd`);

  // Copy get-shit-done skill with path replacement
  const skillSrc = path.join(src, 'get-shit-done');
  const skillDest = path.join(targetDir, 'get-shit-done');
  copyWithPathReplacement(skillSrc, skillDest, pathPrefix, isCursor || isAntigravity);
  console.log(`  ${green}✓${reset} Installed get-shit-done`);

  console.log(`
  ${green}Done!${reset} Launch ${platformName} and run ${cyan}${commandSyntax}${reset}.
`);
}

/**
 * Prompt for install location
 */
function promptLocation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const isCursor = hasCursor;
  const isAntigravity = hasAntigravity;
  let defaultDirName = '.claude';
  if (isCursor) defaultDirName = '.cursor';
  if (isAntigravity) defaultDirName = '.agent';

  let configDir;
  if (explicitConfigDir) {
    configDir = expandTilde(explicitConfigDir);
  } else if (isCursor) {
    configDir = expandTilde(process.env.CURSOR_CONFIG_DIR);
  } else if (isAntigravity) {
    configDir = expandTilde(process.env.ANTIGRAVITY_CONFIG_DIR);
  } else {
    configDir = expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }

  const globalPath = configDir || path.join(os.homedir(), defaultDirName);
  const globalLabel = globalPath.replace(os.homedir(), '~');
  let platformName = 'Claude Code';
  if (isCursor) platformName = 'Cursor';
  if (isAntigravity) platformName = 'Antigravity';

  console.log(`  ${yellow}Where would you like to install?${reset} (${platformName})

  ${cyan}1${reset}) Global ${dim}(${globalLabel})${reset} - available in all projects
  ${cyan}2${reset}) Local  ${dim}(./${defaultDirName})${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    const isGlobal = choice !== '2';
    install(isGlobal);
  });
}

// Main
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
} else if (explicitConfigDir && hasLocal) {
  console.error(`  ${yellow}Cannot use --config-dir with --local${reset}`);
  process.exit(1);
} else if (hasGlobal) {
  install(true);
} else if (hasLocal) {
  install(false);
} else {
  promptLocation();
}
