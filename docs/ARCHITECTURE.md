# 📐 Architecture Guide

## Overview

LinguaTranslate follows a **clean, layered architecture** with clear separation of concerns between the frontend (client) and backend (server).

---

## Design Principles

### 1. Single Responsibility Principle (SRP)
Every file and folder has ONE job:
- `controllers/` → Handle HTTP requests/responses
- `services/` → Business logic (translation)
- `middleware/` → Cross-cutting concerns (CORS, rate limiting)
- `validators/` → Input validation
- `hooks/` → Stateful logic on the frontend

### 2. Provider Pattern (Backend)
The translation service uses a provider pattern, making it trivial to swap between APIs:

```
translationService.translate()
        │
        ├── config.translationProvider === 'mymemory'    → MyMemory API
        ├── config.translationProvider === 'libretranslate' → LibreTranslate API
        └── config.translationProvider === 'google'      → Google Translate API
```

**Why?** Your frontend and controllers never know which API is being used. To add a new provider:
1. Write a `translateWithNewProvider()` function in `translationService.js`
2. Add a `case` to the switch statement
3. Update `.env` with the new provider name

### 3. Container/Presenter Pattern (Frontend)
- **Container components** (pages) manage state via hooks
- **Presenter components** (TranslationPanel, HistoryPanel) receive data via props and render UI
- This makes components highly testable and reusable

### 4. Custom Hook Pattern
Instead of putting logic inside components, we extract it into hooks:
- `useTranslation` — manages translation API calls, loading, errors
- `useHistory` — manages localStorage persistence
- `useSpeech` — wraps Web Speech API

---

## Request Lifecycle

```
1. User enters text → clicks "Translate"
2. React state updates → useTranslation hook triggered
3. Hook calls translationService.translateText() → fetch POST /api/translate
4. Express receives request
5. Rate limiter middleware checks request count
6. Validation middleware checks input (text not empty, valid languages)
7. Controller extracts params, calls translationService.translate()
8. Service selects provider (MyMemory/LibreTranslate) based on config
9. Service makes HTTP request to external API via axios
10. External API returns translated text
11. Controller formats response → sends JSON to frontend
12. Frontend hook receives response → updates React state
13. UI re-renders with translated text
14. Translation saved to localStorage history
15. Success toast notification appears
```

---

## Security Layers

| Layer | What It Does | Where |
|-------|-------------|-------|
| **Helmet** | Sets security HTTP headers (XSS, clickjacking, MIME) | `app.js` middleware |
| **CORS** | Only allows requests from our frontend origin | `app.js` middleware |
| **Rate Limiting** | 100 requests/min per IP | `middleware/rateLimiter.js` |
| **Input Validation** | Checks text length, language codes | `validators/` |
| **Body Size Limit** | Max 10KB request body | `app.js` express.json() |
| **Error Masking** | Hides stack traces in production | `middleware/errorHandler.js` |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│  ┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Page │───▶│  Hooks    │───▶│ Services │───▶│  fetch() │──┼──┐
│  │      │◀───│          │◀───│          │◀───│          │  │  │
│  └──────┘    └──────────┘    └──────────┘    └──────────┘  │  │
│      │                                                      │  │
│      ▼                                                      │  │
│  ┌──────────┐                                               │  │
│  │Components│  (receive data via props, render UI)          │  │
│  └──────────┘                                               │  │
└─────────────────────────────────────────────────────────────┘  │
                                                                 │
                         HTTP (JSON)                             │
                                                                 │
┌─────────────────────────────────────────────────────────────┐  │
│                        BACKEND                               │  │
│                                                              │◀─┘
│  ┌──────────┐    ┌────────────┐    ┌───────────┐            │
│  │  Routes   │───▶│Controllers │───▶│  Services  │───▶ External API
│  └──────────┘    └────────────┘    └───────────┘            │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────┐  ┌────────────┐                               │
│  │Middleware │  │ Validators  │   (run BEFORE controller)    │
│  └──────────┘  └────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```
