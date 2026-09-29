# Baat2Badlav
### *From Citizen Voices to Development Intelligence*

[![Status: Active Prototype](https://img.shields.io/badge/Status-Active%20Prototype-0F766E?style=flat-square)](https://github.com/sc-likes-to-code/Baat2Badlav)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-033aaf?style=flat-square)](https://react.dev/)
[![Styling: Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square)](https://tailwindcss.com/)
[![AI Engine: Google Gemini](https://img.shields.io/badge/AI%20Engine-Gemini%203.5%20Flash%20Lite-E06D28?style=flat-square)](https://ai.google.dev/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-stone?style=flat-square)](./LICENSE)

---

## 1. Project Context & Vision

**Baat2Badlav** (*"From Conversation to Transformation"*) is an India-first civic technology and development-intelligence platform. It bridges the critical divide between everyday, multilingual community voices and structured public-planning decisions.

In conventional governance, spoken and vernacular civic complaints often remain trapped in isolated silos, dismissed as anecdotal noise, or lost in bureaucratic fragmentation. **Baat2Badlav** turns unstructured community grievances across diverse Indian dialects into verifiable, explainable development intelligence by cross-referencing citizen demand with localized infrastructure baselines, demographic exposure, and public investment context.

```
Citizen Voices (Multilingual Text / Voice)
       │
       ▼
AI Interpretation (Gemini 3.5 Flash Lite)
       │
       ▼
Semantic Demand Clustering
       │
       ▼
Localized Demand Hotspots
       │
       ▼
Development Context (Infrastructure + Demographics + Investment)
       │
       ▼
Development Gap Engine (4-Factor Deficit Model)
       │
       ▼
Explainable Priority Engine (5-Factor Multi-Criteria Ranking)
       │
       ▼
Candidate Development Projects (Deterministic Archetype Mapping)
       │
       ▼
Impact Simulation Engine (Interactive Scenario Modeling)
       │
       ▼
Policymaker & Citizen Intelligence Dashboard
```

> **Core Philosophy**: Baat2Badlav is a civic decision-support platform that informs human-led planning. It does not replace democratic governance, claim sovereign authority, or automatically disburse public funds.

---

## 2. Core Product & Governance Principles

1. **Citizen-First Accessibility**
   Citizens can express real-world civic challenges in natural language across English, Hindi, and Bengali, using both text and voice interfaces without requiring literacy in bureaucratic jargon.
2. **AI-Assisted, Never AI-Authoritative**
   Google Gemini parses, structures, and classifies citizen accounts. It **never** decides budget allocations, makes political judgements, or invents facts.
3. **End-to-End Explainability**
   Every score, ranking, project recommendation, and scenario projection is mathematically transparent and traceable to its underlying signals and formulas.
4. **Deterministic Analytical Core**
   Clustering, development gap scoring, priority ranking, project archetype mapping, and impact simulation operate via pure, deterministic, reproducible algorithms rather than opaque AI black boxes.
5. **Synthetic-Data Transparency**
   All prototype baselines and demonstration records are visibly labeled as *Synthetic Demonstration Data* to maintain uncompromised empirical integrity.
6. **Privacy-by-Design (Zero-PII)**
   No login, passwords, Aadhaar numbers, phone numbers, email addresses, or invasive GPS tracking are collected. Citizen participation is anonymous and barrier-free.
7. **No Fabricated Verification**
   The platform never claims a citizen report is an official government audit record unless an empirical source exists.
8. **Strict Political Neutrality**
   The platform produces objective developmental intelligence and is strictly free of political campaign recommendations, voter targeting, or partisan persuasion.

---

## 3. Technology Stack

| Layer | Technology | Purpose & Specification |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.0.1** | Component architecture with modern hooks & concurrency |
| **Language** | **TypeScript 7.0 / 5.x** | Strict end-to-end type safety across all models |
| **Build & Tooling** | **Vite 8.3** | Lightning-fast development server and production bundler |
| **Styling** | **Tailwind CSS v4.3** | Modern utility-first CSS with native design system variables |
| **Motion & Animation** | **Framer Motion 13.4** | Accessible micro-interactions and smooth layout transitions |
| **Icons & Typography** | **Material Symbols & Lucide** | Google Material Symbols Outlined + Lucide React + Plus Jakarta Sans |
| **AI Processing** | **Google Gemini API (`@google/genai` 2.4.0)** | Server-side structured interpretation via `gemini-3.5-flash-lite` |
| **Server Runtime** | **Node.js / Express Middleware** | Vite-integrated secure server middleware for `/api/interpret` |
| **State Management** | **React In-Memory & Hooks** | Pure, deterministic client-side synchronization |

---

## 4. Platform Routing Architecture

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | [`LandingPage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/LandingPage.tsx) | Homepage introducing mission, dialect showcase, core pipeline, and entry points. |
| `/citizen` | [`CitizenVoicePage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/CitizenVoicePage.tsx) | Multilingual voice/text submission terminal with location cascade and PII safeguards. |
| `/citizen/result` | [`AIInterpretationPage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/AIInterpretationPage.tsx) | Transparent AI interpretation breakdown with structured entities, confidence, and edit options. |
| `/dashboard` | [`DashboardPage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/DashboardPage.tsx) | Master Development Intelligence Dashboard hosting the 9-stage pipeline and Spatial Atlas. |
| `/dashboard/region/:id` | [`RegionIntelligencePage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/RegionIntelligencePage.tsx) | Deep-dive geospatial dossier for a specific region (e.g., Nadia, West Bengal). |
| `/trust` | [`TrustDataPage.tsx`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/pages/TrustDataPage.tsx) | Public trust center detailing data provenance, algorithmic formulations, and ISO/DPDP guardrails. |

> **Graceful State Handling**: If a user navigates directly to `/citizen/result` without an active session submission, the interface seamlessly renders a comprehensive demonstration interpretation record, enabling full inspection without breakage.

---

## 5. Detailed Feature Specifications & Implemented Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 9-STAGE INTELLIGENCE PIPELINE                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
 [1. Voices] ──> [2. AI Signals] ──> [3. Clusters] ──> [4. Hotspots] ──> [5. Context]
                                                                               │
 [9. Simulation] <── [8. Projects] <── [7. Priorities] <── [6. Development Gap] ┘
```

### Stage 1 & 2: Citizen Voice Intake & Live Gemini Interpretation (Updates 02 & 03)
- **Multilingual Support**: Real-time intake in English, Hindi (हिन्दी), and Bengali (বাংলা).
- **Dual Input Modes**: High-fidelity text input and simulated spoken-voice audio terminal.
- **Hierarchical Geo-tagging**: Administrative cascade: `State` $\rightarrow$ `District` $\rightarrow$ `Locality (optional)` across prototype states (West Bengal, Bihar, Odisha, Rajasthan, Kerala, Jharkhand).
- **Client-Side Privacy Filter**: Proactively flags phone numbers, email IDs, and house numbers without silently discarding citizen testimony.
- **Server-Side Gemini Interpretation (`POST /api/interpret`)**:
  - Model: `gemini-3.5-flash-lite` with schema-enforced structured JSON output.
  - Extracts `civicDomain`, `primaryIssue`, `normalizedSummary`, `entitiesOrSignals`, `severity` (*Low, Medium, High, Critical*), `urgency` (*Routine, Seasonal Risk, Immediate, Long-term*), and `confidenceBasis`.
  - Resilience: Built-in idempotency guard against duplicate submissions and 20-second timeout mitigation.

---

### Stage 3 & 4: Semantic Demand Clustering & Localized Hotspots (Update 04)
- **Deterministic Clustering Algorithm** ([`clusteringService.ts`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/services/clusteringService.ts)):
  - Groups citizen reports by civic domain, geographic corridor, and problem signatures.
  - Computes weighted severity and urgency distributions across aggregated reports.
- **Demand Hotspots**: Isolates concentrated district-level demand clusters (e.g., *Monsoon Inundation in Nadia*, *Doctor Shortages in Gaya*, *Groundwater Depletion in Kalahandi*).

---

### Stage 5 & 6: Infrastructure Context & Development Gap Engine (Update 05)
Combines localized demand with synthetic baseline indicators ([`syntheticDevelopmentContext.ts`](file:///e:/MY%20PROJECTS/BWAI_community/Baat2Badlav/src/data/syntheticDevelopmentContext.ts)) to calculate the **Development Gap Score**:

$$\text{Development Gap} = \left( 0.40 \times \text{Demand Signal} + 0.30 \times \text{Infrastructure Need} + 0.20 \times \text{Demographic Pressure} + 0.10 \times \text{Investment Gap} \right) \times 100$$

- **Demand Signal (40%)**: $0.40 \times \text{Volume} + 0.35 \times \text{Severity} + 0.25 \times \text{Urgency}$.
- **Infrastructure Need (30%)**: $1.0 - \text{Baseline Domain Coverage}$ (e.g., all-weather road access, tap water supply, PHC clinic distance).
- **Demographic Pressure (20%)**: Rural population share + seasonal vulnerability + service density strain.
- **Investment Gap (10%)**: $1.0 - \text{Recent Domain Public Investment Index}$.

#### Qualitative Gap Bands
- **Very High Gap**: $\ge 75$ | **High Gap**: $55 - 74$ | **Moderate Gap**: $35 - 54$ | **Low Gap**: $< 35$

---

### Stage 7: Explainable Development Priority Engine (Update 06)
Ranks development needs deterministically across regions without subjective political weighting:

$$\text{Priority Score} = \left( 0.30 \times \text{Demand Intensity} + 0.30 \times \text{Development Gap} + 0.15 \times \text{Urgency} + 0.15 \times \text{Geographic Concentration} + 0.10 \times \text{Service Pressure} \right) \times 100$$

```
Rank #1: Gaya (Healthcare Access · Doctor Shortage)           ──> Priority Score: 87 (Critical Signal)
Rank #2: Kalahandi (Water Access · Groundwater Depletion)     ──> Priority Score: 85 (Critical Signal)
Rank #3: Nadia (Roads & Mobility · Monsoon Inundation)        ──> Priority Score: 84 (Critical Signal)
Rank #4: Murshidabad (Roads & Mobility · Broken Bridges)      ──> Priority Score: 84 (Critical Signal)
Rank #5: Muzaffarpur (Electricity · Feeder Outages)           ──> Priority Score: 79 (Critical Signal)
Rank #6: Nadia (School Facilities · Sanitation Deficit)       ──> Priority Score: 77 (Critical Signal)
Rank #7: Muzaffarpur (Electricity · Low Voltage)              ──> Priority Score: 71 (High Signal)
Rank #8: Nadia (School Facilities · Dilapidated Classrooms)   ──> Priority Score: 69 (High Signal)
Rank #9: Kalahandi (Water Access · Water Contamination)       ──> Priority Score: 66 (High Signal)
```

- **Deterministic Tie-Breaker**: Priority Score $\rightarrow$ Development Gap Score $\rightarrow$ Citizen Report Volume $\rightarrow$ Alphabetical District Name.

---

### Stage 8: Candidate Development Project Engine (Update 07)
Translates prioritized gaps into standardized, 1:1 mapped candidate civic intervention archetypes:
- **Roads & Mobility**: *Drainage Improvement*, *Bridge & Culvert Rehabilitation*, *Road Rehabilitation*.
- **Water Access**: *Community Water Access Improvement*, *Water Quality & Filtration Intervention*.
- **Healthcare Access**: *Primary Healthcare Access & Staffing Support*.
- **Electricity & Power**: *Electricity Feeder Reliability*, *Agricultural Voltage & Distribution Improvement*.
- **School Facilities**: *School Sanitation & Hygiene Improvement*, *School Classroom Rehabilitation*.

Each candidate project maintains strict lineage references (`priorityAssessmentId`, `developmentGapId`), inherited signal evidence, and 4 high-level implementation considerations.

---

### Stage 9: Explainable Impact Simulation Engine (Update 08)
An interactive mathematical model enabling planners to explore hypothetical intervention scenarios in real time:

$$\text{Combined Strength} = \left(\frac{\text{Coverage \%}}{100}\right) \times \left(\frac{\text{Effectiveness \%}}{100}\right)$$
$$\text{Demand Reduction} = \min\left(1.0, \text{Combined Strength} \times \text{Domain Responsiveness}\right)$$
$$\text{Infra Improvement} = \min\left(1.0, \text{Combined Strength} \times 0.85\right)$$
$$\text{Gap Reduction (pts)} = \left(0.40 \times \text{Demand Impact} + 0.30 \times \text{Infra Impact}\right) \times 100$$
$$\text{Projected Residual Gap} = \max\left(0, \text{Baseline Gap} - \text{Gap Reduction}\right)$$

#### Prototype Domain Demand Responsiveness Coefficients
- **Roads & Mobility**: $0.80$ | **Water Access**: $0.75$ | **Electricity & Power**: $0.75$ | **Healthcare Access**: $0.70$ | **School Facilities**: $0.70$ | **Other**: $0.60$

#### Scenario Presets
- **Conservative**: $40\%$ Coverage / $60\%$ Effectiveness $\rightarrow 24.0\%$ Combined Strength.
- **Balanced (Default)**: $60\%$ Coverage / $75\%$ Effectiveness $\rightarrow 45.0\%$ Combined Strength.
- **High Coverage**: $80\%$ Coverage / $85\%$ Effectiveness $\rightarrow 68.0\%$ Combined Strength.

---

## 6. End-to-End Data Lineage & Traceability

Full analytical provenance is guaranteed across every tier of the platform:

```
[Citizen Submission] id: sub-1790513716341
       │ (multilingual voice/text + location)
       ▼
[AI Interpretation] primaryIssue: "Monsoon waterlogging & culvert blockage"
       │ (domain classification + severity rating)
       ▼
[Demand Cluster] id: cluster-roads-mobility-monsoon-connectivity
       │ (semantic signature aggregation)
       ▼
[Demand Hotspot] id: hotspot-wb-nadia-roads-monsoon
       │ (district volume + locality concentration)
       ▼
[Development Context] district: "Nadia" (Infra Need: 0.72, Demo: 0.79, Invest: 0.69)
       │ (synthetic baseline indicators)
       ▼
[Development Gap] id: gap-hotspot-wb-nadia-roads-monsoon (Gap Score: 78/100)
       │ (4-factor deficit calculation)
       ▼
[Priority Assessment] id: priority-gap-hotspot-wb-nadia-roads-monsoon (Score: 84/100)
       │ (5-factor explainable prioritization)
       ▼
[Candidate Project] id: proj-hotspot-wb-nadia-roads-monsoon (Drainage Improvement)
       │ (1:1 archetype mapping + implementation considerations)
       ▼
[Impact Simulation] residualGap: 57.9/100 (-20.1 pts reduction under 60/75 scenario)
```

---

## 7. Trust & Data Categorical Boundaries

To eliminate misinterpretation and maintain public trust, Baat2Badlav establishes unambiguous categorical boundaries:

| Terminology | What It Represents | What It Does NOT Represent |
| :--- | :--- | :--- |
| **Citizen Report** | Raw, self-reported lived community experience | Legally verified audit fact |
| **AI Interpretation** | Machine-structured translation of civic context | Binding government record |
| **Synthetic Baseline** | Calibrated reference indicators for demonstration | Live official Census/PMGSY database |
| **Development Gap** | Multi-factor analytical deficit index | Official budgetary allocation |
| **Priority Signal** | Relative demand-to-gap urgency indicator | Executive political mandate |
| **Candidate Project** | Illustrative intervention archetype | Approved procurement tender |
| **Impact Simulation** | Hypothetical mathematical scenario projection | Measured real-world impact forecast |

---

## 8. Directory & File Architecture

```
Baat2Badlav/
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment variables (Ignored by git)
├── .gitignore                       # Git ignore definitions
├── index.html                       # Application HTML shell with web fonts
├── package.json                     # NPM dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite configuration & server-side API middleware
├── public/                          # Static assets (logos, icons, audio samples)
├── scratch/                         # Automated mathematical verification test suite
│   ├── audit_impact.ts              # 11-point deterministic impact simulation audit
│   └── audit_projects.ts            # Lineage and project mapping audit
└── src/
    ├── main.tsx                     # React 19 bootstrap entry point
    ├── App.tsx                      # Top-level state and client-side view router
    ├── index.css                    # Tailwind CSS v4 setup & global pointer cursor rules
    ├── types/                       # Strict TypeScript domain interfaces
    │   ├── citizen.ts               # Citizen submissions and AI interpretation types
    │   ├── demand.ts                # Demand clusters and hotspot definitions
    │   ├── development.ts           # Infrastructure, demographic, and gap types
    │   ├── priority.ts              # 5-factor priority engine interfaces
    │   ├── project.ts               # Candidate project archetypes and lineages
    │   └── impact.ts                # Scenario inputs and simulation result types
    ├── services/                    # Pure, deterministic analytical engines
    │   ├── clusteringService.ts     # Semantic grouping and hotspot derivation
    │   ├── developmentGapService.ts # 4-factor development gap engine
    │   ├── priorityService.ts       # 5-factor priority engine and ranking logic
    │   ├── projectService.ts        # Candidate project translation service
    │   └── impactSimulationService.ts # Interactive scenario simulation engine
    ├── server/                      # Server-side API & AI services
    │   ├── index.ts                 # Server entry point
    │   ├── ai/
    │   │   ├── config.ts            # Gemini model configuration and API key accessor
    │   │   ├── geminiService.ts     # @google/genai caller with structured prompts
    │   │   └── civicInterpretationPrompt.ts # Prompt engineering & guardrails
    │   └── api/
    │       └── interpretHandler.ts  # Node/Express endpoint for POST /api/interpret
    ├── data/                        # Demonstration baselines & static metadata
    │   ├── locations.ts             # Administrative state/district cascades
    │   ├── mockData.ts              # Spatial atlas datasets
    │   ├── syntheticCitizenReports.ts # Seeded multilingual community voices
    │   └── syntheticDevelopmentContext.ts # Domain infrastructure & demographic profiles
    ├── components/                  # Reusable UI modules
    │   ├── Navbar.tsx               # Main top navigation bar & mobile drawer
    │   ├── Footer.tsx               # Footer with brand return-to-top button
    │   └── DemandIntelligenceSection.tsx # 9-stage pipeline dashboard view
    └── pages/                       # Primary route views
        ├── LandingPage.tsx          # Homepage with dialect audio showcase
        ├── CitizenVoicePage.tsx     # Voice/text citizen intake terminal
        ├── AIInterpretationPage.tsx # AI interpretation audit view
        ├── DashboardPage.tsx        # Master development intelligence dashboard
        ├── RegionIntelligencePage.tsx # Deep-dive regional dossier (Nadia)
        └── TrustDataPage.tsx        # Data lineage, mathematical models, and guardrails
```

---

## 9. Security & Privacy Architecture

- **Server-Side Key Isolation**: `GEMINI_API_KEY` is strictly accessed within server-side middleware (`src/server/`). It is **never** prefixed with `VITE_` and never bundled into client-side JavaScript.
- **Zero-PII Compliance**: Submissions are anonymous by design. No authentication, phone numbers, or tracking cookies are required.
- **Prompt Injection Defense**: Citizen testimony is treated as untrusted text within `civicInterpretationPrompt.ts`, enforcing strict semantic JSON extraction and forbidding system instruction overrides.
- **Local Analytical Execution**: All clustering, gap scoring, priority ranking, project mapping, and impact simulation run entirely locally in deterministic code without sending citizen data to third-party endpoints.

---

## 10. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+) or `bun` / `pnpm`
- **Google Gemini API Key**: Obtain a key from [Google AI / Gemini Developer Portal](https://ai.google.dev/)

### Step 1: Clone Repository
```bash
git clone https://github.com/sc-likes-to-code/Baat2Badlav.git
cd Baat2Badlav
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Verification & Production Build
```bash
# Typecheck codebase
npm run lint

# Production build
npm run build
```

---

## 11. Testing & Mathematical Verification

To ensure strict empirical consistency and avoid unnecessary Gemini API quota consumption, testing is separated into static validation, build checks, and deterministic mathematical audits:

```bash
# Execute deterministic mathematical verification suite
npx tsx scratch/audit_impact.ts
npx tsx scratch/audit_projects.ts
```

### Audit Benchmarks Verified
1. **Zero / Edge Case Integrity**: $0\%$ coverage or $0\%$ effectiveness strictly produces $0.0$ gap reduction.
2. **Monotonicity**: Increasing coverage or effectiveness strictly increases or preserves projected gap reductions without mathematical regression.
3. **Bound Clamping**: Residual gap scores are strictly clamped between $[0, 100]$ and cannot become negative or exceed baseline deficits.
4. **Lineage Foreign Keys**: $100\%$ of Candidate Projects and Impact Scenarios resolve valid parent IDs.

---

## 12. Implementation Status & Roadmap

### Completed Conceptual Milestones (Updates 02 – 08)
- [x] **Update 02**: Multilingual Citizen Voice intake terminal and location cascade.
- [x] **Update 03**: Live server-side Gemini 3.5 Flash Lite interpretation engine with timeout safeguards.
- [x] **Update 04**: Semantic Demand Clustering & localized Demand Hotspots.
- [x] **Update 05**: Infrastructure baseline context and 4-factor Development Gap Engine.
- [x] **Update 06**: Explainable 5-factor Development Priority Engine with deterministic ranking.
- [x] **Update 07**: Candidate Development Project Engine with 1:1 lineage tracking.
- [x] **Update 08**: Explainable Impact Simulation Engine with real-time scenario recalculation.

### Planned Roadmap
- [ ] **Multi-District Dossier Expansion**: Extending deep-dive regional dossiers beyond Nadia to Gaya, Kalahandi, and Muzaffarpur.
- [ ] **Multi-Project Portfolio Comparison**: Enabling planners to compare alternative candidate projects concurrently within the simulation engine.
- [ ] **Data Export & Dossier PDF Generation**: High-resolution civic brief generation for local Panchayats and district administrations.
- [ ] **Official Open Data Adapters**: Optional connectors to ingest open datasets (e.g., Data.gov.in, PMGSY, Jal Jeevan Mission API feeds) where available.

---

## 13. License & Civic Tech Commitment

Licensed under the **Apache License, Version 2.0**. See [`LICENSE`](./LICENSE) for full details.

Built with commitment to open, transparent, and explainable technology for India's public development ecosystem.
