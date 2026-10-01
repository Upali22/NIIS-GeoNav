<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/46a56dfd-fca2-4fe0-bed9-0c42e2222d0c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


### Admin data persistence
The deployed demo includes a browser-side persistent campus backup. Successful Admin CMS changes are snapshotted to localStorage and restored on refresh, which protects the demo from Render filesystem resets. For production multi-device persistence, connect the API to a hosted database (Supabase/Postgres/etc.).
