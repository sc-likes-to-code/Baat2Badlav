# Baat2Badlav

### From Citizen Voices to Development Intelligence

<p align="center">
  <strong>Turning multilingual citizen experiences into structured, explainable development intelligence.</strong>
</p>

<p align="center">
  <a href="https://github.com/sc-likes-to-code/Baat2Badlav">
    <img src="https://img.shields.io/badge/Status-Active%20Prototype-0F766E?style=for-the-badge" alt="Status">
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-EA4335?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-44403C?style=for-the-badge" alt="License">
  </a>
</p>

---

## 🌏 What is Baat2Badlav?

**Baat2Badlav** is an India-first civic technology and development-intelligence platform designed to transform everyday citizen experiences into structured signals for development planning.

Citizens often describe problems in natural language — a flooded road, an unreliable electricity connection, a shortage of doctors, unsafe school facilities, or difficulty accessing clean water.

These experiences are valuable, but unstructured.

Baat2Badlav creates a pipeline that converts those voices into:

**Citizen Voice → AI Interpretation → Demand Clusters → Hotspots → Development Gaps → Priority Signals → Candidate Projects → Impact Simulation**

The goal is not to replace human decision-makers.

The goal is to provide a clearer, more explainable picture of **where problems are being reported, what those problems represent, how they relate to local development conditions, and what hypothetical interventions could change.**

---

## ✨ Core Experience

### 🗣️ 1. Citizens Speak

Citizens can submit civic experiences through:

- Text
- Voice
- English
- Hindi
- Bengali

Submissions include a structured administrative location:

```text
State
  ↓
District
  ↓
Locality
```

The interface is designed around ordinary language rather than bureaucratic terminology.

---

### 🧠 2. Gemini Structures the Voice

Google Gemini processes the citizen submission on the server and extracts structured civic signals.

The interpretation can identify:

- Civic domain
- Primary issue
- Normalized summary
- Relevant entities/signals
- Severity
- Urgency
- Confidence basis

Example:

```text
Citizen Voice
    ↓
"বর্ষায় আমাদের রাস্তা পুরো জলে ডুবে যায়..."
    ↓
Gemini Interpretation
    ↓
Domain: Roads & Mobility
Issue: Monsoon Waterlogging
Severity: Medium
Urgency: Seasonal Risk
Signals:
  • Waterlogging
  • Road Inaccessibility
  • Commuter Difficulty
```

The original citizen testimony remains visible alongside the interpretation.

---

### 📊 3. Demand Becomes Intelligence

Individual reports are aggregated using deterministic analytical services.

The platform identifies:

- Recurring problem signatures
- Geographic concentration
- Domain-level demand
- Severity and urgency distributions
- Localized demand hotspots

This turns isolated reports into patterns that can be explored.

---

### 🏗️ 4. Development Context

Demand is evaluated alongside prototype development indicators representing:

- Infrastructure need
- Demographic pressure
- Existing service coverage
- Investment gaps

These indicators feed the Development Gap Engine.

---

### 🎯 5. Explainable Priority Signals

Baat2Badlav calculates development priority signals using a transparent multi-factor model.

Every signal can be traced back to its contributing factors rather than being produced by an opaque ranking model.

---

### 🛠️ 6. Candidate Development Projects

Priority signals are translated into standardized candidate intervention archetypes.

Examples include:

- Drainage Improvement
- Bridge & Culvert Rehabilitation
- Road Rehabilitation
- Community Water Access Improvement
- Water Quality & Filtration Intervention
- Primary Healthcare Access & Staffing Support
- Electricity Feeder Reliability
- School Classroom Rehabilitation

These are **candidate interventions**, not government-approved projects.

---

### 📈 7. Impact Simulation

Planners can interactively explore hypothetical scenarios by changing:

- Coverage
- Effectiveness

The simulation estimates how those assumptions could affect:

- Demand
- Infrastructure conditions
- Development gap

These are scenario calculations — **not predictions of real-world outcomes.**

---

# 🔄 The Intelligence Pipeline

```text
┌──────────────────────────┐
│      CITIZEN VOICES      │
│      Text + Voice        │
│  English / Hindi / Bengali│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       GEMINI AI          │
│   Civic Interpretation   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    DEMAND CLUSTERING     │
│    Problem Signatures    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     DEMAND HOTSPOTS      │
│   Geographic Patterns    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    DEVELOPMENT CONTEXT   │
│ Infrastructure • Demographics │
│       • Investment       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     DEVELOPMENT GAP      │
│      4-Factor Model      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     PRIORITY SIGNAL      │
│      5-Factor Model      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    CANDIDATE PROJECT     │
│   Intervention Archetype │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    IMPACT SIMULATION     │
│  Interactive Scenarios   │
└──────────────────────────┘
```

---

# 🧩 Platform Features

| Feature | Description |
|---|---|
| 🗣️ **Citizen Voice** | Text and voice-based civic reporting |
| 🌐 **Multilingual Intake** | English, Hindi and Bengali |
| 📍 **Location Cascade** | State → District → Locality |
| 🧠 **Gemini Interpretation** | Server-side structured civic analysis |
| 🔎 **Demand Clustering** | Deterministic grouping of related reports |
| 📌 **Demand Hotspots** | Localized concentrations of civic demand |
| 📊 **Development Gap** | Multi-factor development deficit analysis |
| 🎯 **Priority Signals** | Explainable development prioritization |
| 🏗️ **Candidate Projects** | Structured intervention archetypes |
| 📈 **Impact Simulation** | Interactive hypothetical scenarios |
| 🗺️ **Spatial Atlas** | Geographic intelligence across prototype regions |
| 🔬 **Region Intelligence** | Detailed regional development views |
| 🔐 **Trust Center** | Data provenance and model boundaries |
| ⚡ **Live Submissions** | Successful citizen submissions propagate into the intelligence dashboard |

---

# 🧮 Explainable Analytical Models

A major design principle of Baat2Badlav is that the analytical layer remains **deterministic and inspectable**.

## Development Gap

The prototype calculates:

```text
Development Gap =
    0.40 × Demand Signal
  + 0.30 × Infrastructure Need
  + 0.20 × Demographic Pressure
  + 0.10 × Investment Gap
```

### Demand Signal

```text
Demand Signal =
    0.40 × Volume
  + 0.35 × Severity
  + 0.25 × Urgency
```

---

## Priority Signal

```text
Priority Score =
    0.30 × Demand Intensity
  + 0.30 × Development Gap
  + 0.15 × Urgency
  + 0.15 × Geographic Concentration
  + 0.10 × Service Pressure
```

The weighting is explicit so that the contribution of each factor can be inspected.

---

## Impact Simulation

The scenario engine calculates:

```text
Combined Strength =
    Coverage × Effectiveness
```

followed by domain responsiveness and bounded gap-reduction calculations.

The simulation is designed to let users explore **what-if scenarios** rather than predict actual future outcomes.

---

# 🧠 Why Gemini?

Gemini is used specifically where unstructured human language benefits from AI interpretation.

### Gemini handles:

- Natural-language understanding
- Multilingual civic testimony
- Civic-domain classification
- Issue extraction
- Signal extraction
- Severity interpretation
- Urgency interpretation
- Structured JSON generation

### Deterministic services handle:

- Demand clustering
- Hotspot aggregation
- Development gap calculations
- Priority calculations
- Candidate project mapping
- Impact simulation

This separation keeps the AI layer useful while keeping the analytical decision-support layer reproducible.

---

# 🔐 Trust, Privacy & Responsible AI

Baat2Badlav is designed around clear boundaries between **reported experience, AI interpretation, analytical signals and verified public information.**

| Platform Concept | Represents | Does Not Represent |
|---|---|---|
| **Citizen Report** | Self-reported community experience | A legally verified audit |
| **AI Interpretation** | Machine-structured civic context | A government record |
| **Synthetic Baseline** | Prototype reference indicators | Live official statistics |
| **Development Gap** | Analytical deficit signal | A budget allocation |
| **Priority Signal** | Relative development signal | A political mandate |
| **Candidate Project** | Illustrative intervention | An approved project |
| **Impact Simulation** | Hypothetical scenario | A measured forecast |

### Privacy principles

- No account required
- No password collection
- No Aadhaar collection
- No phone-number requirement
- No email requirement
- No invasive GPS tracking
- Gemini API credentials remain server-side
- Citizen testimony is treated as untrusted input
- No automatic government verification claims

The platform also includes client-side warnings for potentially identifying information such as phone numbers, email addresses and house numbers.

---

# 🗺️ Spatial Intelligence

The platform includes a **Spatial Corridor Atlas** designed to provide geographic context for demand patterns.

Prototype regions include locations across:

- West Bengal
- Bihar
- Odisha
- Rajasthan
- Kerala
- Jharkhand

The atlas provides an interactive geographic view with:

- Pan
- Zoom
- Region selection
- Development corridors
- Demand context
- Regional intelligence navigation

The geographic prototype uses explicitly defined demonstration data rather than claiming live government geospatial feeds.

---

# 🖥️ Application Routes

| Route | Purpose |
|---|---|
| `/` | Product landing page and platform introduction |
| `/citizen` | Citizen voice and text submission |
| `/citizen/result` | AI interpretation and submission review |
| `/dashboard` | Development Intelligence Dashboard |
| `/dashboard/region/:id` | Regional intelligence deep dive |
| `/trust` | Trust, data provenance and methodology |

The application also supports graceful handling of direct navigation to client-side routes.

---

# 🏛️ Architecture

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │ React + TypeScript   │
                         │ Tailwind + Motion    │
                         └──────────┬───────────┘
                                    │
                                    │ /api/interpret
                                    ▼
                         ┌──────────────────────┐
                         │    Server API Layer  │
                         │    Node + Express    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Google Gemini     │
                         │    Server-side AI    │
                         └──────────────────────┘


              ┌────────────────────────────────────┐
              │       Deterministic Engine Layer  │
              │                                    │
              │  Demand Clustering                 │
              │  Development Gap                   │
              │  Priority                          │
              │  Candidate Projects                │
              │  Impact Simulation                 │
              └────────────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Intelligence Dashboard│
                    │ + Spatial Atlas       │
                    │ + Region Intelligence │
                    └──────────────────────┘
```

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4 |
| **Animation** | Framer Motion |
| **Icons** | Lucide React + Material Symbols |
| **AI** | Google Gemini API |
| **Gemini SDK** | `@google/genai` |
| **Backend** | Node.js + Express |
| **State Management** | React state & hooks |
| **Deployment Architecture** | Vercel-compatible serverless architecture |
| **Package Manager** | npm |

---

# 📁 Project Structure

```text
Baat2Badlav/
│
├── api/
│   └── interpret.ts
│
├── public/
│   └── static assets
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── DemandIntelligenceSection.tsx
│   │
│   ├── data/
│   │   ├── locations.ts
│   │   ├── mockData.ts
│   │   ├── syntheticCitizenReports.ts
│   │   └── syntheticDevelopmentContext.ts
│   │
│   ├── hooks/
│   │   └── useSpeechRecognition.ts
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── CitizenVoicePage.tsx
│   │   ├── AIInterpretationPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── RegionIntelligencePage.tsx
│   │   └── TrustDataPage.tsx
│   │
│   ├── services/
│   │   ├── clusteringService.ts
│   │   ├── developmentGapService.ts
│   │   ├── priorityService.ts
│   │   ├── projectService.ts
│   │   └── impactSimulationService.ts
│   │
│   ├── server/
│   │   ├── index.ts
│   │   ├── ai/
│   │   │   ├── config.ts
│   │   │   └── geminiService.ts
│   │   └── api/
│   │       └── interpretHandler.ts
│   │
│   ├── types/
│   │   └── domain-specific TypeScript models
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
├── vite.config.ts
└── LICENSE
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm
- Google Gemini API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/sc-likes-to-code/Baat2Badlav.git
cd Baat2Badlav
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Gemini

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key
```

> **Important:** Never expose the Gemini API key using a `VITE_` prefixed variable. The key is intentionally accessed only from the server-side runtime.

---

## 4. Start the Development Server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 5. Verify the Project

### TypeScript Check

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

---

# ☁️ Deployment

The application is structured for deployment as a single Vercel project.

The deployment architecture is:

```text
Vercel
│
├── Static React/Vite Application
│
└── /api/interpret
        │
        └── Serverless Node Function
                │
                └── Google Gemini API
```

The frontend continues to communicate with the backend through:

```text
POST /api/interpret
```

Because the request uses the same origin, no separate client-side CORS configuration is required.

### Required Environment Variable

Configure the following environment variable in the deployment platform:

```text
GEMINI_API_KEY
```

The key is consumed server-side and is not bundled into the client application.

---

# 🧪 Validation

The project separates deterministic validation from live AI calls.

### Build Validation

```bash
npm run build
```

### Type Validation

```bash
npm run lint
```

The deterministic analytical services are designed to preserve:

- Bounded scores
- Zero-input behavior
- Monotonic scenario behavior
- Stable calculations
- Valid parent-child data lineage

---

# 📊 Prototype Data

The current prototype uses **synthetic demonstration data** for development-context and analytical baselines.

This allows the complete intelligence pipeline to operate without presenting fabricated prototype values as live government statistics.

The architecture is intentionally designed so that future data adapters can replace prototype baselines with appropriate verified public datasets.

### Data Boundary

```text
Citizen Reports
      ↓
Actual user submissions during runtime
      ↓
Gemini interpretation
      ↓
Deterministic analytics
      ↓
Prototype intelligence layer
```

Prototype development-context indicators remain clearly distinguished from verified official datasets.

---

# 🔮 Future Direction

The current prototype establishes the complete intelligence workflow.

Potential extensions include:

- Integration with verified open government datasets
- Expanded district coverage
- Additional Indian languages
- Improved speech-to-text capabilities
- Official data adapters
- More detailed regional dossiers
- Multi-project scenario comparison
- Exportable civic intelligence reports
- Panchayat and district-level deployment workflows
- Larger-scale demand aggregation
- Additional infrastructure domains

These represent future integrations and capabilities rather than claims about the current prototype.

---

# 🎯 Design Principles

### Human-Led

Technology supports civic planning; it does not replace human judgement.

### Explainable

Important analytical outputs can be traced to explicit factors and formulas.

### AI-Assisted

AI is used where natural-language interpretation benefits from it.

### Deterministic

The analytical core is reproducible and inspectable.

### Privacy-Conscious

The platform minimizes unnecessary personal data collection.

### Transparent

Prototype data and hypothetical simulations are clearly distinguished from verified facts.

### India-First

The experience is designed around Indian administrative structures, multilingual participation and regional development contexts.

---

# 🤝 Project Philosophy

Baat2Badlav is built around a simple idea:

> **A citizen's experience is a signal.  
> When enough signals are structured responsibly, they can reveal patterns.  
> When those patterns are made explainable, they can support better human decisions.**

The platform therefore focuses on the complete journey:

```text
Voice
  ↓
Understanding
  ↓
Evidence
  ↓
Pattern
  ↓
Context
  ↓
Priority
  ↓
Scenario
  ↓
Human Decision
```

The final decision always remains with the people and institutions responsible for making it.

---

# 📜 License

This project is licensed under the **Apache License 2.0**.

See [`LICENSE`](./LICENSE) for the complete license text.

---

<p align="center">
  <strong>Baat2Badlav</strong><br>
  <em>From Citizen Voices to Development Intelligence.</em>
</p>

<p align="center">
  Built for transparent, explainable and human-centered civic technology.
</p>