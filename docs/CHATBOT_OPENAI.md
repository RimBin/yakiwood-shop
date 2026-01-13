# Chatbot + OpenAI

This project’s public chatbot (`/api/chatbot`) can optionally use OpenAI to generate conversational replies, while still grounding on your FAQ entries.

## Enable

Add to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

That’s it — when configured, the API will use OpenAI for *low-confidence* FAQ matches.

## Optional tuning (recommended)

```bash
# Model used by the server
OPENAI_CHAT_MODEL=gpt-4o-mini

# Turn OpenAI mode on/off (default: true if OPENAI_API_KEY exists)
CHATBOT_USE_OPENAI=true

# When FAQ confidence is below this value, OpenAI is used (default: 0.75)
CHATBOT_OPENAI_MIN_CONFIDENCE=0.75

# Sampling temperature (default: 0.2)
CHATBOT_OPENAI_TEMPERATURE=0.2

# "Prompt tuning" per language
CHATBOT_SYSTEM_PROMPT_LT=Tu esi Yakiwood pagalbos asistentas...
CHATBOT_SYSTEM_PROMPT_EN=You are a Yakiwood support assistant...
```

Tips:
- If you want OpenAI to answer **almost always**, set `CHATBOT_OPENAI_MIN_CONFIDENCE=1.01`.
- If you want **FAQ-only** answers, unset `OPENAI_API_KEY` or set `CHATBOT_USE_OPENAI=false`.

## Admin status endpoint

Admins can check configuration status (without exposing secrets):

- `GET /api/admin/chatbot-openai`

It returns `configured`, `model`, and active thresholds.

## Security note

Do **not** store `OPENAI_API_KEY` in the browser or in a public CMS/DB. Keep it in server environment variables.
