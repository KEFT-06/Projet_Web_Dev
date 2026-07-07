nconst fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/@radix-ui\/([^@]+)@\d+\.\d+\.\d+/g, '@radix-ui/$1');
      fs.writeFileSync(filePath, content);
    }
  });
}

fixImports('./src/components/ui');
console.log('Import fixes completed');
