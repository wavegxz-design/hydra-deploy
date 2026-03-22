[hydra-README.md](https://github.com/user-attachments/files/26169865/hydra-README.md)
<div align="center">

# 🐉 hydra-deploy

![Version](https://img.shields.io/badge/version-5.0.1-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-00ff41?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-informational?style=flat-square)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macOS%20%7C%20windows-lightgrey?style=flat-square)

> **Multi-platform deployment CLI** — detects your project type and deploys it to the right platform automatically. Built for developers who hate repeating the same deploy commands.

</div>

---

## ¿Qué hace hydra-deploy?

`hydra-deploy` es una herramienta CLI que **automatiza el deployment** de proyectos. La ejecutas en la carpeta de tu proyecto y ella:

1. **Detecta automáticamente** qué tipo de proyecto es (Next.js, React, Python, Docker, etc.)
2. **Muestra las plataformas disponibles** para ese stack (Vercel, Netlify, Cloudflare Workers, GitHub Pages, etc.)
3. **Ejecuta el deploy** con los comandos correctos para cada plataforma
4. **Reintenta automáticamente** si algo falla (hasta 3 intentos configurables)
5. **Genera el README** de tu proyecto con badges, estructura y tabla de plataformas

---

## Instalación

```bash
# Clonar
git clone https://github.com/wavegxz-design/hydra-deploy.git
cd hydra-deploy

# Instalar dependencias
npm install

# Ejecutar directamente (desarrollo)
npm run dev

# O compilar y usar como comando global
npm run build
npm link           # después: hydra (desde cualquier carpeta)
```

**Requisitos:** Node.js 18+ · npm 9+

---

## Uso

```bash
# En la carpeta de tu proyecto:
cd ~/mi-proyecto
npx ts-node /ruta/a/hydra-deploy/src/index.ts

# O si lo instalaste globalmente:
hydra

# Con carpeta específica:
hydra /ruta/a/mi-proyecto
```

### Menú interactivo

```
┌──────────────────────────────────────────────────────────────┐
│  🚀 Deploy           → despliega a la plataforma elegida     │
│  📝 Generate README  → crea README.md con badges y docs      │
│  🌐 Social Networks  → configura tus redes sociales          │
│  🔍 Diagnostics      → verifica git, node, network, etc.     │
│  📋 View Logs        → muestra errores y warnings            │
│  👥 Contributing     → info para contribuidores              │
│  ✕  Exit                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Plataformas soportadas

| Plataforma | Stack detectado | Env var requerida |
|------------|----------------|-------------------|
| **Vercel** | Next.js | `VERCEL_TOKEN` |
| **Netlify** | React (sin Next) | `NETLIFY_AUTH_TOKEN` |
| **GitHub Pages** | Cualquiera | `GITHUB_TOKEN` |
| **Cloudflare Workers** | Cualquiera | `CLOUDFLARE_API_TOKEN` |
| **Docker Hub** | Docker | `DOCKER_USERNAME` + `DOCKER_PASSWORD` |
| **PythonAnywhere** | Python | `PA_API_KEY` |

### Configurar env vars

```bash
# Temporal (sesión actual)
export CLOUDFLARE_API_TOKEN="tu-token-aqui"
export GITHUB_TOKEN="ghp_tu-token"

# Permanente — agregar a ~/.bashrc o ~/.zshrc
echo 'export CLOUDFLARE_API_TOKEN="tu-token"' >> ~/.zshrc
source ~/.zshrc

# O crear archivo .env en tu proyecto
echo "CLOUDFLARE_API_TOKEN=tu-token" > .env
```

Si una env var no está configurada, hydra **omite esa plataforma** con un warning — no crashea.

---

## Detección de proyectos

hydra detecta el stack leyendo archivos reales del proyecto:

```
package.json con "next"    → Next.js  → Vercel
package.json con "react"   → React    → Netlify
requirements.txt           → Python   → PythonAnywhere
Dockerfile                 → Docker   → Docker Hub
go.mod                     → Go
Cargo.toml                 → Rust
composer.json              → PHP
```

Si no detecta nada, asume **Static** y ofrece GitHub Pages + Cloudflare Workers.

---

## Configuración persistente

hydra guarda su configuración en `hydra.config.json` en la carpeta del proyecto:

```json
{
  "version": "5.0.0",
  "errorHandling": {
    "retryAttempts": 3,
    "retryDelay": 2000,
    "autoRecovery": true
  },
  "socialNetworks": [
    { "name": "GitHub",   "url": "https://github.com/wavegxz-design", "enabled": true },
    { "name": "Telegram", "url": "https://t.me/Skrylakk",             "enabled": true }
  ]
}
```

---

## Diagnósticos

```bash
# Desde el menú → "🔍 Diagnostics"
# Verifica automáticamente:
✓ git --version
✓ node --version
✓ npm --version
✓ Directorio del proyecto writable
✓ package.json existe
✓ Git repo inicializado
✓ GitHub API reachable (network check)
```

---

## README Generator

La opción **📝 Generate README** crea un `README.md` profesional con:
- Badges de versión, licencia, stack
- Overview del proyecto
- Tabla de plataformas de deploy
- Quick start commands
- Estructura de carpetas
- Sección de contribución con instrucciones de PR
- Tabla de contacto del autor

---

## Estructura del proyecto

```
hydra-deploy/
├── src/
│   └── index.ts       # CLI principal — toda la lógica
├── dist/              # TypeScript compilado (generado por npm run build)
├── hydra.config.json  # Configuración local (generado en primer uso)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Scripts disponibles

```bash
npm run dev     # Ejecutar sin compilar (ts-node)
npm run build   # Compilar TypeScript → dist/
npm run start   # Ejecutar compilado
npm run hydra   # Alias de dev
npm run lint    # ESLint en src/
npm run format  # Prettier en src/
npm run test    # Tests (passWithNoTests por ahora)
```

---

## Contribuir

```bash
git clone https://github.com/wavegxz-design/hydra-deploy.git
cd hydra-deploy
npm install
git checkout -b feat/tu-feature
# ... cambios ...
git commit -m "feat: descripción"
git push origin feat/tu-feature
# → Abrir Pull Request
```

Áreas abiertas para contribución:
- Adapter para Fly.io, Railway, Render
- Integración con APIs de redes sociales
- Tests unitarios
- Soporte Windows mejorado
- Cache de builds

---

## Autor

| | |
|-|-|
| **GitHub** | [github.com/wavegxz-design](https://github.com/wavegxz-design) |
| **Telegram** | [t.me/Skrylakk](https://t.me/Skrylakk) |
| **Email** | Workernova@proton.me |
| **Site** | [krypthane.workernova.workers.dev](https://krypthane.workernova.workers.dev) |

---

## Licencia

MIT © [krypthane](https://github.com/wavegxz-design)

---

<div align="center">
<sub>🐉 Built by krypthane · wavegxz-design · Open Source · Security First</sub>
</div>
