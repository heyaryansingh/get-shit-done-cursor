const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = '/mnt/c/Users/jrm22n/.cursor/commands/gsd';
const RULES_DIR = '/mnt/c/Users/jrm22n/.cursor/rules';

const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));

for (const file of files) {
  const name = file.replace('.md', '');
  const content = fs.readFileSync(path.join(COMMANDS_DIR, file), 'utf8');

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.log(`SKIP (no frontmatter): ${file}`);
    continue;
  }

  const frontmatter = fmMatch[1];
  const body = fmMatch[2].trim();

  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const desc = descMatch ? descMatch[1].trim() : `GSD ${name} command`;

  const cursorDescription = `When user types /gsd/${name} - ${desc}`;

  // Convert @ file references to Read instructions
  const convertedBody = body.replace(
    /@(\/mnt\/c\/Users\/jrm22n\/\.cursor\/[^\s<\n]+)/g,
    'Read file: `$1`'
  );

  const mdcContent = `---
description: "${cursorDescription}"
globs:
alwaysApply: false
---

# /gsd/${name}

${convertedBody}
`;

  const outPath = path.join(RULES_DIR, `gsd-${name}.mdc`);
  fs.writeFileSync(outPath, mdcContent);
  console.log(`OK: ${file} -> gsd-${name}.mdc`);
}

console.log(`\nDone. ${files.length} commands converted.`);
