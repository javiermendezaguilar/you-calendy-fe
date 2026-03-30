const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adminDirs = [
  path.join(root, 'src', 'pages', 'Admin'),
  path.join(root, 'src', 'components', 'admin'),
];

const i18nPath = path.join(root, 'src', 'i18n.js');

function collectTcKeys(fileContent) {
  const keys = new Set();
  const regex = /tc\((['"])(.*?)\1\)/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    keys.add(match[2]);
  }
  return keys;
}

function readAllAdminFiles() {
  const keys = new Set();
  for (const dir of adminDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const full = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (e) {
        continue;
      }
      if (stat.isFile() && /\.(jsx?|tsx?)$/.test(file)) {
        const content = fs.readFileSync(full, 'utf8');
        for (const k of collectTcKeys(content)) keys.add(k);
      }
    }
  }
  return keys;
}

function extractEsKeys(i18nContent) {
  const esStart = i18nContent.indexOf("'es'");
  if (esStart === -1) return new Set();
  const translationStart = i18nContent.indexOf('translation', esStart);
  if (translationStart === -1) return new Set();
  const braceStart = i18nContent.indexOf('{', translationStart);
  if (braceStart === -1) return new Set();
  let depth = 0;
  let end = braceStart;
  for (let i = braceStart; i < i18nContent.length; i++) {
    const ch = i18nContent[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  const block = i18nContent.slice(braceStart, end + 1);
  const keyRegex = /\s['"]([^'\"]+)['"]\s*:\s*['"][^'\"]*['"]/g;
  const keys = new Set();
  let m;
  while ((m = keyRegex.exec(block)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

function main() {
  const usedKeys = readAllAdminFiles();
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  const esKeys = extractEsKeys(i18nContent);

  const missing = [...usedKeys].filter(k => !esKeys.has(k)).sort();
  console.log('Admin translation audit:');
  console.log(`Total keys used in admin: ${usedKeys.size}`);
  console.log(`Total Spanish keys available: ${esKeys.size}`);
  console.log(`Missing Spanish translations: ${missing.length}`);
  if (missing.length) {
    console.log('Missing keys:\n' + missing.map(k => ` - ${k}`).join('\n'));
  } else {
    console.log('No missing Spanish admin keys detected.');
  }
}

main();