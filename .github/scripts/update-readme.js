const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, '../../README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

const enUsPath = path.join(__dirname, '../../en-US.json');
const enUsData = JSON.parse(fs.readFileSync(enUsPath, 'utf8'));
const totalWords = Object.keys(enUsData).length;

const tableRegex = /\| Language\s+\|.*?\|[\s\S]*?(?=\n\n|\n#|$)/;
const match = readme.match(tableRegex);

if (!match) {
    console.error("Table not found in README.md");
    process.exit(1);
}

const tableText = match[0];
const lines = tableText.split('\n');

const newLines = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (i < 2 || !line.startsWith('|')) {
        newLines.push(lines[i]);
        continue;
    }

    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 5) {
        newLines.push(lines[i]);
        continue;
    }

    const language = parts[1];
    const fileLink = parts[2];
    const fileMatch = fileLink.match(/\[(.*?)\]\((.*?)\)/);
    
    if (!fileMatch) {
        newLines.push(lines[i]);
        continue;
    }
    
    const fileName = fileMatch[2];
    const filePath = path.join(__dirname, '../../', fileName);
    
    let translatedWords = 0;
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            translatedWords = Object.keys(data).length;
        } catch (e) {
            console.error(`Error reading ${fileName}:`, e);
        }
    }
    
    const percentage = totalWords === 0 ? 0 : Math.round((translatedWords / totalWords) * 100);
    
    const newWordCol = `${translatedWords}/${totalWords}`;
    const newPercentCol = `${percentage}%`;
    
    const langCol = language.padEnd(21);
    const fileCol = fileLink.padEnd(24);
    const wordColStr = newWordCol.padEnd(7);
    const percentColStr = newPercentCol.padEnd(10);
    
    newLines.push(`| ${langCol} | ${fileCol} | ${wordColStr} | ${percentColStr} |`);
}

const newTableText = newLines.join('\n');
readme = readme.replace(tableText, newTableText);

fs.writeFileSync(readmePath, readme, 'utf8');
console.log("README.md updated successfully.");
