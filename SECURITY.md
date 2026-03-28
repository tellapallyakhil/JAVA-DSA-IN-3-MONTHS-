# 🔐 Security Policy

<div align="center">

![Security](https://img.shields.io/badge/Security-Priority_1-red?style=for-the-badge&logo=shield&logoColor=white)
![Status](https://img.shields.io/badge/Status-Actively_Maintained-brightgreen?style=for-the-badge)

</div>

## 📋 Table of Contents

- [Supported Versions](#-supported-versions)
- [Reporting a Vulnerability](#-reporting-a-vulnerability)
- [Security Architecture](#-security-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [Compiler Sandbox Security](#-compiler-sandbox-security)
- [API Security](#-api-security)
- [Data Privacy](#-data-privacy)
- [Security Best Practices](#-security-best-practices)

---

## ✅ Supported Versions

| Version | Supported | Notes |
|:---:|:---:|---|
| `main` (latest) | ✅ | Actively maintained and patched |
| Previous commits | ❌ | Please update to the latest version |

---

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, **please report it responsibly**.

### How to Report

| Method | Details |
|---|---|
| 📧 **Email** | [tellapallyakhil89@gmail.com](mailto:tellapallyakhil89@gmail.com) |
| 🔒 **Subject Line** | `[SECURITY] DSAPrep Vulnerability Report` |

### What to Include

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Impact assessment** (what could be exploited)
- **Suggested fix** (if any)

### Response Timeline

| Phase | Timeframe |
|:---:|---|
| ✅ Acknowledgment | Within **48 hours** |
| 🔍 Initial Assessment | Within **5 days** |
| 🛠️ Patch Release | Within **14 days** (critical) |

> ⚠️ **Please do NOT open public GitHub issues for security vulnerabilities.**

---

## 🏗️ Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Google OAuth  │  │ HTTPS Only   │  │ No PII in Local  │   │
│  │ (Supabase)   │  │ (Vercel TLS) │  │ Storage          │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   NEXT.JS API LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Rate Limiting │  │ Input Valid. │  │ Code Scanning    │   │
│  │ 20 req/min   │  │ 50KB limit   │  │ Regex Patterns   │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  JUDGE SERVICE (Docker)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Non-root User│  │ JVM Sandbox  │  │ Temp Dir Auto-   │   │
│  │ (judge)      │  │ -Xmx128m     │  │ Cleanup          │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication & Authorization

### OAuth 2.0 via Supabase

- **Provider**: Google OAuth 2.0 (via Supabase Auth)
- **Token Storage**: HTTP-only cookies managed by `@supabase/ssr`
- **Session Handling**: Server-side session validation on protected routes
- **Refresh Tokens**: Automatically rotated by Supabase

### Security Measures

| Measure | Implementation |
|---|---|
| PKCE Flow | Enabled (Proof Key for Code Exchange) |
| Cookie Security | `HttpOnly`, `Secure`, `SameSite=Lax` |
| Session Isolation | Per-user sessions, no shared state |
| Redirect Validation | Whitelisted callback URLs in Supabase Dashboard |

---

## 🛡️ Compiler Sandbox Security

The built-in Java compiler executes user-submitted code. This is the highest-risk surface and is protected by **multiple layers of defense**:

### Layer 1: Code Scanning (API Route)

Before code reaches the execution engine, it is scanned for dangerous patterns:

```
❌ BLOCKED PATTERNS:
├── Runtime.exec()          → Prevents shell command execution
├── ProcessBuilder          → Prevents process spawning  
├── System.exit()           → Prevents JVM termination
├── java.io.File            → Prevents filesystem access
├── java.net.Socket         → Prevents network connections
├── java.net.URL            → Prevents HTTP requests
├── ClassLoader             → Prevents dynamic class loading
├── Reflection API          → Prevents security bypass via reflection
├── java.lang.Thread        → Prevents thread manipulation
└── SecurityManager         → Prevents security policy changes
```

### Layer 2: Input Validation

| Check | Limit |
|---|---|
| Code Size | Max **50 KB** |
| Must contain `class` | Basic syntax validation |
| Must contain `main` method | Entry point validation |

### Layer 3: JVM Resource Limits

```bash
# Memory: Hard cap at 128MB
java -Xmx128m Main.java

# Timeout: 10 second execution limit
timeout 10s java Main

# Temp Directory: Auto-cleaned after each execution
tempfile.TemporaryDirectory()  # Python-managed cleanup
```

### Layer 4: Docker Container Security

```dockerfile
# Non-root execution user
RUN useradd -r -s /bin/false judge
USER judge

# Headless JDK (minimal attack surface)
openjdk-17-jdk-headless

# No unnecessary packages or tools
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
```

### Layer 5: Circuit Breaker

If an execution engine fails **3 times**, it is automatically disabled for **5 minutes** to prevent cascading failures and resource exhaustion.

---

## 🌐 API Security

### Rate Limiting

```
📊 Rate Limit Configuration:
├── Limit: 20 requests per minute per IP
├── Window: 60-second sliding window
├── Storage: In-memory Map (per instance)
└── Response: HTTP 429 Too Many Requests
```

### Execution Cache (LRU)

| Parameter | Value |
|---|---|
| Max Entries | 200 |
| TTL | 1 hour |
| Eviction | LRU (Least Recently Used) |
| Key | SHA-256 hash of `code + stdin` |
| Purpose | Prevents redundant executions |

### Timeout Configuration

| Engine | Timeout | Reason |
|---|---|---|
| Judge (Render) | 30s | Accounts for cold-start latency |
| Wandbox (Fallback) | 25s | External API with variable latency |

---

## 🔒 Data Privacy

### What We Store

| Data | Location | Purpose |
|---|---|---|
| User profile (name, email, avatar) | Supabase | Authentication |
| Study progress & completions | Supabase | Progress tracking |
| Topic focus preferences | Local Storage | Personalization |

### What We Do NOT Store

- ❌ User-submitted code (processed in-memory only)
- ❌ Compiler output/results
- ❌ IP addresses or fingerprints
- ❌ Payment or billing information
- ❌ Third-party tracking data

### Third-Party Services

| Service | Data Shared | Purpose |
|---|---|---|
| Supabase | Auth tokens, user profile | Authentication & DB |
| Vercel | Request metadata | Hosting |
| Wandbox | Submitted code (in-transit) | Code execution |
| OpenRouter | Interview prompts | AI mock interviews |

> All third-party communications use **HTTPS/TLS encryption**.

---

## 📝 Security Best Practices

### For Contributors

1. **Never commit secrets** — Use `.env.local` for API keys
2. **Validate all input** — Never trust client-side data
3. **Use parameterized queries** — Prevent SQL injection via Supabase SDK
4. **Review dependencies** — Run `npm audit` regularly
5. **Follow least privilege** — Use minimal permissions everywhere

### For Users

1. **Use strong Google account** — Your OAuth is only as secure as your Google account
2. **Clear sessions** — Log out on shared computers
3. **Report issues** — If you notice unusual behavior, contact us

### Environment Variables

```bash
# ⚠️ NEVER commit these to version control
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
OPENROUTER_API_KEY=***
JUDGE_SERVICE_URL=***
```

> The `.gitignore` file ensures `.env.local` is never tracked.

---

## 🔄 Security Updates

| Date | Update | Severity |
|---|---|---|
| 2026-03-28 | Removed Piston API (HTTP 401, now requires paid auth) | Medium |
| 2026-03-28 | Added code scanning & blocked dangerous Java patterns | High |
| 2026-03-28 | Added JVM memory limits (-Xmx128m) & execution timeouts | High |
| 2026-03-28 | Docker: Switched to non-root user & headless JDK | Medium |
| 2026-03-28 | Added rate limiting (20 req/min per IP) | Medium |
| 2026-03-28 | Added LRU cache with TTL to prevent abuse | Low |

---

<div align="center">

**🔐 Security is a continuous process. We actively monitor and patch vulnerabilities.**

[![Report Vulnerability](https://img.shields.io/badge/Report_Vulnerability-Email_Us-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tellapallyakhil89@gmail.com?subject=[SECURITY]%20DSAPrep%20Vulnerability%20Report)

</div>
