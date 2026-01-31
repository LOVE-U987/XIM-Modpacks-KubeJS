# MOR Issue Tracker Guidelines

&gt; **注意：** 该仓库也用于 XIM Nightruin 整合包的 KubeJS 代码展示。如需查看该整合包，请切换分支，如果你是中文MOR用户，可以前往https://bbsmc.net/modpack/mor/issues 报告错误

Welcome to the official issue tracker for **[MOR] Major Overhaul and Reorganization**.

## Quick Checklist Before Posting

- [ ] **Version:** Running **v2.1.0+**? (Old versions receive no support)
- [ ] **Client-Only:** Did you install this on a server? (Don't — it won't work)
- [ ] **Logs:** Uploaded `latest.log` or crash reports to [mclo.gs](https://mclo.gs/)?
- [ ] **Clean Install:** Reproducible without additional mods?
- [ ] **Drivers:** GPU drivers up to date? (NVIDIA: 546+/AMD: 24.1.1+)

## What Belongs Here

| ✅ Open an Issue | 💬 Use Discussions |
|------------------|----------------------------------------|
| Game crashes / hangs | "How do I configure X?" |
| Black screens / visual artifacts | Performance tuning help |
| Mod compatibility conflicts | Sharing screenshots/cinematics |
| Shader/lighting bugs | General gameplay questions |

## Priority Labels

Issues are triaged with these labels:

- `🔴 critical` — Crash on launch / world corruption / data loss
- `🟠 high` — Major visual bugs / severe performance regression (&gt;50% FPS drop)
- `🟡 medium` — Minor glitches / specific compatibility issues
- `🟢 low` — Cosmetic issues / enhancement requests
- `known-issue` — Already tracked; add reproduction info to existing thread

## Special Categories

### 🎨 Shader/Visual Bugs

If reporting shader issues, **always** include:

1. **Exact shader pack & version** (e.g., "Complementary Reimagined r5.2")
2. **Screenshot of F3 debug menu** (shows GPU/driver/OpenGL info

### 🐢 Performance Issues

MOR targets **GTX 1060 6GB / RX 580 8GB** as minimum.

- **Below minimum hardware:** Issues will be tagged `wontfix` (hardware limitation)
- **Above minimum but lagging:** Include F3 screenshot and `spark profile` (run `/sparkc profiler start` then `/sparkc profiler stop`)

### 🍎 Platform-Specific Notes

**macOS ARM (M1/M2/M3) And Linux:**

- Limited support is available for these platforms due to OpenGL driver constraints and lack of dedicated testing hardware. Issues specific to macOS ARM or Linux may not be prioritized. Community-provided workarounds and PRs welcome.

## ❌ Common Invalid Reports

These will be **closed immediately**:

1. **"Install on server"** — MOR is client-side only by design
2. **"Backport to 1.12.2/1.16.5"** — Only active MC versions supported
3. **"Remove X mod I don't like"** — Use configuration or fork; this is an opinionated pack
4. **"Add OptiFine support"** — Impossible; Sodium/Iris incompatibility is fundamental

**⚠️ Reminder:** Solo-maintained project. Complete information = faster resolution. Incomplete reports may be closed without response.
