const fs = require('fs');
const path = require('path');

const patternsPath = path.join(__dirname, 'src', 'data', 'patterns.json');
const content = fs.readFileSync(patternsPath, 'utf8');
const lines = content.split('\n');

const titles = ['Minimum Window Substring', 'Merge k Sorted Lists'];

titles.forEach(title => {
    console.log(`Searching for: ${title}`);
    lines.forEach((line, index) => {
        if (line.includes(title)) {
            console.log(` - Line ${index + 1}: ${line.trim()}`);
        }
    });
});
