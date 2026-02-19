const fs = require('fs');
const path = require('path');

const daysPath = path.join(__dirname, 'src/data/days.json');
const questionsPath = path.join(__dirname, 'src/data/questions.json');
const reportPath = path.join(__dirname, 'low_topic_report.json');

const days = JSON.parse(fs.readFileSync(daysPath, 'utf8'));
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Utility to get random int
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generator Templates
const generators = {
    "Pipes & Cisterns": () => {
        const a = rnd(10, 30);
        const b = rnd(10, 30);
        // 1/a + 1/b = (a+b)/ab -> time = ab/(a+b)
        const ans = ((a * b) / (a + b)).toFixed(2);
        return {
            question: `Pipe A can fill a tank in ${a} hours and Pipe B in ${b} hours. If both are opened together, how long will it take?`,
            options: [`${ans} hours`, `${(ans * 1.2).toFixed(2)} hours`, `${(ans * 0.8).toFixed(2)} hours`, `${(ans * 1.5).toFixed(2)} hours`],
            answer: `${ans} hours`,
            explanation: `1/${a} + 1/${b} = ${a + b}/${a * b}. Time = ${a * b}/${a + b} = ${ans}.`
        };
    },
    "Mixtures": () => {
        const total = rnd(20, 100);
        const ratioA = rnd(1, 5);
        const ratioB = rnd(1, 5);
        const partA = (total * ratioA) / (ratioA + ratioB);
        return {
            question: `In a mixture of ${total} liters, milk and water are in ratio ${ratioA}:${ratioB}. How much milk is there?`,
            options: [`${partA.toFixed(1)} L`, `${(partA + 5).toFixed(1)} L`, `${(partA - 2).toFixed(1)} L`, `${(partA + 2).toFixed(1)} L`],
            answer: `${partA.toFixed(1)} L`,
            explanation: `Total parts = ${ratioA + ratioB}. Milk = ${total} * ${ratioA}/${ratioA + ratioB} = ${partA}.`
        };
    },
    "Boats & Streams": () => {
        const boat = rnd(10, 20);
        const stream = rnd(2, 5);
        const downstream = boat + stream;
        return {
            question: `A boat speed is ${boat} km/hr and stream speed is ${stream} km/hr. Find downstream speed.`,
            options: [`${downstream} km/hr`, `${boat - stream} km/hr`, `${boat} km/hr`, `${stream} km/hr`],
            answer: `${downstream} km/hr`,
            explanation: `Downstream = Boat + Stream = ${boat} + ${stream} = ${downstream}.`
        };
    },
    "Partnership": () => {
        const invA = rnd(1000, 5000) * 10;
        const invB = rnd(1000, 5000) * 10;
        return {
            question: `A invests Rs. ${invA} and B invests Rs. ${invB}. Ratio of profits?`,
            options: [`${invA / 10}:${invB / 10}`, `${invA}:${invB}`, "1:1", "2:3"],
            answer: `${invA}:${invB}`, // Simplified logic for template
            explanation: `Profit ratio matches investment ratio: ${invA}:${invB}.`
        };
    },
    "Trains": () => {
        const len = rnd(100, 500);
        const speed = rnd(36, 108); // kmph for easy conversion
        // speed m/s = speed * 5/18
        const time = len / (speed * 5 / 18);
        return {
            question: `Train of length ${len}m runs at ${speed} km/hr. Time to pass a pole?`,
            options: [`${time.toFixed(1)} sec`, `${(time + 5).toFixed(1)} sec`, `${(time - 2).toFixed(1)} sec`, "10 sec"],
            answer: `${time.toFixed(1)} sec`,
            explanation: `Speed = ${speed} * 5/18 m/s. Time = Dist/Speed.`
        };
    },
    "Geometry": () => {
        const r = rnd(5, 20);
        const area = (3.14159 * r * r).toFixed(2);
        return {
            question: `Find area of circle with radius ${r}.`,
            options: [`${area}`, `${(area * 1.1).toFixed(2)}`, `${(area * 0.9).toFixed(2)}`, "100"],
            answer: `${area}`,
            explanation: `Area = pi * r^2 = 3.14 * ${r}*${r}.`
        };
    },
    "Mensuration": () => {
        const s = rnd(5, 15);
        const vol = s * s * s;
        return {
            question: `Volume of cube with side ${s}?`,
            options: [`${vol}`, `${vol + 10}`, `${vol - 5}`, `${vol * 2}`],
            answer: `${vol}`,
            explanation: `Volume = side^3 = ${s}^3 = ${vol}.`
        };
    },
    "Compound Interest": () => {
        const P = rnd(1000, 5000);
        const R = 10;
        const T = 2;
        const A = Math.floor(P * Math.pow(1.1, 2));
        return {
            question: `Amount on Rs. ${P} at 10% CI for 2 years?`,
            options: [`Rs. ${A}`, `Rs. ${A + 50}`, `Rs. ${A - 20}`, `Rs. ${P + 100}`],
            answer: `Rs. ${A}`,
            explanation: `A = P(1 + R/100)^T.`
        };
    },
    "Stocks & Shares": () => {
        const face = 100;
        const market = rnd(120, 200);
        const shares = rnd(10, 50);
        const cost = market * shares;
        return {
            question: `Cost to buy ${shares} shares of FV 100 at MV ${market}?`,
            options: [`${cost}`, `${cost + 100}`, `${cost - 50}`, `${shares * 100}`],
            answer: `${cost}`,
            explanation: `Cost = MV * Shares = ${market} * ${shares}.`
        };
    },
    // Generic reasoning filler
    "Logic": () => {
        const series = [2, 4, 6, 8, 10];
        const next = 12;
        return {
            question: "Find the next number: 2, 4, 6, 8, 10, ?",
            options: ["12", "14", "11", "13"],
            answer: "12",
            explanation: "+2 series."
        };
    },
    "Unknown": () => {
        const x = rnd(1, 50);
        const y = rnd(1, 50);
        return {
            question: `If ${x} + ${y} = ?`,
            options: [`${x + y}`, `${x + y + 1}`, `${x + y - 1}`, "0"],
            answer: `${x + y}`,
            explanation: "Simple addition."
        };
    }
};

const getGen = (topic) => {
    // Map topics to generators
    if (topic.includes("Pipe")) return generators["Pipes & Cisterns"];
    if (topic.includes("Mixture")) return generators["Mixtures"];
    if (topic.includes("Boat")) return generators["Boats & Streams"];
    if (topic.includes("Partner")) return generators["Partnership"];
    if (topic.includes("Train")) return generators["Trains"];
    if (topic.includes("Geometry")) return generators["Geometry"];
    if (topic.includes("Mensuration")) return generators["Mensuration"];
    if (topic.includes("Interest")) return generators["Compound Interest"];
    if (topic.includes("Stock")) return generators["Stocks & Shares"];
    if (topic.includes("Reasoning") || topic.includes("Puzzle") || topic.includes("Image") || topic.includes("Statement") || topic.includes("Cube")) return generators["Logic"];
    return generators["Unknown"];
};

let questionsAdded = [];
let idCounter = 5000;

// Helper to get random EXISTING questions for "Mixed" days
const allIds = questions.map(q => q.id);
const getRandomExisting = (count) => {
    const res = [];
    for (let i = 0; i < count; i++) {
        res.push(pick(allIds));
    }
    return res;
};

report.forEach(item => {
    const dayObj = days.find(d => d.day === item.day);
    if (!dayObj) return;

    const missing = 10 - item.current;
    if (missing <= 0) return;

    // Distribute missing between Apt and Res
    const aptNeeded = Math.ceil(missing / 2);
    const resNeeded = Math.floor(missing / 2);

    // 1. Aptitude
    if (item.aptTopic.includes("Mixed") || item.aptTopic.includes("All") || item.aptTopic.includes("Review") || item.aptTopic.includes("Celebration")) {
        // Use existing random
        const picked = getRandomExisting(aptNeeded);
        dayObj.aptitude.questionIds.push(...picked);
    } else {
        // Generate
        const gen = getGen(item.aptTopic);
        for (let i = 0; i < aptNeeded; i++) {
            const q = gen();
            q.id = `q_boost_day${item.day}_apt_${i}`;
            q.topic = item.aptTopic;
            q.companies = ["Generic"];
            questionsAdded.push(q);
            if (!dayObj.aptitude.questionIds) dayObj.aptitude.questionIds = [];
            dayObj.aptitude.questionIds.push(q.id);
        }
    }

    // 2. Reasoning
    if (item.resTopic.includes("Mixed") || item.resTopic.includes("All") || item.resTopic.includes("Review") || item.resTopic.includes("Celebration") || item.resTopic.includes("Weak")) {
        // Use existing random
        const picked = getRandomExisting(aptNeeded); // use same count
        dayObj.reasoning.questionIds.push(...picked);
    } else {
        // Generate (often falls back to Logic/Series if complex visual topic)
        const gen = getGen(item.resTopic);
        for (let i = 0; i < resNeeded; i++) {
            const q = gen();
            q.id = `q_boost_day${item.day}_res_${i}`;
            // If topic was image-based, change it to "Logical Reasoning" to avoid mismatch with text Q
            q.topic = (item.resTopic.includes("Image") || item.resTopic.includes("Cutting")) ? "Logical Reasoning" : item.resTopic;
            q.companies = ["Generic"];
            questionsAdded.push(q);
            if (!dayObj.reasoning.questionIds) dayObj.reasoning.questionIds = [];
            dayObj.reasoning.questionIds.push(q.id);
        }
    }
});

// Save
const finalQuestions = [...questions, ...questionsAdded];
fs.writeFileSync(questionsPath, JSON.stringify(finalQuestions, null, 4));
fs.writeFileSync(daysPath, JSON.stringify(days, null, 4));

console.log(`✅ Added ${questionsAdded.length} NEW generated questions.`);
console.log(`✅ Updated days.json with mixed/new questions.`);
