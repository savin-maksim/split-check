# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Receipt scan proxy

Receipt scanning calls a Supabase Edge Function instead of calling Gemini from the browser.

Local app env:

```env
VITE_RECEIPT_SCAN_FUNCTION_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-receipt
```

Supabase secret:

```bash
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Deploy the function:

```bash
supabase functions deploy analyze-receipt
```
