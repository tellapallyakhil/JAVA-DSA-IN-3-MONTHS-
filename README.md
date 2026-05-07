<div align="center">

<!-- Animated SVG Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,50:6d28d9,100:4f46e5&height=220&section=header&text=DSAPrep&fontColor=ffffff&fontSize=80&fontAlignY=35&desc=Master%20DSA%20in%2090%20Days%20%7C%20Java%20%7C%20Patterns%20%7C%20Interviews&descSize=18&descAlignY=55&animation=fadeIn" width="100%"/>

<!-- Typing Animation -->
<a href="https://java-dsa-in-3-months.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=3000&pause=1000&color=7C3AED&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=100&lines=%F0%9F%9A%80+90-Day+DSA+Mastery+Roadmap;%F0%9F%92%BB+Built-in+Java+Compiler;%F0%9F%A4%96+AI+Mock+Interviews;%F0%9F%94%A5+14+Coding+Patterns+%7C+400%2B+Problems" alt="Typing SVG" />
</a>

<br/>

<!-- Badges Row 1 -->
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-7c3aed?style=for-the-badge&logoColor=white)](https://java-dsa-in-3-months.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

<!-- Badges Row 2 -->
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

<!-- Star & Fork Badges -->
<a href="https://github.com/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-/stargazers"><img src="https://img.shields.io/github/stars/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-?style=social&label=Star" alt="Stars"></a>
<a href="https://github.com/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-/network/members"><img src="https://img.shields.io/github/forks/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-?style=social&label=Fork" alt="Forks"></a>
<a href="https://github.com/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-/issues"><img src="https://img.shields.io/github/issues/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-?style=social" alt="Issues"></a>

</div>

<br/>

<!-- Animated Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## ⚡ What is DSAPrep?

> **DSAPrep** is a **full-stack, AI-powered platform** that transforms how students prepare for technical interviews. It combines a **structured 90-day roadmap**, **built-in Java compiler**, **AI mock interviews**, and **spaced repetition** — all in one beautiful, dark-themed interface.

<br/>

<div align="center">
<table>
<tr>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/calendar.png" width="48"/>
<br/><b>90-Day Roadmap</b>
<br/><sub>Day-by-day structured plan covering Arrays → Graphs → DP</sub>
</td>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/source-code.png" width="48"/>
<br/><b>CyberVM Compiler</b>
<br/><sub>Run Java code instantly with 3-engine fallback system</sub>
</td>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/robot-2.png" width="48"/>
<br/><b>AI Interviews</b>
<br/><sub>Practice with AI-powered mock technical interviews</sub>
</td>
</tr>
<tr>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/brain.png" width="48"/>
<br/><b>14 Coding Patterns</b>
<br/><sub>Master Sliding Window, Two Pointers, BFS/DFS & more</sub>
</td>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/combo-chart.png" width="48"/>
<br/><b>Progress Tracking</b>
<br/><sub>Study heatmap, streaks, calendar & completion stats</sub>
</td>
<td align="center" width="250">
<img src="https://img.icons8.com/fluency/96/lightning-bolt.png" width="48"/>
<br/><b>Spaced Repetition</b>
<br/><sub>Smart revision reminders to retain what you learn</sub>
</td>
</tr>
</table>
</div>

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend — Next.js 16 + React 19"]
        A[Dashboard] --> B[90-Day Roadmap]
        A --> C[CyberVM Compiler]
        A --> D[AI Interview Simulator]
        A --> E[Coding Patterns]
        A --> F[Progress Tracker]
    end

    subgraph Backend["⚙️ Backend"]
        G[Next.js API Routes]
        H[Compiler Load Balancer]
        I[AI Feedback Engine]
    end

    subgraph Services["☁️ External Services"]
        J[(Supabase — Auth + DB)]
        K[Piston API]
        L[Judge Service — Render]
        M[Wandbox API]
        N[OpenRouter AI]
    end

    Frontend --> Backend
    G --> J
    H --> K & L & M
    I --> N
    C --> H
    D --> I

    style Frontend fill:#1a1a2e,stroke:#7c3aed,color:#fff
    style Backend fill:#16213e,stroke:#6d28d9,color:#fff
    style Services fill:#0f3460,stroke:#4f46e5,color:#fff
```

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Features Deep Dive

### 📅 90-Day Structured Roadmap
| Phase | Days | Topics | Difficulty |
|:---:|:---:|---|:---:|
| 🟢 | 1–30 | Arrays, Strings, Linked Lists, Stacks, Queues | Foundation |
| 🟡 | 31–60 | Trees, Graphs, Heaps, Sorting, Searching | Intermediate |
| 🔴 | 61–90 | Dynamic Programming, Backtracking, Greedy, Tries | Advanced |

> Each day includes: **Concept → Video → Practice Problems → Quiz → Flashcards**

---

### 💻 CyberVM — Online Java Compiler

The built-in compiler features a **3-engine fallback system** with automatic failover and circuit breaker pattern:

```
┌─────────────────────────────────────────────────────┐
│                   CYBERVM ENGINE                     │
├──────────────┬──────────────┬────────────────────────┤
│  🥇 Piston   │  🥈 Judge    │  🥉 Wandbox            │
│  (Primary)   │  (Render)    │  (Fallback)            │
│  Always-on   │  Self-hosted │  OpenJDK 22            │
├──────────────┴──────────────┴────────────────────────┤
│  ⚡ In-Memory LRU Cache (200 entries, 1hr TTL)       │
│  🔄 Circuit Breaker (auto-skip broken engines)       │
│  🛡️ Rate Limiting (20 req/min per IP)                │
│  📊 Real-time Complexity Analysis (Time + Space)     │
└─────────────────────────────────────────────────────┘
```

**Compiler Features:**
- ⚡ **Auto-Indentation** — Smart Enter/Tab with brace matching
- 🔍 **Live Complexity Analysis** — O(n), O(log n), O(n²) detection in real-time
- 🧩 **Pattern Detection** — Identifies Binary Search, Sliding Window, etc.
- 🔐 **Security Sandbox** — Blocks dangerous code patterns (reflection, file I/O, etc.)

> **💡 Pro Tip:** Use `CTRL + ENTER` to quickly execute your code in CyberVM.


---

### 🤖 AI Interview Simulator
- Practice DSA problems with an **AI interviewer**
- Get real-time **hints**, **feedback**, and **code review**
- Powered by **LangChain + OpenRouter**
- Company-specific interview prep (Google, Amazon, Microsoft, etc.)

---

### 🎯 14 Coding Patterns

<div align="center">

| # | Pattern | Key Problems |
|:---:|---|---|
| 1 | 🪟 Sliding Window | Max Subarray, Longest Substring |
| 2 | 👆 Two Pointers | Container With Most Water, 3Sum |
| 3 | 🐢 Fast & Slow Pointers | Linked List Cycle, Happy Number |
| 4 | 📊 Merge Intervals | Insert Interval, Meeting Rooms |
| 5 | 🔄 Cyclic Sort | Missing Number, Find Duplicate |
| 6 | 🔗 In-place Linked List Reversal | Reverse Linked List, Swap Pairs |
| 7 | 🌳 Tree BFS | Level Order, Zigzag Traversal |
| 8 | 🌲 Tree DFS | Path Sum, Max Depth |
| 9 | 🏔️ Two Heaps | Find Median, Sliding Window Median |
| 10 | 📋 Subsets | Permutations, Combinations |
| 11 | 🔍 Modified Binary Search | Search Rotated Array |
| 12 | 🏆 Top K Elements | K Largest, K Frequent |
| 13 | 🔀 K-way Merge | Merge K Sorted Lists |
| 14 | 🧮 Dynamic Programming | Climbing Stairs, Coin Change |

</div>

---

### 📊 Progress Dashboard Features
- 🔥 **Study Heatmap** — GitHub-style contribution graph
- 📅 **Calendar View** — Track daily study sessions
- 🏆 **Dream Company Widget** — Set target companies & track progress
- ⏱️ **Pomodoro Timer** — Built-in study timer
- 📝 **Short Notes** — Quick reference notes per topic
- 🃏 **Flashcard Deck** — Spaced repetition flashcards
- 🔔 **Revision Reminders** — Smart recall notifications

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---:|---|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=next.js&logoColor=white&style=flat-square) ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black&style=flat-square) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) ![Java](https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white&style=flat-square) ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=flat-square) |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white&style=flat-square) |
| **Auth & DB** | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white&style=flat-square) ![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?logo=google&logoColor=white&style=flat-square) |
| **AI** | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white&style=flat-square) ![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-6366F1?style=flat-square) |
| **Compiler** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square) ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square) |
| **Hosting** | ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white&style=flat-square) ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white&style=flat-square) |

</div>

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## ⚡ Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- Supabase account (for auth)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tellapallyakhil/JAVA-DSA-IN-3-MONTHS-.git

# 2. Navigate to the project
cd JAVA-DSA-IN-3-MONTHS-

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase keys

# 5. Start the development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_key
JUDGE_SERVICE_URL=your_judge_service_url
```

### Judge Service (Compiler Backend)

```bash
# Deploy the Java compiler service
cd judge-service
docker build -t dsa-judge .
docker run -p 8000:8000 dsa-judge
```

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📁 Project Structure

```
📦 JAVA-DSA-IN-3-MONTHS-
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router pages
│   │   ├── 📂 api/                # API routes
│   │   │   ├── 📂 execute/        # Java compiler endpoint
│   │   │   └── 📂 interview/      # AI interview endpoint
│   │   ├── 📂 compiler/           # CyberVM Compiler page
│   │   ├── 📂 topics/             # DSA Topics page
│   │   ├── 📂 patterns/           # 14 Coding Patterns
│   │   ├── 📂 companies/          # Dream Companies
│   │   ├── 📂 focus/              # Topic Focus Mode
│   │   ├── 📂 interview/          # AI Mock Interview
│   │   ├── 📂 profile/            # User Dashboard
│   │   └── 📂 progress/           # Progress Tracker
│   ├── 📂 components/             # React components (21 files)
│   │   ├── CompilerContainer.tsx   # CyberVM with 3-engine fallback
│   │   ├── InterviewSimulator.tsx  # AI Interview (61KB of logic!)
│   │   ├── PatternsContainer.tsx   # 14 Pattern visualizations
│   │   ├── StudyHeatmap.tsx        # GitHub-style contribution graph
│   │   ├── DreamCompanyWidget.tsx  # Company-specific prep
│   │   ├── PomodoroTimer.tsx       # Study timer
│   │   ├── FlashcardDeck.tsx       # Spaced repetition cards
│   │   └── ...more
│   ├── 📂 data/                   # DSA content & problem data
│   ├── 📂 hooks/                  # Custom React hooks
│   ├── 📂 lib/                    # Utility functions
│   └── 📂 context/                # React context providers
├── 📂 judge-service/              # Self-hosted Java compiler
│   ├── main.py                    # FastAPI server
│   ├── executor.py                # Sandboxed Java executor
│   └── Dockerfile                 # Container config
└── 📂 public/                     # Static assets
```

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

<br/>

## 📬 Contact

<div align="center">

[![Gmail](https://img.shields.io/badge/Gmail-tellapallyakhil89@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tellapallyakhil89@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Tellapalli_Akhil_Kumar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tellapalli-akhil-kumar-188a0028a)
[![GitHub](https://img.shields.io/badge/GitHub-tellapallyakhil-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tellapallyakhil)

</div>

<br/>

<!-- Animated Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4f46e5,50:6d28d9,100:7c3aed&height=120&section=footer&animation=fadeIn" width="100%"/>

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/tellapallyakhil">Tellapalli Akhil Kumar</a></sub>
  <br/>
  <sub>⭐ Star this repo if it helped you!</sub>
</div>
