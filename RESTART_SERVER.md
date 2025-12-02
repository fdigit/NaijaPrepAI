# How to Restart Next.js Dev Server

## Quick Steps

1. **Stop the current server:**
   - In the terminal where `npm run dev` is running, press `Ctrl+C`
   - Wait for it to fully stop

2. **Clear Next.js cache (optional but recommended):**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

3. **Restart the server:**
   ```powershell
   npm run dev
   ```

## Why This Is Needed

Next.js loads environment variables from `.env.local` **only when the server starts**. If you:
- Added a new environment variable
- Changed an existing environment variable
- Created `.env.local` after starting the server

You **must restart** the server for the changes to take effect.

## Verify It's Working

After restarting, try generating a lesson again. The API key should now be loaded.

If you still see errors, check the server console output for any error messages.

