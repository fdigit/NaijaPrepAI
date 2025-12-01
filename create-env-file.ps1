# PowerShell script to create .env.local file
# Run this script: .\create-env-file.ps1

$envContent = @"
# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=s3d6cZP4CoqyamiG1XKBHSMeThWu2RIr
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (REQUIRED)
# Replace with your actual MongoDB connection string
DATABASE_URL=your-mongodb-connection-string-here

# Google OAuth (OPTIONAL - only if using Google sign-in)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini API (OPTIONAL - for AI features)
# GEMINI_API_KEY=your-gemini-api-key
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8
Write-Host "✅ Created .env.local file!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update DATABASE_URL with your actual MongoDB connection string" -ForegroundColor Yellow
Write-Host ""

