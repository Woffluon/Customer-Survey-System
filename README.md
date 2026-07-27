# Isolated Client Survey System

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3.23-3E67B1?style=flat-square&logo=zod&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A lightweight Next.js 14 survey engine designed for client onboarding and project completion workflows. It runs without a database, parsing declarative JSON files into dynamic validation schemas and delivering responses over email.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (WebGL & Motion)"]
        UI["User Interface"]
        Shader["OGL WebGL Silk Canvas"]
        Inputs["Framer Motion Caret Inputs"]
        TurnstileWidget["Cloudflare Turnstile Widget"]
    end

    subgraph SecurityLayer["Security & Gateway Pipeline"]
        TurnstileCheck{"1. Turnstile Verified?"}
        HoneypotCheck{"2. Honeypot Clean?"}
        RateLimitCheck{"3. Cookie HMAC Valid?"}
    end

    subgraph CoreEngine["Server Execution Engine"]
        JSONParser["JSON Config Loader"]
        ZodCompiler["Dynamic Zod Schema Compiler"]
        FormValidator["Runtime Payload Validator"]
        Mailer["Resend Mail Dispatcher"]
    end

    UI --> TurnstileWidget
    TurnstileWidget -- Token Generated --> UI
    UI -- "POST /api/survey/submit" --> TurnstileCheck

    TurnstileCheck -- No --> Reject403["403 Forbidden"]
    TurnstileCheck -- Yes --> HoneypotCheck

    HoneypotCheck -- Bot Detected --> SilentSuccess["200 Fake Success"]
    HoneypotCheck -- Clean --> RateLimitCheck

    RateLimitCheck -- Exceeded --> Reject429["429 Rate Limited"]
    RateLimitCheck -- Pass --> JSONParser

    JSONParser --> ZodCompiler
    ZodCompiler --> FormValidator
    FormValidator -- Invalid --> Reject400["400 Field Errors"]
    FormValidator -- Valid --> Mailer
    Mailer --> AdminEmail["Admin Inbox (HTML Notification)"]
```

---

## Data Pipeline & Schema Compilation

```mermaid
sequenceDiagram
    autonumber
    actor Client as Visitor Browser
    participant API as /api/survey/submit
    participant Config as survey/data/surveys/*.json
    participant Schema as survey/lib/survey-schema.ts
    participant Resend as Resend Mailer API

    Client->>API: Submit JSON Payload (Answers + Respondent + Tokens)
    API->>Config: Fetch Survey Config by Token
    Config-->>API: Return Raw Survey Schema Definition
    API->>Schema: buildSurveySchema(config)
    Note over Schema: Compiles Zod Object dynamically<br/>matching Question Types & Required Rules
    Schema-->>API: Executable Zod Schema
    API->>API: schema.safeParse(payload)
    alt Validation Failed
        API-->>Client: 400 Bad Request + Field Error Map
    else Validation Succeeded
        API->>Resend: sendNotificationEmail(validatedData)
        Resend-->>API: 200 OK (Message ID)
        API-->>Client: 200 Success + Redirect URL
    end
```

---

## Technical Features

> [!NOTE]
> All visual assets, shaders, and micro-interactions run on the client's GPU via WebGL, keeping server-side CPU consumption near zero.

### 1. Declarative JSON Survey Configuration
Surveys are written as plain JSON definitions. The server reads the file on demand and compiles a Zod validation schema matching question types and requirements.

### 2. Multi-Layer Security
- **Cloudflare Turnstile:** Submission buttons are disabled until the client challenge resolves.
- **Honeypot Traps:** Silent failure routing traps malicious automated submitters.
- **Signed Cookie Rate Limiting:** HMAC-signed cookies prevent rapid repeated POST requests.

### 3. Theme-Aware WebGL Shader
Background rendering uses custom satin silk shaders via OGL. A MutationObserver detects document root class changes, switching shader color palettes dynamically between light mode (`#ECEAE4`) and dark mode (`#36323B`).

### 4. Zero Database Requirement
Responses compile into styled HTML emails delivered via Resend. In development mode without API keys, payloads output directly to `stdout`.

---

## Stack Specifications

| Layer | Library / Engine | Technical Role |
| :--- | :--- | :--- |
| **Core** | Next.js 14.2 (App Router) | React Server Components, Server Actions |
| **Language** | TypeScript 5.8 | Strict type assertions across JSON & runtime APIs |
| **Styling** | Tailwind CSS v4 | CSS variable design tokens and utility rules |
| **Graphics** | OGL 1.0 | Low-overhead WebGL shader pipeline |
| **Motion** | Framer Motion 12 | Caret position spring physics |
| **Validation** | Zod 3.23 | Dynamic runtime schema synthesis |
| **Email** | Resend 4.0 | Direct HTML mail dispatch |
| **Bot Gate** | React Turnstile | Cloudflare Turnstile token validation |

---

## Performance and Resource Footprint

```
Memory Allocation (RAM):
  [====================                        ] 70 MB (Idle)
  [============================                ] 110 MB (Active Submit)

CPU Load (1 vCPU Core):
  [=                                           ] <1% (Idle)
  [===                                         ] <5% (Spike during POST parsing)
```

---

## Project Structure

```
.
├── app/                           # Next.js App Router entry points
│   ├── layout.tsx                 # Root layout, Google fonts, theme init script
│   ├── globals.css                # Tailwind imports and CSS token definitions
│   ├── (survey)/                  # Route group sharing the survey shell
│   │   ├── layout.tsx             # Shell wrapper with floating controls
│   │   ├── [slug]/page.tsx        # Dynamic survey page loader
│   │   └── thank-you/page.tsx     # Submission confirmation page
│   ├── not-found.tsx              # Clean 404 page
│   └── api/
│       └── survey/submit/route.ts # Verification and mail submission route
├── survey/                        # Core domain logic
│   ├── data/surveys/              # JSON survey configs (onboarding, completion)
│   ├── components/                # UI components, question types, WebGL canvas
│   ├── i18n/                      # Turkish / English translation dictionaries
│   ├── lib/                       # Zod schema builder, rate limiter, mailer
│   └── styles/                    # Tokens and color definitions
└── README.md
```

---

## Setup and Development

### Prerequisites
- Node.js `18.17.0` or higher
- pnpm `9.0.0` or higher

### Environment Configuration
Create `.env.local` in the project root:

```env
# Mail Delivery
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=surveys@yourdomain.com
NOTIFICATION_TO_EMAIL=admin@yourdomain.com

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### Installation & Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

Default local routes:
- Onboarding Survey: `http://localhost:3000/client-onboarding`
- Completion Survey: `http://localhost:3000/project-completion`

---

## License

This project is licensed under the MIT License.
