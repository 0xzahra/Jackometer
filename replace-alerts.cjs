const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let importNeeded = false;

  if (content.match(/\balert\(/) || content.match(/window\.alert\(/)) {
    content = content.replace(/window\.alert\(/g, 'customAlert(');
    content = content.replace(/\balert\(/g, 'customAlert(');
    importNeeded = true;
  }

  if (content.match(/window\.confirm\(/)) {
    content = content.replace(/window\.confirm\(/g, 'await customConfirm(');
    importNeeded = true;
  }

  if (importNeeded && content !== originalContent) {
    if (!content.includes("from '../lib/dialogs'")) {
       const importStatement = "import { customAlert, customConfirm } from '../lib/dialogs';\n";
       const lines = content.split('\n');
       let lastImportIndex = -1;
       for (let i = 0; i < lines.length; i++) {
         if (lines[i].startsWith('import ')) {
           lastImportIndex = i;
         }
       }
       if (lastImportIndex !== -1) {
         lines.splice(lastImportIndex + 1, 0, importStatement);
         content = lines.join('\n');
       } else {
         content = importStatement + content;
       }
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
  }
});
