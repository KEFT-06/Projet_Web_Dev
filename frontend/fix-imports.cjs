const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // Fix all imports with version suffixes like "package@version"
      content = content.replace(/"([^"]+)@\d+\.\d+\.\d+"/g, '"$1"');
      fs.writeFileSync(filePath, content);
    }
  });
}

fixImports('./src');
console.log('Import fixes completed for all files');
