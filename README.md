# 📋 Isolated Client Survey System

A modern, highly isolated, and modular **Next.js 14** client survey application crafted with an editorial design aesthetic, dynamic WebGL visual effects, and enterprise-grade security controls.

Designed for high-end digital agency onboarding, discovery, and post-project completion workflows without requiring a traditional database.

---

## ✨ Key Features

- 🎨 **Editorial Design & WebGL Shader Experience**
  - **Dynamic Silk Shader Background:** Built with `OGL` WebGL rendering smooth, theme-aware animated satin silk waves that respond dynamically to light and dark modes.
  - **Smooth Motion Inputs (`SmoothInput`):** Custom inputs driven by `Framer Motion` featuring physics-based spring-animated caret positioning.
  - **Circular Theme Transition:** Theme toggling powered by native `View Transitions API` for seamless circular radial mask animations.

- 🔒 **Multi-Layered Security Architecture**
  - **Cloudflare Turnstile Protection:** Anti-bot challenge verification gate. The submit button is strictly locked until Turnstile verification passes.
  - **Honeypot Traps:** Invisible bot-bait fields returning silent fake-success responses to automated spammers.
  - **HMAC Cookie Rate Limiting:** Signed cookie rate limiting preventing spam submissions.

- ⚡ **Zero-Database Declarative JSON Engine**
  - Surveys are defined as pure JSON configurations.
  - **Dynamic Zod Validation:** Automatic runtime validation schemas generated on-the-fly based on survey question rules.

- 📧 **Automated Email Notifications**
  - Instant dispatch of structured survey responses via **Resend API**.
  - Built-in development mode fallback simulating email dispatch directly to console logs.

- 🌍 **Native Internationalization (i18n)**
  - Seamless dual-language support (**Turkish** / **English**) with instant switching.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & RSC) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Design Tokens |
| **WebGL Graphics** | [OGL](https://github.com/oamap/ogl) (Lightweight WebGL Shader Engine) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Email Delivery** | [Resend](https://resend.com/) |
| **Bot Protection** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📂 Project Structure

```
survey-app/
├── app/                           # Next.js App Router Entry Points
│   ├── layout.tsx                 # Root Layout & Theme Initialization Script
│   ├── globals.css                # Tailwind CSS Import & Tokens
│   ├── (survey)/
│   │   ├── layout.tsx             # Survey Shell Layout (Silk Background + Controls)
│   │   ├── [slug]/page.tsx        # Dynamic Survey Page Renderer
│   │   └── thank-you/page.tsx     # Submission Confirmation Page
│   ├── not-found.tsx              # Clean 404 Error Page
│   └── api/
│       └── survey/submit/route.ts # Verification & Submission API Route
├── survey/                        # Modular Core Domain Logic
│   ├── data/surveys/              # Survey JSON Definitions
│   │   ├── client-onboarding.json     # Project Discovery & Onboarding Survey
│   │   └── project-completion.json    # Project Delivery & Feedback Survey
│   ├── components/                # UI Components
│   │   ├── smooth-input.tsx       # Physics-based Caret Animated Input
│   │   ├── silk.tsx               # OGL WebGL Silk Shader Component
│   │   ├── survey-form.tsx        # Step-by-step Survey Form Engine
│   │   ├── survey-shell.tsx       # Layout Wrapper
│   │   ├── theme-toggle.tsx       # View Transition Theme Switcher
│   │   ├── language-switcher.tsx  # Dual-language Switcher
│   │   ├── turnstile-widget.tsx   # Cloudflare Turnstile Wrapper
│   │   └── question-types/        # Short Text, Long Text, Single/Multi Choice, Rating
│   ├── i18n/                      # Localization Dictionaries & Provider
│   ├── lib/                       # Validation Schemas, Rate Limiter, Resend Integration
│   └── styles/
│       └── tokens.css             # High-Contrast CSS Variables
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript Settings
└── README.md                      # Documentation
```

---

## ⚙️ Getting Started

### 1. Prerequisites

- **Node.js**: `v18.17.0` or higher
- **pnpm**: `v9.0.0` or higher (recommended)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/isolated-survey-system.git
cd isolated-survey-system
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Resend Email Configuration
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=surveys@yourdomain.com
NOTIFICATION_TO_EMAIL=admin@yourdomain.com

# Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

*Note: If `RESEND_API_KEY` is omitted, the application automatically enters **Development Mode** and prints email contents directly to the console.*

---

## 🚀 Running the Application

### Development Server

Start the dev server on port `3000`:

```bash
pnpm dev
```

Open your browser and navigate to:
- **Client Onboarding Survey:** `http://localhost:3000/client-onboarding`
- **Project Completion Survey:** `http://localhost:3000/project-completion`

### Production Build

Create an optimized production build:

```bash
pnpm build
pnpm start
```

---

## 📝 Defining Custom Surveys

Surveys are defined as standard JSON files inside `survey/data/surveys/`.

Example survey definition (`my-survey.json`):

```json
{
  "token": "my-survey",
  "title": "Client Feedback Survey",
  "description": "Please take a moment to share your feedback.",
  "defaultLanguage": "tr",
  "active": true,
  "expiresAt": null,
  "respondent": {
    "collectName": true,
    "collectEmail": true,
    "collectCompany": false
  },
  "questions": [
    {
      "id": "project_goals",
      "type": "long_text",
      "label": {
        "tr": "Proje hedefleriniz nelerdir?",
        "en": "What are your primary project goals?"
      },
      "required": true
    }
  ]
}
```

Access your new survey immediately at `/my-survey`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
