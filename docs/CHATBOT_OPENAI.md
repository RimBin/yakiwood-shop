# Chatbot + OpenAI

This project’s public chatbot (`/api/chatbot`) can optionally use OpenAI to generate conversational replies, while grounding on your knowledge base (Q/A entries).

## Enable

Add to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

That’s it — when configured, the API can run in one of three modes (see below).

## Optional tuning (recommended)

```bash
# Model used by the server
OPENAI_CHAT_MODEL=gpt-4o-mini

# Turn OpenAI mode on/off (default: true if OPENAI_API_KEY exists)
CHATBOT_USE_OPENAI=true

# OpenAI mode:
# - always: always use OpenAI (default)
# - fallback: use knowledge-base answer when confidence is high, otherwise OpenAI
# - off: disable OpenAI usage
CHATBOT_OPENAI_MODE=always

# When in fallback mode, OpenAI is used if confidence is below this value (default: 0.75)
CHATBOT_OPENAI_MIN_CONFIDENCE=0.75

# Sampling temperature (default: 0.2)
CHATBOT_OPENAI_TEMPERATURE=0.2

# "Prompt tuning" per language
CHATBOT_SYSTEM_PROMPT_LT=Tu esi Yakiwood pagalbos asistentas...
CHATBOT_SYSTEM_PROMPT_EN=You are a Yakiwood support assistant...
```

Tips:
- If you want **OpenAI always**, set `CHATBOT_OPENAI_MODE=always`.
- If you want **knowledge-base only**, set `CHATBOT_OPENAI_MODE=off` or `CHATBOT_USE_OPENAI=false`.
- If you want **hybrid**, set `CHATBOT_OPENAI_MODE=fallback` and tweak `CHATBOT_OPENAI_MIN_CONFIDENCE`.

## Admin-managed settings (optional)

If Supabase is configured, admins can manage non-secret settings (prompts, mode, temperature) via:

- `/admin/chatbot` → `AI` tab

This stores settings in Supabase (`public.chatbot_settings`). The API key (`OPENAI_API_KEY`) still stays in `.env.local`.

## Admin status endpoint

Admins can check configuration status (without exposing secrets):

- `GET /api/admin/chatbot-openai`

It returns `configured`, `model`, and active thresholds.

## Security note

Do **not** store `OPENAI_API_KEY` in the browser or in a public CMS/DB. Keep it in server environment variables.
