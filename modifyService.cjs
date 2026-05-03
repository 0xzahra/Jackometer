const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

  // Append it to all prompt template literals
  // This looks for let prompt = `...`; and const prompt = `...`;
  content = content.replace(/let\s+prompt\s*=\s*\`([\s\S]*?)\`;/g, 'let prompt = \`$1\\n${ANTI_SLOP_PROMPT}\`;');
  content = content.replace(/const\s+prompt\s*=\s*\`([\s\S]*?)\`;/g, 'const prompt = \`$1\\n${ANTI_SLOP_PROMPT}\`;');
  
  fs.writeFileSync('services/geminiService.ts', content);
  console.log('Modified geminiService.ts');
