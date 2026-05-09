# 🌐 LinguaTranslate

> A production-grade language translation web application built with **Next.js**, **Express.js**, and **ShadCN UI**. Translate text across 40+ languages with text-to-speech, translation history, dark mode, and a premium responsive interface.

![License](https://img.shields.io/badge/license-MIT-violet)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Express](https://img.shields.io/badge/Express-5-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

| Feature | Description |
|---------|------------|
| 🌍 **40+ Languages** | Translate between English, Spanish, French, Japanese, Hindi, Arabic, and many more |
| ⚡ **Instant Translation** | Real-time translation via MyMemory/LibreTranslate APIs |
| 🔊 **Text-to-Speech** | Listen to translations using the Web Speech API |
| 📋 **Copy to Clipboard** | One-click copy of translated text |
| 📜 **Translation History** | Persistent history stored in localStorage |
| 🌙 **Dark/Light Mode** | System-aware theme with smooth transitions |
| 📱 **Mobile Responsive** | Works beautifully on all screen sizes |
| 🔄 **Swap Languages** | Instantly reverse source and target languages |
| ⌨️ **Keyboard Shortcuts** | Ctrl+Enter to translate |
| 🛡️ **Rate Limiting** | Built-in API abuse prevention |
| 🏗️ **Provider Pattern** | Easily swap between translation APIs |

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Next.js Frontend   │────▶│  Express Backend     │────▶│  Translation API  │
│   (Port 3000)        │     │  (Port 5000)         │     │  (MyMemory/Libre)  │
│                      │     │                      │     │                    │
│  • React Components  │     │  • Routes            │     │  • Free tier       │
│  • Custom Hooks      │     │  • Controllers       │     │  • No API key      │
│  • Service Layer     │     │  • Services          │     │  • Provider pattern │
│  • Tailwind + ShadCN │     │  • Middleware         │     │                    │
└─────────────────────┘     └─────────────────────┘     └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (v24 recommended)
- **npm** v9+

### 1. Clone the project

```bash
cd lingua-translate
```

### 2. Start the Backend

```bash
cd server
cp .env.example .env    # Create environment file
npm install             # Install dependencies
npm run dev             # Start dev server (port 5000)
```

### 3. Start the Frontend (new terminal)

```bash
cd client
npm install             # Already done if you followed setup
npm run dev             # Start Next.js dev server (port 3000)
```

### 4. Open the app

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Structure

```
lingua-translate/
├── client/                     # 🎨 Next.js Frontend
│   ├── src/
│   │   ├── app/                # Pages & layouts (App Router)
│   │   ├── components/
│   │   │   ├── ui/             # ShadCN UI components
│   │   │   ├── layout/         # Header, ThemeToggle, ThemeProvider
│   │   │   └── translation/    # TranslationPanel, LanguageSelector, HistoryPanel
│   │   ├── hooks/              # useTranslation, useHistory, useSpeech
│   │   ├── lib/                # Utility functions
│   │   ├── services/           # API service layer
│   │   └── types/              # TypeScript interfaces
│   └── public/                 # Static assets
│
├── server/                     # ⚙️ Express.js Backend
│   ├── src/
│   │   ├── config/             # Environment & language config
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Error handler, rate limiter
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Translation provider logic
│   │   ├── utils/              # Logger, AppError
│   │   └── validators/         # Input validation
│   └── .env.example            # Environment template
│
├── docs/                       # 📚 Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── LEARNING_NOTES.md
│
├── README.md
└── .gitignore
```

---

## 🔌 API Documentation

### Health Check

```
GET /api/health
```

### Get Languages

```
GET /api/languages
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "languages": [
      { "code": "en", "name": "English", "nativeName": "English" },
      { "code": "es", "name": "Spanish", "nativeName": "Español" }
    ],
    "count": 40
  }
}
```

### Translate Text

```
POST /api/translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "translatedText": "Hola, ¿cómo estás?",
    "provider": "mymemory",
    "sourceLanguage": "en",
    "targetLanguage": "es",
    "timestamp": "2026-05-09T10:30:00.000Z"
  }
}
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origins |
| `TRANSLATION_PROVIDER` | `mymemory` | API provider: mymemory, libretranslate, google |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per minute per IP |

### Frontend (`client/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend API URL |

---

## 🔄 Translation Providers

The backend uses a **Provider Pattern** — you can swap translation APIs by changing one environment variable:

| Provider | API Key | Free Tier | Config Value |
|----------|---------|-----------|-------------|
| **MyMemory** | Not needed | 5,000 chars/day | `mymemory` |
| **LibreTranslate** | Optional | Varies by instance | `libretranslate` |
| **Google Translate** | Required | Not free | `google` (coming soon) |

To switch providers:
```bash
# In server/.env
TRANSLATION_PROVIDER=libretranslate
LIBRETRANSLATE_URL=https://libretranslate.com
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19 | UI framework with SSR |
| Styling | Tailwind CSS v4, ShadCN UI | Utility-first CSS + component library |
| Backend | Express.js 5, Node.js | REST API server |
| HTTP Client | Axios | Backend API calls to translation services |
| Theme | next-themes | Dark/light mode |
| Icons | Lucide React | Beautiful icon set |
| Validation | express-validator | Server-side input validation |
| Security | Helmet, CORS, Rate Limiting | API protection |

---

## 📝 License

MIT License — free for personal and commercial use.
