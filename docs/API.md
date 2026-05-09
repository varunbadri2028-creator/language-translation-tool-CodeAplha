# 📡 API Documentation

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** Set via `NEXT_PUBLIC_API_URL` environment variable

---

## Endpoints

### `GET /api/health`

Health check endpoint used by deployment platforms.

**Response (200):**
```json
{
  "status": "success",
  "message": "LinguaTranslate API is running",
  "timestamp": "2026-05-09T10:30:00.000Z",
  "environment": "development"
}
```

---

### `GET /api/languages`

Returns all supported languages.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "languages": [
      { "code": "en", "name": "English", "nativeName": "English" },
      { "code": "es", "name": "Spanish", "nativeName": "Español" },
      { "code": "fr", "name": "French", "nativeName": "Français" }
    ],
    "count": 40
  }
}
```

---

### `POST /api/translate`

Translates text from source language to target language.

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

**Validation Rules:**
| Field | Rule | Error Message |
|-------|------|--------------|
| `text` | Required, max 5,000 chars | "Text to translate is required." |
| `sourceLanguage` | Required, 2-5 char code | "Source language is required." |
| `targetLanguage` | Required, 2-5 char code | "Target language is required." |

**Success Response (200):**
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

**Error Responses:**

| Status | Scenario | Example |
|--------|---------|---------|
| 400 | Invalid input | `{"status":"fail","message":"Text to translate is required."}` |
| 429 | Rate limit exceeded | `{"status":"fail","message":"Too many requests."}` |
| 502 | Translation API error | `{"status":"error","message":"Translation service is temporarily unavailable."}` |
| 503 | Network error | `{"status":"error","message":"Unable to reach translation service."}` |
| 504 | Timeout | `{"status":"error","message":"Translation request timed out."}` |

---

## Error Response Format

All errors follow this consistent format:

```json
{
  "status": "fail" | "error",
  "message": "Human-readable error description"
}
```

- `"fail"` = Client error (4xx) — bad input, rate limit, etc.
- `"error"` = Server error (5xx) — something broke on our end

In development, additional fields are included:
```json
{
  "status": "error",
  "message": "Something went wrong.",
  "error": "Detailed error message",
  "stack": "Error stack trace..."
}
```

---

## Rate Limiting

- **Window:** 60 seconds
- **Max Requests:** 100 per IP per window
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- **Exceeded:** Returns 429 with message

---

## CORS

Only requests from the configured `CORS_ORIGIN` are allowed.
Default: `http://localhost:3000`
