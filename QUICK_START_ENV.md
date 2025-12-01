# Quick Start: Environment Variables Setup

## Step 1: Generate NEXTAUTH_SECRET

Run this command in PowerShell (in your project directory):

```powershell
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_}); Write-Host "Your NEXTAUTH_SECRET: $secret"
```

**OR** use this online generator: https://generate-secret.vercel.app/32

## Step 2: Create .env.local File

Create a file named `.env.local` in your project root with this content:

```bash
# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=paste-your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (REQUIRED)
# Replace with your actual MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/naijaprep
# OR for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/naijaprep?retryWrites=true&w=majority

# Google OAuth (OPTIONAL - only if using Google sign-in)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini API (OPTIONAL - for AI features)
# GEMINI_API_KEY=your-gemini-api-key
```

## Step 3: Update Your Values

1. **NEXTAUTH_SECRET**: Paste the secret you generated in Step 1
2. **NEXTAUTH_URL**: Should be `http://localhost:3000` (or your port if different)
3. **DATABASE_URL**: Replace with your actual MongoDB connection string

## Step 4: Restart Server

After creating `.env.local`:

1. Stop your current server (Ctrl+C)
2. Clear the cache: `Remove-Item -Recurse -Force .next`
3. Restart: `npm run dev`

## Step 5: Test

Visit: `http://localhost:3000/api/auth/session`

You should see JSON like `{}` or `{"user": null}` instead of HTML.

## Need Help?

- Check `ENV_SETUP_GUIDE.md` for detailed instructions
- Check server console for error messages
- Verify all variables are set correctly in `.env.local`

