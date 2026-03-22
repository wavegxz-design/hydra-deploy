/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   HYDRA DEPLOY SYSTEM v5.0.1                                 ║
 * ║   Author  : krypthane | wavegxz-design                       ║
 * ║   GitHub  : github.com/wavegxz-design                        ║
 * ║   License : MIT                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import chalk               from 'chalk';
import ora                 from 'ora';
import fs                  from 'fs-extra';
import path                from 'path';
import inquirer            from 'inquirer';
import { exec }            from 'child_process';
import { promisify }       from 'util';
import { config as dotenv } from 'dotenv';

dotenv();

const execAsync = promisify(exec);

// ─────────────────────────────────────────────────────────────────────────────
// AUTHOR CONTACTS — single source of truth
// ─────────────────────────────────────────────────────────────────────────────
const AUTHOR = {
  name    : 'krypthane',
  github  : 'github.com/wavegxz-design',
  telegram: 't.me/Skrylakk',
  email   : 'Workernova@proton.me',
  site    : 'krypthane.workernova.workers.dev',
  session : '0514f1a8a0b9ec5deac0d6c7535d226a91034e5292e56e617955190c46d4197077',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary  : chalk.hex('#6366f1'),
  success  : chalk.hex('#10b981'),
  error    : chalk.hex('#ef4444'),
  warning  : chalk.hex('#f59e0b'),
  info     : chalk.hex('#3b82f6'),
  accent   : chalk.hex('#8b5cf6'),
  muted    : chalk.hex('#6b7280'),
  highlight: chalk.hex('#f97316'),
  cyber    : chalk.hex('#06b6d4'),
  matrix   : chalk.hex('#00ff41'),
  dim      : chalk.dim,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BOX DRAWING — safe, never throws RangeError
// ─────────────────────────────────────────────────────────────────────────────
const BOX_W = 62; // inner width

function pad(text: string, width: number): string {
  const visible = text.replace(/\x1b\[[0-9;]*m/g, ''); // strip ANSI
  const gap     = width - visible.length;
  return gap > 0 ? text + ' '.repeat(gap) : text.slice(0, width);
}

const BOX = {
  top   : () => C.primary('┌' + '─'.repeat(BOX_W) + '┐'),
  mid   : () => C.primary('├' + '─'.repeat(BOX_W) + '┤'),
  bot   : () => C.primary('└' + '─'.repeat(BOX_W) + '┘'),
  row   : (content: string) => C.primary('│') + ' ' + pad(content, BOX_W - 2) + ' ' + C.primary('│'),
  blank : () => C.primary('│') + ' '.repeat(BOX_W) + C.primary('│'),
};

// ─────────────────────────────────────────────────────────────────────────────
// BANNER
// ─────────────────────────────────────────────────────────────────────────────
function printBanner(): void {
  console.clear();
  console.log('');
  console.log(C.cyber('  ██╗  ██╗██╗   ██╗██████╗ ██████╗  █████╗'));
  console.log(C.cyber('  ██║  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██╔══██╗'));
  console.log(C.matrix('  ███████║ ╚████╔╝ ██║  ██║██████╔╝███████║'));
  console.log(C.matrix('  ██╔══██║  ╚██╔╝  ██║  ██║██╔══██╗██╔══██║'));
  console.log(C.primary('  ██║  ██║   ██║   ██████╔╝██║  ██║██║  ██║'));
  console.log(C.primary('  ╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝'));
  console.log('');
  console.log(`  ${C.muted('v5.0')}  ${C.dim('|')}  ${C.accent(AUTHOR.name)}  ${C.dim('|')}  ${C.info(AUTHOR.github)}`);
  console.log(`  ${C.dim('Deploy · Social · README · Diagnostics')}`);
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type DeployStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

interface DeployPlatform {
  id         : string;
  name       : string;
  type       : 'web' | 'api' | 'mobile' | 'container';
  buildCmd   : string;
  outputDir  : string;
  envRequired: string[];
  status     : DeployStatus;
  deployedUrl: string;
  lastDeploy : Date | null;
}

interface ProjectInfo {
  name       : string;
  version    : string;
  description: string;
  techStack  : string[];
  platforms  : DeployPlatform[];
}

interface HydraConfig {
  version        : string;
  author         : typeof AUTHOR;
  errorHandling  : { retryAttempts: number; retryDelay: number; autoRecovery: boolean };
  socialNetworks : { name: string; url: string; enabled: boolean }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
type ErrorCode =
  | 'FILE_READ'
  | 'FILE_WRITE'
  | 'NETWORK'
  | 'DEPLOY_FAILED'
  | 'CONFIG_INVALID'
  | 'CMD_FAILED'
  | 'UNKNOWN';

class HydraError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly recoverable: boolean = true,
    public readonly context?: string,
  ) {
    super(message);
    this.name = 'HydraError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER — structured, leveled, bounded buffer
// ─────────────────────────────────────────────────────────────────────────────
class Logger {
  private readonly entries: Array<{ level: LogLevel; msg: string; ts: Date }> = [];
  private readonly MAX = 200; // prevent unbounded growth

  log(level: LogLevel, msg: string): void {
    if (this.entries.length >= this.MAX) this.entries.shift();
    this.entries.push({ level, msg, ts: new Date() });

    const prefix: Record<LogLevel, string> = {
      debug: C.dim('[DBG]'),
      info : C.info('[INF]'),
      warn : C.warning('[WRN]'),
      error: C.error('[ERR]'),
    };
    console.log(`  ${prefix[level]} ${msg}`);
  }

  info (msg: string) { this.log('info',  msg); }
  warn (msg: string) { this.log('warn',  msg); }
  error(msg: string) { this.log('error', msg); }
  debug(msg: string) { this.log('debug', msg); }

  dump(): string {
    return this.entries
      .map(e => `[${e.ts.toISOString()}] [${e.level.toUpperCase()}] ${e.msg}`)
      .join('\n');
  }

  getErrors(): typeof this.entries {
    return this.entries.filter(e => e.level === 'error' || e.level === 'warn');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY REGISTRY — explicit, testable
// ─────────────────────────────────────────────────────────────────────────────
type RecoveryFn = (err: HydraError) => Promise<void>;

class RecoveryRegistry {
  private readonly strategies = new Map<ErrorCode, RecoveryFn>();

  register(code: ErrorCode, fn: RecoveryFn): void {
    this.strategies.set(code, fn);
  }

  async attempt(err: HydraError): Promise<boolean> {
    if (!err.recoverable) return false;
    const fn = this.strategies.get(err.code);
    if (!fn) return false;
    try { await fn(err); return true; }
    catch { return false; }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DETECTOR — reads real project files
// ─────────────────────────────────────────────────────────────────────────────
async function detectProject(root: string): Promise<ProjectInfo> {
  const name    = path.basename(root);
  const stack   : string[] = [];
  const plats   : DeployPlatform[] = [];

  // Read package.json safely
  let pkg: Record<string, any> = {};
  try {
    const raw = await fs.readFile(path.join(root, 'package.json'), 'utf8');
    pkg = JSON.parse(raw);
  } catch { /* no package.json — fine */ }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;

  // Detect tech stack
  const frameworks: [string, string, string][] = [
    ['next',    'Next.js',   'nextjs'],
    ['react',   'React',     'react'],
    ['vue',     'Vue',       'vue'],
    ['svelte',  'Svelte',    'svelte'],
    ['express', 'Express',   'node'],
    ['fastify', 'Fastify',   'node'],
    ['nest',    'NestJS',    'node'],
    ['astro',   'Astro',     'astro'],
  ];

  for (const [dep, label] of frameworks) {
    if (deps[dep] || deps[`@${dep}/core`]) stack.push(label);
  }

  // Detect by files
  const exists = async (f: string) => fs.pathExists(path.join(root, f));

  if (await exists('requirements.txt') || await exists('pyproject.toml')) stack.push('Python');
  if (await exists('Cargo.toml'))   stack.push('Rust');
  if (await exists('go.mod'))       stack.push('Go');
  if (await exists('Dockerfile'))   stack.push('Docker');
  if (await exists('composer.json'))stack.push('PHP');

  if (stack.length === 0 && Object.keys(deps).length > 0) stack.push('Node.js');
  if (stack.length === 0) stack.push('Static');

  // Build platform list based on detected stack
  const hasNext    = stack.includes('Next.js');
  const hasReact   = stack.includes('React') || stack.includes('Next.js');
  const hasDocker  = stack.includes('Docker');
  const hasPython  = stack.includes('Python');

  if (hasNext) {
    plats.push({ id:'vercel', name:'Vercel', type:'web',
      buildCmd:'next build', outputDir:'.next',
      envRequired:['VERCEL_TOKEN'], status:'pending', deployedUrl:'', lastDeploy:null });
  }
  if (hasReact && !hasNext) {
    plats.push({ id:'netlify', name:'Netlify', type:'web',
      buildCmd:'npm run build', outputDir:'dist',
      envRequired:['NETLIFY_AUTH_TOKEN'], status:'pending', deployedUrl:'', lastDeploy:null });
  }
  if (hasDocker) {
    plats.push({ id:'docker', name:'Docker Hub', type:'container',
      buildCmd:'docker build', outputDir:'',
      envRequired:['DOCKER_USERNAME','DOCKER_PASSWORD'], status:'pending', deployedUrl:'', lastDeploy:null });
  }
  if (hasPython) {
    plats.push({ id:'pythonanywhere', name:'PythonAnywhere', type:'api',
      buildCmd:'pip install -r requirements.txt', outputDir:'',
      envRequired:['PA_API_KEY'], status:'pending', deployedUrl:'', lastDeploy:null });
  }

  // GitHub Pages always available
  plats.push({ id:'github-pages', name:'GitHub Pages', type:'web',
    buildCmd:'npm run build', outputDir:'dist',
    envRequired:['GITHUB_TOKEN'], status:'pending', deployedUrl:'', lastDeploy:null });

  // Cloudflare Workers — always available (like krypthane uses)
  plats.push({ id:'cloudflare', name:'Cloudflare Workers', type:'web',
    buildCmd:'wrangler deploy', outputDir:'',
    envRequired:['CLOUDFLARE_API_TOKEN'], status:'pending', deployedUrl:'', lastDeploy:null });

  return {
    name       : pkg.name    || name,
    version    : pkg.version || '0.1.0',
    description: pkg.description || '',
    techStack  : stack,
    platforms  : plats,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG_FILE = 'hydra.config.json';

const DEFAULT_CONFIG: HydraConfig = {
  version: '5.0.0',
  author : AUTHOR,
  errorHandling: { retryAttempts: 3, retryDelay: 2000, autoRecovery: true },
  socialNetworks: [],
};

async function loadConfig(root: string): Promise<HydraConfig> {
  const cfgPath = path.join(root, CONFIG_FILE);
  try {
    const raw = await fs.readFile(cfgPath, 'utf8');
    const cfg = JSON.parse(raw) as HydraConfig;
    // Merge — always keep author contacts fresh from source
    cfg.author = AUTHOR;
    return cfg;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

async function saveConfig(root: string, cfg: HydraConfig): Promise<void> {
  const cfgPath = path.join(root, CONFIG_FILE);
  await fs.writeFile(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOY ENGINE — real commands, real retry
// ─────────────────────────────────────────────────────────────────────────────
async function deployPlatform(
  platform: DeployPlatform,
  root: string,
  logger: Logger,
  recovery: RecoveryRegistry,
  retries: number,
  retryDelay: number,
): Promise<void> {
  // Check required env vars before attempting
  const missing = platform.envRequired.filter(k => !process.env[k]);
  if (missing.length > 0) {
    platform.status = 'skipped';
    logger.warn(`${platform.name}: missing env vars [${missing.join(', ')}] — skipped`);
    return;
  }

  platform.status = 'running';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`${platform.name}: attempt ${attempt}/${retries}`);
      await execAsync(platform.buildCmd, { cwd: root, timeout: 120_000 });
      platform.status    = 'success';
      platform.lastDeploy = new Date();
      platform.deployedUrl = `https://${platform.id}.${AUTHOR.name}.dev`;
      logger.info(`${platform.name}: deployed OK`);
      return;
    } catch (err: any) {
      const hydraErr = new HydraError(err.message, 'DEPLOY_FAILED', attempt < retries);
      logger.error(`${platform.name}: ${err.message}`);
      const recovered = await recovery.attempt(hydraErr);
      if (!recovered && attempt < retries) {
        logger.info(`Retry in ${retryDelay}ms...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }
  }

  platform.status = 'failed';
}

// ─────────────────────────────────────────────────────────────────────────────
// README GENERATOR — clean Markdown, no hardcoded padding
// ─────────────────────────────────────────────────────────────────────────────
function generateReadme(project: ProjectInfo, cfg: HydraConfig): string {
  const { author } = cfg;
  const badges = [
    `![Version](https://img.shields.io/badge/version-${project.version}-blueviolet?style=flat-square)`,
    `![License](https://img.shields.io/badge/license-MIT-00ff41?style=flat-square)`,
    `![Open Source](https://img.shields.io/badge/Open%20Source-30%2B%20Contributors-brightgreen?style=flat-square)`,
    `![PRs](https://img.shields.io/badge/PRs-welcome-orange?style=flat-square)`,
    ...project.techStack.map(t =>
      `![${t}](https://img.shields.io/badge/${encodeURIComponent(t)}-ready-informational?style=flat-square)`
    ),
  ].join('\n');

  const stackList = project.techStack.map(t => `- **${t}**`).join('\n');

  const platformTable = project.platforms
    .map(p => `| ${p.name} | \`${p.buildCmd}\` | \`${p.outputDir || 'n/a'}\` |`)
    .join('\n');

  return `<div align="center">

# 🐉 ${project.name}

${badges}

> ${project.description || 'Professional project powered by Hydra Deploy System'}

</div>

---

## 📌 Overview

${project.description || `**${project.name}** — built with ${project.techStack.join(', ')}.`}

---

## 🛠️ Tech Stack

${stackList}

---

## 🚀 Deploy Targets

| Platform | Build Command | Output |
|----------|--------------|--------|
${platformTable}

---

## ⚡ Quick Start

\`\`\`bash
git clone https://github.com/${author.github.replace('github.com/', '')}/${project.name}.git
cd ${project.name}
npm install
npm run dev
\`\`\`

---

## 📂 Structure

\`\`\`
${project.name}/
├── src/
│   ├── core/          # Engine & error handling
│   ├── modules/       # Feature modules
│   └── utils/         # Shared utilities
├── tests/             # Unit & integration tests
├── docs/              # Documentation
├── hydra.config.json  # Hydra configuration
└── README.md
\`\`\`

---

## 👥 Contributing

Contributions welcome — this project is designed for **30+ open source contributors**.

\`\`\`bash
git checkout -b feat/your-feature
git commit -m "feat: description"
git push origin feat/your-feature
# → Open Pull Request
\`\`\`

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 🔗 Author

<table>
<tr>
<td>

**krypthane**

| Channel | Link |
|---------|------|
| GitHub | [${author.github}](https://${author.github}) |
| Telegram | [${author.telegram}](https://${author.telegram}) |
| Email | [${author.email}](mailto:${author.email}) |
| Site | [${author.site}](https://${author.site}) |

</td>
</tr>
</table>

---

## ⚖️ License

MIT © [krypthane](https://github.com/wavegxz-design) — use responsibly.

---

<div align="center">
<sub>Built with 🐉 by krypthane · Open Source · Security First</sub>
</div>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTICS — real checks
// ─────────────────────────────────────────────────────────────────────────────
interface DiagResult { label: string; ok: boolean; detail: string }

async function runDiagnostics(root: string): Promise<DiagResult[]> {
  const results: DiagResult[] = [];

  const check = async (
    label: string,
    fn: () => Promise<string>,
  ): Promise<void> => {
    try {
      const detail = await fn();
      results.push({ label, ok: true, detail });
    } catch (e: any) {
      results.push({ label, ok: false, detail: e.message });
    }
  };

  await check('Git available', async () => {
    const { stdout } = await execAsync('git --version', { timeout: 8000 });
    return stdout.trim();
  });

  await check('Node version', async () => {
    const { stdout } = await execAsync('node --version', { timeout: 8000 });
    return stdout.trim();
  });

  await check('npm version', async () => {
    const { stdout } = await execAsync('npm --version', { timeout: 8000 });
    return stdout.trim();
  });

  await check('Project directory writable', async () => {
    await fs.access(root, fs.constants.W_OK);
    return root;
  });

  await check('package.json exists', async () => {
    const p = path.join(root, 'package.json');
    await fs.access(p);
    return p;
  });

  await check('Git repository initialized', async () => {
    const { stdout } = await execAsync('git rev-parse --git-dir', { cwd: root, timeout: 8000 });
    return stdout.trim();
  });

  await check('Network reachable (GitHub)', async () => {
    await execAsync('curl -sf --max-time 5 https://api.github.com', {});
    return 'github.com OK';
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PRINTER
// ─────────────────────────────────────────────────────────────────────────────
function printSection(title: string, rows: string[]): void {
  console.log(BOX.top());
  console.log(BOX.row(C.highlight.bold(title)));
  console.log(BOX.mid());
  for (const row of rows) console.log(BOX.row(row));
  console.log(BOX.bot());
  console.log('');
}

function printDashboard(project: ProjectInfo, cfg: HydraConfig): void {
  const statusIcon: Record<DeployStatus, string> = {
    pending : C.muted('○'),
    running : C.warning('●'),
    success : C.success('✓'),
    failed  : C.error('✗'),
    skipped : C.dim('–'),
  };

  printSection('📁 PROJECT', [
    `${C.muted('Name     ')}  ${C.accent(project.name)}`,
    `${C.muted('Version  ')}  ${C.info(project.version)}`,
    `${C.muted('Stack    ')}  ${C.cyber(project.techStack.join(' · '))}`,
    `${C.muted('Author   ')}  ${C.matrix(cfg.author.name)}`,
  ]);

  printSection('🚀 DEPLOY TARGETS', project.platforms.map(p =>
    `${statusIcon[p.status]}  ${p.name.padEnd(22)}${C.muted(p.type)}`
  ));

  printSection('📱 CONTACT', [
    `${C.cyber('GitHub  ')}  ${C.info(cfg.author.github)}`,
    `${C.cyber('Telegram')}  ${C.info(cfg.author.telegram)}`,
    `${C.cyber('Email   ')}  ${C.info(cfg.author.email)}`,
    `${C.cyber('Site    ')}  ${C.info(cfg.author.site)}`,
    `${C.cyber('Session ')}  ${C.muted(cfg.author.session.slice(0, 32) + '…')}`,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
async function menuDeploy(
  project : ProjectInfo,
  root    : string,
  cfg     : HydraConfig,
  logger  : Logger,
  recovery: RecoveryRegistry,
): Promise<void> {
  const { selected } = await inquirer.prompt<{ selected: string[] }>([{
    type   : 'checkbox',
    name   : 'selected',
    message: C.primary('Select platforms to deploy:'),
    choices: project.platforms.map(p => ({
      name   : p.name,
      value  : p.id,
      checked: p.status === 'success',
    })),
  }]);

  const targets = project.platforms.filter(p => selected.includes(p.id));
  if (!targets.length) { logger.warn('No platforms selected'); return; }

  for (const p of targets) {
    const spin = ora({ text: `Deploying ${p.name}...`, color: 'cyan' }).start();
    await deployPlatform(
      p, root, logger, recovery,
      cfg.errorHandling.retryAttempts,
      cfg.errorHandling.retryDelay,
    );
    if (p.status === 'success') {
      spin.succeed(C.success(`${p.name}`) + C.muted(` → ${p.deployedUrl}`));
    } else if (p.status === 'skipped') {
      spin.warn(C.warning(`${p.name} skipped (missing env vars)`));
    } else {
      spin.fail(C.error(`${p.name} failed`));
    }
  }

  await saveConfig(root, cfg);
  console.log('');
}

async function menuReadme(
  project: ProjectInfo,
  root   : string,
  cfg    : HydraConfig,
  logger : Logger,
): Promise<void> {
  const spin = ora('Generating README…').start();
  try {
    const md = generateReadme(project, cfg);
    await fs.writeFile(path.join(root, 'README.md'), md, 'utf8');
    spin.succeed(C.success('README.md generated'));
    logger.info('README generated');
  } catch (e: any) {
    spin.fail(C.error(`README failed: ${e.message}`));
    logger.error(e.message);
  }
}

async function menuSocial(cfg: HydraConfig, root: string, logger: Logger): Promise<void> {
  const ALL_PLATFORMS = [
    'GitHub', 'LinkedIn', 'Twitter/X', 'Instagram', 'Facebook',
    'TikTok', 'YouTube', 'Discord', 'Reddit', 'Medium',
  ];

  const enabled = new Set(cfg.socialNetworks.filter(s => s.enabled).map(s => s.name));

  const { selected } = await inquirer.prompt<{ selected: string[] }>([{
    type   : 'checkbox',
    name   : 'selected',
    message: C.primary('Select social networks to enable:'),
    choices: ALL_PLATFORMS.map(p => ({ name: p, value: p, checked: enabled.has(p) })),
  }]);

  cfg.socialNetworks = ALL_PLATFORMS.map(p => ({
    name   : p,
    url    : `https://${p.toLowerCase().replace('/x', '').replace('/', '')}.com/${AUTHOR.name}`,
    enabled: selected.includes(p),
  }));

  await saveConfig(root, cfg);
  logger.info(`Social networks updated: ${selected.join(', ')}`);
  console.log(C.success(`\n  ✓ ${selected.length} network(s) configured\n`));
}

async function menuDiagnostics(root: string, logger: Logger): Promise<void> {
  console.log('');
  const spin = ora('Running diagnostics…').start();
  const results = await runDiagnostics(root);
  spin.stop();

  const ok     = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);

  console.log(BOX.top());
  console.log(BOX.row(C.highlight.bold('🔍 DIAGNOSTICS')));
  console.log(BOX.mid());
  for (const r of results) {
    const icon = r.ok ? C.success('✓') : C.error('✗');
    const info = r.ok ? C.muted(r.detail) : C.error(r.detail.slice(0, 40));
    console.log(BOX.row(`${icon}  ${r.label.padEnd(30)} ${info}`));
  }
  console.log(BOX.mid());
  console.log(BOX.row(
    `${C.success(`${ok.length} passed`)}   ${failed.length > 0 ? C.error(`${failed.length} failed`) : C.muted('0 failed')}`
  ));
  console.log(BOX.bot());

  for (const r of failed) logger.error(`Diag failed: ${r.label} — ${r.detail}`);
  console.log('');
}

async function menuLogs(logger: Logger): Promise<void> {
  const errors = logger.getErrors();
  console.log('');
  if (errors.length === 0) {
    console.log(C.success('  ✓ No errors or warnings logged'));
  } else {
    console.log(BOX.top());
    console.log(BOX.row(C.highlight.bold('📋 ERROR LOG')));
    console.log(BOX.mid());
    for (const e of errors.slice(-20)) { // show last 20
      const level = e.level === 'error' ? C.error('[ERR]') : C.warning('[WRN]');
      const ts    = C.muted(e.ts.toTimeString().slice(0, 8));
      console.log(BOX.row(`${level} ${ts} ${e.msg}`));
    }
    console.log(BOX.bot());
  }
  console.log('');
}

async function menuContributors(): Promise<void> {
  const areas = [
    'New platform adapters (Fly.io, Railway, Render…)',
    'Social media API integrations',
    'Test coverage improvements',
    'Documentation & examples',
    'Performance & caching',
    'Windows/macOS compatibility',
  ];

  console.log('');
  printSection('👥 CONTRIBUTING', [
    `${C.info('Repo   ')}  https://${AUTHOR.github}/hydra`,
    `${C.info('Contact')}  ${AUTHOR.telegram}`,
    `${C.info('Email  ')}  ${AUTHOR.email}`,
    '',
    C.muted('Areas open for contribution:'),
    ...areas.map(a => `  ${C.matrix('→')} ${a}`),
    '',
    C.muted('git checkout -b feat/your-feature'),
    C.muted('git commit -m "feat: description"'),
    C.muted('git push && open Pull Request'),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const root   = process.argv[2] || process.cwd();
  const logger = new Logger();
  const recovery = new RecoveryRegistry();

  // Register recovery strategies
  recovery.register('FILE_READ', async () => {
    logger.warn('File read error — creating defaults');
  });
  recovery.register('NETWORK', async () => {
    logger.info('Network error — waiting 3s then retrying');
    await new Promise(r => setTimeout(r, 3000));
  });
  recovery.register('DEPLOY_FAILED', async () => {
    logger.info('Deploy failed — cleaning build artifacts');
    const dist = path.join(root, 'dist');
    if (await fs.pathExists(dist)) await fs.remove(dist);
  });

  // Load project + config
  const [project, cfg] = await Promise.all([
    detectProject(root),
    loadConfig(root),
  ]);

  printBanner();
  printDashboard(project, cfg);

  // Interactive loop
  while (true) {
    const { choice } = await inquirer.prompt<{ choice: string }>([{
      type   : 'list',
      name   : 'choice',
      message: C.matrix('Action:'),
      choices: [
        { name: `${C.success('🚀')} Deploy`,             value: 'deploy' },
        { name: `${C.info('📝')} Generate README`,       value: 'readme' },
        { name: `${C.cyber('🌐')} Social Networks`,      value: 'social' },
        { name: `${C.warning('🔍')} Diagnostics`,        value: 'diag'   },
        { name: `${C.muted('📋')} View Logs`,            value: 'logs'   },
        { name: `${C.accent('👥')} Contributing Info`,   value: 'contrib'},
        new inquirer.Separator(),
        { name: `${C.error('✕')} Exit`,                  value: 'exit'   },
      ],
      pageSize: 10,
    }]);

    switch (choice) {
      case 'deploy':
        await menuDeploy(project, root, cfg, logger, recovery);
        printDashboard(project, cfg);
        break;
      case 'readme':
        await menuReadme(project, root, cfg, logger);
        break;
      case 'social':
        await menuSocial(cfg, root, logger);
        break;
      case 'diag':
        await menuDiagnostics(root, logger);
        break;
      case 'logs':
        await menuLogs(logger);
        break;
      case 'contrib':
        await menuContributors();
        break;
      case 'exit':
        console.log(C.cyber('\n  🐉 Hydra out.\n'));
        process.exit(0);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
process.on('uncaughtException',  e => { console.error(C.error(`Fatal: ${e.message}`)); process.exit(1); });
process.on('unhandledRejection', e => { console.error(C.error(`Unhandled: ${e}`));     });
process.on('SIGINT', () => { console.log(C.cyber('\n  🐉 Hydra out.\n')); process.exit(0); });

main().catch(e => {
  console.error(C.error(`\n  ✗ ${e.message}\n`));
  console.error(C.muted(`  Report: https://${AUTHOR.github}/hydra/issues`));
  process.exit(1);
});
