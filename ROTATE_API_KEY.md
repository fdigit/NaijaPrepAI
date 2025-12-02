# 🔑 Rotate Your Gemini API Key - URGENT

## ⚠️ Your API Key Has Been Revoked

Google has revoked your API key because it was exposed in the security incident. You **must** create a new one.

## Steps to Rotate API Key

### Step 1: Delete the Old Key
1. Go to [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)
2. Find the key that starts with `AIzaSyB3qr...`
3. Click the **Delete/Trash** icon to remove it

### Step 2: Create a New API Key
1. On the same page, click **"Create API Key"**
2. Select your Google Cloud project (or create a new one)
3. Copy the **new API key** immediately (you won't see it again!)

### Step 3: Update .env.local
1. Open `.env.local` in your project root
2. Find the line: `GEMINI_API_KEY=AIzaSyB3qr...`
3. Replace it with: `GEMINI_API_KEY=your-new-api-key-here`
4. **Save the file**

### Step 4: Restart Your Server
```powershell
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test
Try generating a lesson again. It should work now!

## ⚠️ Important Security Notes

1. **Never commit** `.env.local` to git (it's already in `.gitignore`)
2. **Never share** your API key publicly
3. **Rotate immediately** if a key is exposed
4. Consider setting **API key restrictions** in Google Cloud Console:
   - Restrict by IP address
   - Restrict by HTTP referrer
   - Set usage quotas

## Setting API Key Restrictions (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key
4. Click **Edit**
5. Under **API restrictions**, select **Restrict key**
6. Choose **Generative Language API** only
7. Under **Application restrictions**, you can:
   - Restrict by IP (for server-side use)
   - Restrict by HTTP referrer (for client-side use)
8. **Save**

This prevents unauthorized use even if the key is exposed again.

---

**After completing these steps, your lesson generation should work!** ✅

