# Troubleshooting: Failed to Generate Lesson Content

## Common Causes and Solutions

### 1. Missing or Invalid GEMINI_API_KEY

**Symptoms:**
- Error message: "Failed to generate lesson content"
- Error message: "API key is missing or invalid"
- Error message: "GEMINI_API_KEY is not configured"

**Solution:**
1. Check if `.env.local` exists in your project root
2. Verify `GEMINI_API_KEY` is set in `.env.local`:
   ```bash
   GEMINI_API_KEY=your-actual-api-key-here
   ```
3. Get a new API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Important**: If your API key was exposed in the security incident, you MUST rotate it:
   - Delete the old key in Google AI Studio
   - Create a new API key
   - Update `.env.local` with the new key
5. **Restart your development server** after updating `.env.local`

### 2. API Key Not Loaded in Server Environment

**Symptoms:**
- API key works in some places but not others
- Error occurs only in server-side code

**Solution:**
1. Ensure `.env.local` is in the project root (not in a subdirectory)
2. For Next.js, environment variables are automatically loaded
3. Restart the server completely:
   ```powershell
   # Stop server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### 3. API Quota Exceeded

**Symptoms:**
- Error message: "API quota exceeded"
- Error message: "You have exceeded your API quota"

**Solution:**
1. Check your [Google AI Studio](https://aistudio.google.com/app/apikey) account
2. Verify your quota limits
3. Wait for quota reset or upgrade your plan
4. Check if you're making too many requests

### 4. Network/Connection Issues

**Symptoms:**
- Error message: "Network error"
- Error message: "Unable to connect to the AI service"
- Timeout errors

**Solution:**
1. Check your internet connection
2. Verify firewall isn't blocking requests
3. Try again after a few moments
4. Check if Google AI Studio is experiencing outages

### 5. Invalid Request Data

**Symptoms:**
- Error message: "Invalid request"
- Error message: "Missing required fields"

**Solution:**
1. Ensure all form fields are filled:
   - Class Level
   - Subject
   - Term
   - Week
   - Topic
2. Try with a different topic if the current one is too obscure
3. Check browser console for specific validation errors

## Quick Diagnostic Steps

### Step 1: Verify Environment Variable
```powershell
# Check if .env.local exists
Test-Path .env.local

# View .env.local (be careful not to expose secrets)
Get-Content .env.local | Select-String "GEMINI_API_KEY"
```

### Step 2: Check Server Logs
Look for these messages in your server console:
- `⚠️ GEMINI_API_KEY is not set in environment variables` - API key is missing
- `Gemini API Error:` - Check the error details after this message

### Step 3: Test API Key Manually
You can test if your API key is valid by checking the Google AI Studio dashboard or making a test API call.

### Step 4: Verify Server Restart
After updating `.env.local`, you MUST restart the server:
1. Stop the server (Ctrl+C)
2. Wait a few seconds
3. Start again: `npm run dev`

## After Security Incident

If you're seeing errors after the security incident (December 1, 2025):

1. **Your old API key was exposed** - it needs to be rotated
2. **Delete the old key** in [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Create a new API key**
4. **Update `.env.local`** with the new key
5. **Restart your server**
6. **Update Vercel environment variables** if you're deployed

## Still Having Issues?

1. Check the server console for detailed error messages
2. Verify your API key format (should start with a specific prefix)
3. Ensure you're using the correct API key (not a client ID or secret)
4. Check if there are any rate limits or restrictions on your Google AI Studio account
5. Try generating a lesson with a simple, common topic first

## Error Message Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "API key is missing or invalid" | GEMINI_API_KEY not set or invalid | Add/update key in .env.local and restart |
| "API quota exceeded" | Too many requests | Check Google AI Studio quota limits |
| "Network error" | Connection issue | Check internet, try again |
| "Invalid request" | Missing form fields | Fill all required fields |
| "Failed to generate lesson content" | Generic error | Check server logs for details |

---

**Last Updated**: December 1, 2025

