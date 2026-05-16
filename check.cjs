const fs = require('fs');
const content = fs.readFileSync('components/Community.tsx', 'utf8');

const { parse } = require('@babel/parser');
try {
  parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });
  console.log('No syntax errors found by Babel.');
} catch (e) {
  console.log('Babel Error:', e);
}
