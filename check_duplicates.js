const fs = require('fs');
const path = require('path');

const patternsPath = path.join(__dirname, 'src', 'data', 'patterns.json');
const patternsData = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));

let totalProblems = 0;
const problemTitles = new Set();
const duplicates = [];

const problemArrays = ['easyProblems', 'hardProblems', 'warmupProblems', 'mediumProblems'];

patternsData.forEach(pattern => {
    problemArrays.forEach(arrName => {
        if (pattern[arrName]) {
            pattern[arrName].forEach(problem => {
                totalProblems++;
                const key = `${problem.title.toLowerCase().trim()}`;
                if (problemTitles.has(key)) {
                    duplicates.push(`${pattern.title} [${arrName}]: ${problem.title}`);
                } else {
                    problemTitles.add(key);
                }
            });
        }
    });
});

console.log(`Total Problems Checked: ${totalProblems}`);
console.log(`Unique Problems: ${problemTitles.size}`);
console.log(`Duplicates found: ${duplicates.length}`);

if (duplicates.length > 0) {
    console.log('Duplicate list:');
    duplicates.forEach(d => console.log(` - ${d}`));
} else {
    console.log('No duplicates found! Great job.');
}
