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
  development system for Claude Code and Cursor by TÂCHES.
`;

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasCursor = args.includes('--cursor');

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
  console.log(`  ${yellow}Usage:${reset} npx get-shit-done-cc [options]

  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}              Install globally (to config directory)
    ${cyan}-l, --local${reset}               Install locally (to ./.claude or ./.cursor)
    ${cyan}--cursor${reset}                   Install for Cursor IDE (default: Claude Code)
    ${cyan}-c, --config-dir <path>${reset}   Specify custom config directory
    ${cyan}-h, --help${reset}                Show this help message

  ${yellow}Examples:${reset}
    ${dim}# Install to default ~/.claude directory (Claude Code)${reset}
    npx get-shit-done-cc --global

    ${dim}# Install to ~/.cursor directory (Cursor IDE)${reset}
    npx get-shit-done-cc --cursor --global

    ${dim}# Install to custom config directory${reset}
    npx get-shit-done-cc --global --config-dir ~/.claude-bc

    ${dim}# Using environment variable (Claude Code)${reset}
    CLAUDE_CONFIG_DIR=~/.claude-bc npx get-shit-done-cc --global

    ${dim}# Using environment variable (Cursor)${reset}
    CURSOR_CONFIG_DIR=~/.cursor-custom npx get-shit-done-cc --cursor --global

    ${dim}# Install to current project only${reset}
    npx get-shit-done-cc --local
    npx get-shit-done-cc --cursor --local

  ${yellow}Notes:${reset}
    The --config-dir option takes priority over environment variables.
    Use --cursor flag to install for Cursor IDE instead of Claude Code.
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
 * Recursively copy directory, replacing paths in .md files
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix, isCursor) {
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix, isCursor);
    } else if (entry.name.endsWith('.md')) {
      // Replace ~/.claude/ with the appropriate prefix in markdown files
      let content = fs.readFileSync(srcPath, 'utf8');
      if (isCursor) {
        // Replace ~/.claude/ with ~/.cursor/ for Cursor
        content = content.replace(/~\/\.claude\//g, pathPrefix);
      } else {
        // Keep ~/.claude/ for Claude Code
        content = content.replace(/~\/\.claude\//g, pathPrefix);
      }
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
  const defaultDirName = isCursor ? '.cursor' : '.claude';
  
  // Priority: explicit --config-dir arg > platform-specific env var > default
  let configDir;
  if (explicitConfigDir) {
    configDir = expandTilde(explicitConfigDir);
  } else if (isCursor) {
    configDir = expandTilde(process.env.CURSOR_CONFIG_DIR);
  } else {
    configDir = expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }
  
  const defaultGlobalDir = configDir || path.join(os.homedir(), defaultDirName);
  const targetDir = isGlobal
    ? defaultGlobalDir
    : path.join(process.cwd(), defaultDirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  // Path prefix for file references
  // Use actual path when config dir is set, otherwise use ~ shorthand
  const pathPrefix = isGlobal
    ? (configDir ? `${targetDir}/` : `~/${defaultDirName}/`)
    : `./${defaultDirName}/`;

  const platformName = isCursor ? 'Cursor' : 'Claude Code';
  console.log(`  Installing to ${cyan}${locationLabel}${reset} (${platformName})\n`);

  // Create commands directory
  const commandsDir = path.join(targetDir, 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });

  // Copy commands/gsd with path replacement
  const gsdSrc = path.join(src, 'commands', 'gsd');
  const gsdDest = path.join(commandsDir, 'gsd');
  copyWithPathReplacement(gsdSrc, gsdDest, pathPrefix, isCursor);
  console.log(`  ${green}✓${reset} Installed commands/gsd`);

  // Copy get-shit-done skill with path replacement
  const skillSrc = path.join(src, 'get-shit-done');
  const skillDest = path.join(targetDir, 'get-shit-done');
  copyWithPathReplacement(skillSrc, skillDest, pathPrefix, isCursor);
  console.log(`  ${green}✓${reset} Installed get-shit-done`);

  console.log(`
  ${green}Done!${reset} Launch ${platformName} and run ${cyan}/gsd:help${reset}.
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
  const defaultDirName = isCursor ? '.cursor' : '.claude';
  
  let configDir;
  if (explicitConfigDir) {
    configDir = expandTilde(explicitConfigDir);
  } else if (isCursor) {
    configDir = expandTilde(process.env.CURSOR_CONFIG_DIR);
  } else {
    configDir = expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }
  
  const globalPath = configDir || path.join(os.homedir(), defaultDirName);
  const globalLabel = globalPath.replace(os.homedir(), '~');
  const platformName = isCursor ? 'Cursor' : 'Claude Code';

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
