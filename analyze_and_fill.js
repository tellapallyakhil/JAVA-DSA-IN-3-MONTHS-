const fs = require('fs');
const path = require('path');

const daysPath = path.join(__dirname, 'src/data/days.json');
const questionsPath = path.join(__dirname, 'src/data/questions.json');

const days = JSON.parse(fs.readFileSync(daysPath, 'utf8'));
const allQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Helper to find questions by topic
const getQuestionsByTopic = (topic) => {
    // Flexible matching: exact match or partial match
    return allQuestions.filter(q =>
        (q.topic && q.topic.toLowerCase() === topic.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())) ||
        (q.topic && topic.toLowerCase().includes(q.topic.toLowerCase()))
    );
};

let questionsAdded = 0;
let daysModified = 0;
const lowDays = [];

days.forEach(day => {
    if (!day.aptitude || !day.reasoning) return;

    let currentCount = (day.aptitude.questionIds?.length || 0) + (day.reasoning.questionIds?.length || 0);

    // Only process if fewer than 10 questions
    if (currentCount < 10) {
        let addedToThisDay = false;

        // 1. Try to fill Aptitude first
        if (day.aptitude.topic) {
            const topicQs = getQuestionsByTopic(day.aptitude.topic);
            const currentIds = day.aptitude.questionIds || [];

            // Find finding questions NOT already used in this day
            const available = topicQs.filter(q => !currentIds.includes(q.id));

            // Add as many as needed/available
            available.forEach(q => {
                if ((currentCount < 10)) {
                    if (!day.aptitude.questionIds) day.aptitude.questionIds = [];
                    day.aptitude.questionIds.push(q.id);
                    currentCount++;
                    questionsAdded++;
                    addedToThisDay = true;
                }
            });
        }

        // 2. Try to fill Reasoning
        if (currentCount < 10 && day.reasoning.topic) {
            const topicQs = getQuestionsByTopic(day.reasoning.topic);
            const currentIds = day.reasoning.questionIds || [];

            // Find finding questions NOT already used in this day
            const available = topicQs.filter(q => !currentIds.includes(q.id));

            // Add as many as needed/available
            available.forEach(q => {
                if ((currentCount < 10)) {
                    if (!day.reasoning.questionIds) day.reasoning.questionIds = [];
                    day.reasoning.questionIds.push(q.id);
                    currentCount++;
                    questionsAdded++;
                    addedToThisDay = true;
                }
            });
        }

        if (addedToThisDay) daysModified++;

        // If STILL low, record it
        if (currentCount < 10) {
            lowDays.push({
                day: day.day,
                current: currentCount,
                aptTopic: day.aptitude.topic,
                resTopic: day.reasoning.topic
            });
        }
    }
});

fs.writeFileSync(daysPath, JSON.stringify(days, null, 4));

console.log(`✅ Filled questions for ${daysModified} days.`);
console.log(`✅ Total existing questions added: ${questionsAdded}`);
console.log(`\n⚠️ Still Low Days (Need Generation): ${lowDays.length}`);
if (lowDays.length > 0) {
    console.log("Samples:");
    lowDays.slice(0, 5).forEach(d => console.log(`  Day ${d.day}: ${d.current}/10 (Apt: ${d.aptTopic}, Res: ${d.resTopic})`));

    // Create a "Needs List" for the next step
    fs.writeFileSync('low_topic_report.json', JSON.stringify(lowDays, null, 4));
}
