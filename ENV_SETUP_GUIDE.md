# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

### 🔴 CRITICAL - Must Have

```bash
# NextAuth Configuration (MANDATORY)
NEXTAUTH_SECRET=your-secret-here-minimum-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (MANDATORY for Prisma)
DATABASE_URL=your-mongodb-connection-string
```

### 🟡 OPTIONAL - For Google OAuth

```bash
# Google OAuth (Optional - only needed if using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 🟢 OTHER - Application Specific

```bash
# Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

## How to Generate NEXTAUTH_SECRET

### On Windows (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### On Mac/Linux:
```bash
openssl rand -base64 32
```

### Online Generator:
Visit: https://generate-secret.vercel.app/32

## MongoDB Connection String Format

```
mongodb://username:password@host:port/database?options
```

Or for MongoDB Atlas:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Verification Steps

1. **Create `.env.local` file** in the project root
2. **Add all required variables** (at minimum: NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL)
3. **Restart your development server** completely
4. **Check server logs** for any environment variable warnings
5. **Test the endpoint**: Visit `http://localhost:3000/api/auth/session`

## Common Issues

### Issue: "NEXTAUTH_SECRET is missing"
- **Fix**: Generate a secret using one of the methods above and add it to `.env.local`

### Issue: "Cannot connect to database"
- **Fix**: Verify your DATABASE_URL is correct and your MongoDB instance is running/accessible

### Issue: "NEXTAUTH_URL is not set"
- **Fix**: Add `NEXTAUTH_URL=http://localhost:3000` to `.env.local` (or your actual port)

### Issue: Still getting HTML error page
- **Fix**: 
  1. Verify all required variables are set
  2. Completely stop and restart the server
  3. Clear `.next` cache: `Remove-Item -Recurse -Force .next`
  4. Check server console for initialization errors

## File Location

Your `.env.local` file should be in:
```
C:\Users\User\Documents\fDigit Technologies\NaijaPrepAI\.env.local
```

**Important**: `.env.local` is typically gitignored, so it won't appear in your repository. You need to create it manually.

