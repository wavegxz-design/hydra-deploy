<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:06b6d4&height=220&section=header&text=HYDRA&fontSize=90&fontColor=ffffff&fontAlignY=38&desc=Deploy%20System%20v5.0&descAlignY=60&descColor=a5b4fc&animation=fadeIn" width="100%"/>

<br>

[![Version](https://img.shields.io/badge/version-5.0.0-6366f1?style=for-the-badge&labelColor=0d1117)](https://github.com/wavegxz-design/hydra-deploy/releases)
[![License](https://img.shields.io/badge/license-MIT-8b5cf6?style=for-the-badge&labelColor=0d1117)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-06b6d4?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0d1117)](https://typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-18+-10b981?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=0d1117)](https://nodejs.org)
[![PRs](https://img.shields.io/badge/PRs-welcome-f97316?style=for-the-badge&labelColor=0d1117)](CONTRIBUTING.md)
[![Contributors](https://img.shields.io/badge/contributors-30+-ec4899?style=for-the-badge&labelColor=0d1117)](https://github.com/wavegxz-design/hydra-deploy/graphs/contributors)

<br>

> **Multi-platform deployment CLI with auto-detection, self-healing error recovery,**
> **social network management and professional README generation.**

<br>

[**Overview**](#-overview) · [**Features**](#-features) · [**Quick Start**](#-quick-start) · [**Platforms**](#-supported-platforms) · [**Architecture**](#-architecture) · [**Contributing**](#-contributing) · [**Author**](#-author)

<br>

</div>

---

## 🐉 Overview

**Hydra** is a professional deployment CLI built for developers who need a reliable, self-healing, multi-platform release pipeline — without the complexity of enterprise CI/CD tools.

It detects your project stack automatically, manages deployments across 6+ platforms with retry logic, handles errors with registered recovery strategies, and generates production-ready documentation — all from a single interactive terminal interface.

```
One command. Any stack. Any platform.
```

<br>

---

## ✨ Features

<table>
<thead>
<tr>
<th align="center">Module</th>
<th align="center">Feature</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">🤖</td>
<td align="center"><strong>Auto-Detect</strong></td>
<td>Scans your project and identifies tech stack (Next.js, React, Vue, Python, Go, Rust, Docker…)</td>
</tr>
<tr>
<td align="center">🚀</td>
<td align="center"><strong>Multi-Deploy</strong></td>
<td>Deploys to Vercel, Netlify, Cloudflare Workers, GitHub Pages, Docker Hub, PythonAnywhere</td>
</tr>
<tr>
<td align="center">🛡️</td>
<td align="center"><strong>AUTOFIX</strong></td>
<td>4-step recovery chain: retry → clean artifacts → rotate credentials → fallback platform</td>
</tr>
<tr>
<td align="center">📊</td>
<td align="center"><strong>Dashboard</strong></td>
<td>Interactive terminal UI with real-time deploy status, logs and diagnostics</td>
</tr>
<tr>
<td align="center">📝</td>
<td align="center"><strong>README Gen</strong></td>
<td>Generates professional README with badges, contact info, structure and contributing guide</td>
</tr>
<tr>
<td align="center">🌐</td>
<td align="center"><strong>Social Manager</strong></td>
<td>Manages 10 social network profiles from a single config</td>
</tr>
<tr>
<td align="center">📋</td>
<td align="center"><strong>Structured Logger</strong></td>
<td>Leveled logging with bounded buffer — no memory leaks, full error history</td>
</tr>
</tbody>
</table>

<br>

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/wavegxz-design/hydra-deploy.git
cd hydra-deploy

# Install
npm install

# Configure — add your platform tokens
cp .env.example .env

# Run
npm run hydra
# or: npx ts-node src/index.ts /path/to/your/project
```

<br>

---

## 🚀 Supported Platforms

<table>
<thead>
<tr>
<th align="center">Platform</th>
<th align="center">Type</th>
<th align="center">Auto-Detect</th>
<th>Env Required</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">⚡ <strong>Cloudflare Workers</strong></td>
<td align="center">Web / Edge</td>
<td align="center">✅</td>
<td><code>CLOUDFLARE_API_TOKEN</code></td>
</tr>
<tr>
<td align="center">▲ <strong>Vercel</strong></td>
<td align="center">Web</td>
<td align="center">✅ Next.js</td>
<td><code>VERCEL_TOKEN</code></td>
</tr>
<tr>
<td align="center">🌍 <strong>Netlify</strong></td>
<td align="center">Web</td>
<td align="center">✅ React/Vue</td>
<td><code>NETLIFY_AUTH_TOKEN</code></td>
</tr>
<tr>
<td align="center">🐙 <strong>GitHub Pages</strong></td>
<td align="center">Static</td>
<td align="center">✅ Always</td>
<td><code>GITHUB_TOKEN</code></td>
</tr>
<tr>
<td align="center">🐳 <strong>Docker Hub</strong></td>
<td align="center">Container</td>
<td align="center">✅ Dockerfile</td>
<td><code>DOCKER_USERNAME</code> <code>DOCKER_PASSWORD</code></td>
</tr>
<tr>
<td align="center">🐍 <strong>PythonAnywhere</strong></td>
<td align="center">API</td>
<td align="center">✅ Python</td>
<td><code>PA_API_KEY</code></td>
</tr>
</tbody>
</table>

<br>

---

## 🛡️ AUTOFIX Recovery Chain

When a deployment fails, Hydra doesn't crash — it runs a structured recovery sequence:

```
┌─────────────────────────────────────────────────────────────┐
│                  HYDRA RECOVERY CHAIN                       │
├──────┬──────────────────────────────────────────────────────┤
│  01  │  Retry with exponential backoff (configurable)       │
│  02  │  Clean build artifacts and rebuild from scratch      │
│  03  │  Check and restore missing env vars from cache       │
│  04  │  Skip platform and continue with remaining targets   │
└──────┴──────────────────────────────────────────────────────┘
```

Every failure is timestamped and logged. Nothing is swallowed silently.

<br>

---

## 🏗️ Architecture

```
hydra-deploy/
│
├── src/
│   └── index.ts              ← Single-file architecture
│                               ├── Logger         (bounded buffer, leveled)
│                               ├── HydraError     (typed, recoverable flag)
│                               ├── RecoveryRegistry (explicit strategies)
│                               ├── detectProject  (reads real files)
│                               ├── deployPlatform (real exec + retry)
│                               ├── generateReadme (clean Markdown)
│                               ├── runDiagnostics (system checks)
│                               └── main()         (interactive loop)
│
├── hydra.config.json         ← Project + author config (auto-generated)
├── tsconfig.json             ← TypeScript strict config
├── package.json
├── .env                      ← Platform API tokens (git-ignored)
├── CONTRIBUTING.md
└── README.md
```

<br>

---

## ⚙️ Configuration

`hydra.config.json` is auto-generated on first run:

```json
{
  "version": "5.0.0",
  "author": {
    "name"    : "krypthane",
    "github"  : "github.com/wavegxz-design",
    "telegram": "t.me/Skrylakk",
    "email"   : "Workernova@proton.me",
    "site"    : "krypthane.workernova.workers.dev"
  },
  "errorHandling": {
    "retryAttempts": 3,
    "retryDelay"   : 2000,
    "autoRecovery" : true
  },
  "socialNetworks": []
}
```

<br>

---

## 🛣️ Roadmap

**v5.1**
- [ ] Railway · Fly.io · Render adapter modules
- [ ] Real Cloudflare Workers API integration via `wrangler`
- [ ] Slack / Telegram notification on deploy complete

**v6.0**
- [ ] Plugin system — drop `.ts` files into `plugins/`
- [ ] Web dashboard (local UI served on `localhost:4000`)
- [ ] Multi-project batch deployments
- [ ] Deploy history with rollback

> 💡 Suggest a feature → [open an issue](https://github.com/wavegxz-design/hydra-deploy/issues/new)

<br>

---

## 🤝 Contributing

Hydra is designed for **30+ open source contributors**.

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Conventional commit format
git commit -m "feat: add Railway deploy adapter"

# Push → PR
git push origin feat/your-feature
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines on error handling patterns, TypeScript conventions and PR requirements.

<br>

---

## 🔗 Related Projects

<table>
<tr>
<td>
<a href="https://github.com/wavegxz-design/NEXORA-TOOLKIT"><strong>NEXORA-TOOLKIT</strong></a>
<br><br>Advanced modular ADB toolkit for Android device management. Multi-distro installer, WiFi ADB, data extraction, diagnostics.
</td>
</tr>
<tr>
<td>
<a href="https://github.com/wavegxz-design/recon-kit"><strong>recon-kit</strong></a>
<br><br>Senior-level modular reconnaissance toolkit. Distro auto-detection, AUTOFIX engine, 6 recon modules, plugin system.
</td>
</tr>
</table>

<br>

---

## ⚖️ Legal

Distributed under the MIT License. Use responsibly.

<br>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:6366f1,100:06b6d4&height=140&section=footer" width="100%"/>

<br>

**Built with focus by [krypthane](https://github.com/wavegxz-design)**

[![Site](https://img.shields.io/badge/krypthane.workernova.workers.dev-6366f1?style=flat-square&logo=cloudflare&logoColor=white)](https://krypthane.workernova.workers.dev)
[![Telegram](https://img.shields.io/badge/Telegram-6366f1?style=flat-square&logo=telegram&logoColor=white)](https://t.me/Skrylakk)
[![Email](https://img.shields.io/badge/Proton_Mail-6366f1?style=flat-square&logo=protonmail&logoColor=white)](mailto:Workernova@proton.me)
[![GitHub](https://img.shields.io/badge/wavegxz--design-6366f1?style=flat-square&logo=github&logoColor=white)](https://github.com/wavegxz-design)

<br>

<sub>⭐ Drop a star if Hydra saved you time</sub>

</div>
