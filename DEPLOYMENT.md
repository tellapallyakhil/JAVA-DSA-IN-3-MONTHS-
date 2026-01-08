# Deployment Guide for DSA 90-Day Tracker

This project is built with Next.js 16 (App Router), Tailwind CSS v4, and LocalStorage for state management.

## prerequisites
- Node.js 18+ installed.
- A GitHub account.
- A Vercel account.

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. **Push to GitHub**:
   - Initialize git if not already: `git init`
   - Add files: `git add .`
   - Commit: `git commit -m "Initial commit"`
   - Create a new repository on GitHub and push your code.

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click "Add New..." -> "Project".
   - Import your GitHub repository.

3. **Configure**:
   - Framework Preset: Next.js (Auto-detected).
   - Root Directory: `./` (default).
   - Build Command: `next build` (default).
   - Output Directory: `.next` (default).
   - **Environment Variables**: No env vars strictly required since data is static JSON.

4. **Deploy**:
   - Click "Deploy".
   - Vercel will build and deploy your site.

## Notes
- Since we use `LocalStorage`, user data persists only in their specific browser. Clearing cache will clear progress.
- To persist data across devices, you would need to add a backend (e.g., Supabase, Firebase) and Auth.
