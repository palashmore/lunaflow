# 🌸 LunaFlow PWA
## Advanced Menstrual Health, Cycle Intelligence, Hygiene & Personal Wellness Platform

> **Empathetic, trustworthy, privacy-first Progressive Web App (PWA) designed for menstrual cycle forecasting, symptom journaling, sanitary inventory maintenance, and clinical health reporting.**

---

### 1. Six Core Pillars

1. **Understand**: Visual biological cycle forecasting with calculated uncertainty intervals ($\pm 2\text{d}$ to $\pm 5\text{d}$) and distinct separation between recorded bleeding events and future predictions.
2. **Track**: Sub-10-second daily logging for flow intensity, physical symptoms, moods, cervical mucus observations, sleep hours, water intake, and private encrypted notes.
3. **Prepare**: Dedicated hygiene supply tracker for regular/overnight pads, tampons, and menstrual cups with low-stock alerts and Toxic Shock Syndrome (TSS) education.
4. **Learn**: Scientifically grounded educational wellness library covering safe heat therapy, burn prevention, evidence-based nutrition, and red-flag symptoms requiring clinical evaluation.
5. **Protect**: Multi-layered privacy with 4-digit PIN lock, discreet camouflage mode (functioning calculator disguise), zero plaintext secrets, and PostgreSQL Row-Level Security (RLS).
6. **Adapt**: Inclusive design supporting irregular cycles, non-judgmental language, and multi-language support (English, हिन्दी, मराठी).

---

### 2. Tech Stack

- **Frontend**: React 19, TypeScript (strict mode), Vite, Tailwind CSS v4, Lucide Icons
- **Analytics & Data Visualization**: Recharts (cycle trends, symptom frequency, flow distribution)
- **Date Engine**: date-fns (calendar-accurate date math avoiding UTC offset distortions)
- **Backend & Cloud Database**: Supabase PostgreSQL + Auth (100% Free Tier with Row-Level Security)
- **Local Fallback**: Offline Storage Adapter with local storage caching for immediate, unauthenticated guest usage
- **PWA**: Web App Manifest (`manifest.json`), service worker (`sw.js`), and installability configurations
- **Testing**: Vitest, React Testing Library, jsdom

---

### 3. Project Structure

```text
lunaflow/
├── public/
│   ├── icon.svg                     # High-resolution vector brand icon
│   ├── manifest.json                # PWA web manifest
│   └── sw.js                        # Offline service worker cache
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Top header with privacy lock & language selector
│   │   ├── CycleRing.tsx            # Circular cycle wheel with uncertainty disclosure
│   │   ├── TodayTab.tsx             # Primary dashboard (Ring, TSS timer, hydration)
│   │   ├── CalendarTab.tsx          # Month grid with period bleed & predicted days
│   │   ├── DiaryTab.tsx             # Daily symptom, mood & flow logger
│   │   ├── SanitaryTab.tsx          # Pad/tampon inventory & low-stock warnings
│   │   ├── DoctorReportTab.tsx      # Printable clinical summary for gynecologist visits
│   │   ├── SosCrampModal.tsx        # 4-7-8 rhythmic breathing circle & acupressure guide
│   │   ├── AuthModal.tsx            # Supabase authentication & credentials config
│   │   ├── PeriodDateModal.tsx      # Cycle length & period start date settings
│   │   ├── CamouflageView.tsx       # Calculator disguise screen (passcode 1234=)
│   │   └── PinLockScreen.tsx        # 4-digit security PIN lock screen
│   ├── features/
│   │   ├── insights/InsightsTab.tsx # Recharts cycle analytics & CSV/JSON export
│   │   ├── reminders/RemindersTab.tsx# Configurable cycle, hydration & medication alerts
│   │   └── wellness/WellnessTab.tsx # Evidence-based medical library & disclaimers
│   ├── i18n/index.ts                # English, Hindi, and Marathi translation bundles
│   ├── services/
│   │   ├── cycleEngine.ts           # Timezone-safe menstrual phase & prediction math
│   │   ├── storageAdapter.ts        # Offline-first storage & Supabase synchronization
│   │   └── supabase.ts              # Supabase client initializer
│   ├── types/index.ts               # Complete domain TypeScript declarations
│   ├── App.tsx                      # Master layout and tab navigation
│   ├── index.css                    # Design tokens, glassmorphism & breathing keyframes
│   └── main.tsx                     # React 19 application root
├── supabase/
│   └── migrations/
│       └── 20261019000000_initial_schema.sql # Complete PostgreSQL schema with RLS
├── tests/
│   ├── setup.ts                     # Vitest and jest-dom configuration
│   └── unit/
│       ├── cycleEngine.test.ts      # Cycle calculation, leap year & prediction tests
│       ├── storageAdapter.test.ts   # Persistence, inventory decrement & logout tests
│       ├── i18n.test.ts             # Translation coverage tests
│       └── components.test.tsx      # React Testing Library component tests
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

### 4. Setup & Running Locally

#### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm

#### Install Dependencies
```bash
npm install
```

#### Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5176](http://localhost:5176)** in your browser.

#### Run Typecheck & Tests
```bash
npm run typecheck   # Strict TypeScript verification
npm test            # Vitest unit & component test suite (20 tests)
npm run build       # Production bundle build
```

---

### 5. Connecting Your Free Supabase Database

LunaFlow runs immediately in **Offline Guest Mode** with complete local privacy. To enable multi-device cloud synchronization:

1. Create a free project at [Supabase](https://supabase.com/dashboard/organizations).
2. Open the **SQL Editor** in Supabase and run [`supabase/migrations/20261019000000_initial_schema.sql`](file:///C:/Users/lenovo/.gemini/antigravity/scratch/lunaflow/supabase/migrations/20261019000000_initial_schema.sql).
3. Under **Project Settings &rarr; API**, copy your **Project URL** and **Anon Public Key**.
4. In LunaFlow, click the **Cloud** button in the header and paste your credentials, or add them to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Sign up or log in. All personal records are automatically protected by Row-Level Security (`auth.uid() = user_id`).

---

### 6. Medical & Contraception Disclaimer

LunaFlow provides observational tracking and mathematical estimations based on user-entered historical data. **Calendar-based predictions cannot confirm ovulation or pregnancy status and must never be relied upon as a primary method of contraception.** Always seek the advice of a qualified healthcare provider with any questions regarding reproductive health or medical conditions.
