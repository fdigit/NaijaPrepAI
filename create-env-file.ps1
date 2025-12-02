# PowerShell script to create .env.local file
# Run this script: .\create-env-file.ps1

# Generate a random NEXTAUTH_SECRET
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

$envContent = @"
# NextAuth Configuration (REQUIRED)
# Generated secret - keep this secure and never commit to git!
NEXTAUTH_SECRET=$secret
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (REQUIRED)
# Replace with your actual MongoDB connection string
# NEVER commit actual connection strings to git!
DATABASE_URL=your-mongodb-connection-string-here

# Google OAuth (OPTIONAL - only if using Google sign-in)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini API (OPTIONAL - for AI features)
# NEVER commit actual API keys to git!
# GEMINI_API_KEY=your-gemini-api-key
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8
Write-Host "✅ Created .env.local file!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  SECURITY WARNING:" -ForegroundColor Red
Write-Host "   - This file contains secrets and should NEVER be committed to git" -ForegroundColor Yellow
Write-Host "   - Update DATABASE_URL with your actual MongoDB connection string" -ForegroundColor Yellow
Write-Host "   - Add your GEMINI_API_KEY if using AI features" -ForegroundColor Yellow
Write-Host ""

