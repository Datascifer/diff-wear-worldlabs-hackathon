# Repository Structure

## Annotated Tree

```
diff-wear-worldlabs-hackathon/
├── apps/
│   ├── web/                          # Primary Next.js 14 App Router application
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth route group (no shell layout)
│   │   │   │   ├── login/            # Google + Apple OAuth entry point
│   │   │   │   └── register/         # New user onboarding + age-gate
│   │   │   ├── (app)/                # Protected app shell (Nav layout)
│   │   │   │   ├── feed/             # Community post feed
│   │   │   │   ├── move/             # Workout plans + streaks
│   │   │   │   ├── rooms/            # Voice room list (Phase 2 placeholder)
│   │   │   │   └── you/              # User profile + settings
│   │   │   ├── api/                  # Next.js Route Handlers
│   │   │   │   ├── auth/callback/    # OAuth code exchange
│   │   │   │   ├── posts/            # Feed CRUD + reactions
│   │   │   │   ├── rooms/            # Room CRUD
│   │   │   │   ├── users/me/         # Profile read + update
│   │   │   │   ├── scripture/today/  # Daily scripture endpoint
│   │   │   │   └── admin/moderation/ # Staff moderation queue
│   │   │   ├── globals.css           # Tailwind imports + CSS custom properties
│   │   │   └── layout.tsx            # Root layout (font, dark background)
│   │   ├── components/
│   │   │   ├── ui/                   # Primitive components (Button, Card, Badge)
│   │   │   ├── layout/               # Nav, Header
│   │   │   ├── feed/                 # PostCard, PostComposer, FeedFilter
│   │   │   ├── scripture/            # ScriptureBanner (with TTS)
│   │   │   ├── move/                 # WorkoutCard, StreakDisplay
│   │   │   ├── rooms/                # RoomCard (Phase 2 UI)
│   │   │   └── you/                  # ProfileCard, NotificationSettings
│   │   ├── lib/
│   │   │   ├── supabase/             # Browser + server Supabase clients
│   │   │   └── utils/                # age.ts, capabilities.ts, cn.ts
│   │   ├── types/
│   │   │   └── domain.ts             # AgeTier, UserCapabilities, ApiResult, errors
│   │   ├── middleware.ts             # Session refresh + route protection
│   │   ├── next.config.ts           # Security headers, image domains
│   │   ├── tailwind.config.ts       # Brand colors, gradients
│   │   ├── tsconfig.json            # Extends base, JSX, path aliases
│   │   └── package.json             # Web app dependencies
│   └── api/
│       └── README.md                # Future standalone service placeholder
│
├── services/                        # Shared business logic (importable by apps/*)
│   ├── auth/                        # resolveSession, resolveAgeTier, capabilities
│   ├── feed/                        # getFeed, createPost, reactToPost
│   ├── moderation/                  # Perspective API, flagContent, resolveFlag
│   ├── ai/                          # ElevenLabs TTS, daily scripture rotation
│   └── voice/                       # Phase 2 placeholder (empty export)
│
├── db/
│   ├── migrations/                  # SQL migrations (run in numeric order)
│   │   ├── 20250901_001_create_users.sql
│   │   ├── 20250901_002_create_posts.sql
│   │   ├── 20250901_003_create_reactions_comments.sql
│   │   ├── 20250901_004_create_rooms.sql
│   │   ├── 20250901_005_create_streaks_move.sql
│   │   ├── 20250901_006_create_badges.sql
│   │   └── 20250901_007_create_moderation.sql
│   └── policies/                    # RLS policies (applied after migrations)
│       ├── users_rls.sql
│       ├── posts_rls.sql
│       ├── rooms_rls.sql
│       └── moderation_rls.sql
│
├── infra/
│   ├── terraform/                   # Future IaC (empty at launch)
│   └── configs/                     # Static service configs
│
├── docs/
│   ├── ARCHITECTURE.md              # Request flow, invariants, tech stack
│   ├── AGE_POLICY.md                # Age determination, enforcement, compliance
│   ├── PRODUCT_MODEL.md             # Mission, core loop, surfaces, non-goals
│   ├── VOICE_SYSTEM.md              # Phase 2 voice architecture + prerequisites
│   ├── AI_USAGE.md                  # Approved AI uses, prohibited uses, crisis resources
│   ├── MODERATION.md                # Three-layer moderation philosophy
│   ├── DATA_MODEL.md                # All tables with column descriptions
│   ├── SECURITY.md                  # Auth, transport, RLS, secrets, abuse prevention
│   ├── DEPLOYMENT.md                # Environments, CI/CD, migration discipline
│   ├── REPO_STRUCTURE.md            # This file
│   ├── ROADMAP.md                   # Four phases with exit criteria
│   └── DECISION_LOG.md              # Architectural decision records (ADRs)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # lint + typecheck + test + migration naming
│       └── age-policy-guard.yml     # Posts PR comment on age-sensitive changes
│
├── .codex/
│   └── config.toml                  # AI coding assistant configuration
│
├── AGENTS.md                        # Repository rules for AI coding assistants
├── README.md                        # Project overview, quick start, docs index
├── package.json                     # Root workspace scripts
├── pnpm-workspace.yaml              # Workspace globs
├── tsconfig.base.json               # Shared strict TypeScript config
├── .eslintrc.json                   # Shared ESLint rules
├── .gitignore
└── .env.example                     # All required env vars with descriptions
```

## Naming Conventions

| Scope | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase files | `PostCard.tsx` |
| Utility functions | camelCase files | `age.ts`, `cn.ts` |
| SQL migrations | `YYYYMMDD_NNN_description.sql` | `20250901_001_create_users.sql` |
| RLS policy files | `{table}_rls.sql` | `posts_rls.sql` |
| Service modules | `index.ts` + named exports | `services/feed/index.ts` |
| API routes | Next.js conventions | `app/api/posts/[id]/route.ts` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `SUPABASE_SERVICE_ROLE_KEY` |

## Ownership

| Area | Owner |
|------|-------|
| Age enforcement logic | All engineers — requires second review on any change |
| RLS policies | All engineers — requires second review on any change |
| DB migrations | All engineers — must be forward-only (no edits to committed migrations) |
| `services/moderation` | Any engineer — Perspective API integration, thresholds documented in code |
| `services/voice` | Phase 2 lead (TBD) — do not touch until prerequisites met |
| `docs/AGE_POLICY.md` | All engineers — any change triggers age-policy-guard workflow |
