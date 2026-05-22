# Jackometer

Your AI-powered academic fortress.

## Vercel Setup

To deploy Jackometer on Vercel, follow these instructions:

1. Connect your repository to Vercel.
2. Under "Environment Variables" in your Vercel project settings, add the following key:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Vercel automatically matches the Node.js version to 20 based on the `.nvmrc` file provided inside this repository.
4. Deploy the application.

## Local Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Gemini API key in `.env.local`.
3. Run `npm install` and `npm run dev`.
