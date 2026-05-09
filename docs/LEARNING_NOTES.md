# 📝 Learning Notes

## Concepts You've Learned Building This Project

### 1. Clean Architecture
- **Separation of Concerns:** Each folder/file has ONE responsibility
- **Dependency Direction:** UI → Hooks → Services → API (never reversed)
- **Why:** Makes code testable, maintainable, and scalable

### 2. Provider Pattern (Backend)
- **What:** An abstraction layer that lets you swap implementations without changing consumers
- **Real-world example:** Our translation service can use MyMemory, LibreTranslate, or Google — the controller doesn't know or care which one
- **Where:** `server/src/services/translationService.js`

### 3. Custom Hooks (Frontend)
- **What:** Functions that extract stateful logic from components
- **Why:** Components stay focused on rendering; logic is reusable and testable
- **Examples:** `useTranslation`, `useHistory`, `useSpeech`

### 4. Middleware Pattern (Express)
- **What:** Functions that run BETWEEN receiving a request and sending a response
- **Order matters:** Security → Parsing → Rate limiting → Routes → Error handling
- **Why:** Cross-cutting concerns (logging, auth, validation) are applied uniformly

### 5. Container/Presenter Pattern (React)
- **Container:** The page component — manages state via hooks, passes data down
- **Presenter:** UI components — receive props, render UI, emit events up
- **Why:** Separation makes components reusable and testable

### 6. Environment Variables
- **What:** Configuration values stored outside the code
- **Why:** Different values for dev vs production; secrets never committed to git
- **Frontend:** `NEXT_PUBLIC_` prefix makes them available in the browser
- **Backend:** Loaded via `dotenv`, accessed through a centralized config module

### 7. Error Handling Strategy
- **Frontend:** try/catch in hooks, error state in UI, toast notifications
- **Backend:** Custom AppError class → error handler middleware → consistent JSON responses
- **Key insight:** Operational errors (bad input) show user-friendly messages; programming errors show generic messages

### 8. CORS (Cross-Origin Resource Sharing)
- **The problem:** Browsers block requests between different origins (localhost:3000 → localhost:5000)
- **The solution:** Backend explicitly allows requests from the frontend's origin
- **Security:** Only whitelisted origins can access the API

### 9. Rate Limiting
- **Why:** Prevents one user from overwhelming the server or exhausting external API quotas
- **How:** Tracks requests per IP within a time window; returns 429 when exceeded
- **Where:** Applied as middleware before all API routes

### 10. LocalStorage for Persistence
- **What:** Browser-side storage that survives page refreshes
- **Limits:** ~5MB per domain, synchronous, string-only (JSON.stringify/parse)
- **Our use:** Translation history (capped at 50 items)
- **Alternative:** For multi-device sync, you'd use a database (PostgreSQL, MongoDB)

### 11. Web Speech API
- **What:** Browser-native text-to-speech capability
- **Caveat:** Not supported in all browsers — always check `'speechSynthesis' in window`
- **Our approach:** Wrapped in a custom hook that handles compatibility gracefully

### 12. Next.js App Router
- **What:** File-based routing where each folder in `app/` becomes a URL route
- **layout.tsx:** Wraps all pages — persists between navigation
- **page.tsx:** The actual page content for that route
- **Server vs Client:** Layout is a server component; interactive components need `'use client'`

### 13. ShadCN UI
- **What:** NOT a component library you install — it's a CLI that copies components into your project
- **Why:** Full ownership of component code; customize anything without fighting a library
- **Where:** Components live in `src/components/ui/`
- **Philosophy:** Copy-paste > dependencies

### 14. Tailwind CSS v4
- **What:** Utility-first CSS framework — style directly in HTML/JSX
- **v4 changes:** Uses `@theme inline` instead of `tailwind.config.js`
- **Dark mode:** Uses `.dark` class on `<html>` (handled by next-themes)

---

## Key Takeaways

1. **Start with architecture, not code.** The PRD and folder structure come first.
2. **Backend services should be provider-agnostic.** Today it's MyMemory, tomorrow it's Google.
3. **Hooks are React's answer to code reuse.** Extract logic early.
4. **Validate everything.** Never trust user input. Validate on both client and server.
5. **Error handling is not optional.** Users need to know what went wrong.
6. **Environment variables are sacred.** Never hardcode API keys or URLs.
7. **Middleware order matters.** Security first, then parsing, then your routes.
8. **Build for the 80% case, design for the 100% case.** Start with localStorage, design for a database.
