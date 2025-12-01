# Files to Review for NextAuth Error Fix

## Critical Files (Must Review)

### 1. `app/api/auth/[...nextauth]/route.ts`
**Status**: Main auth route handler
**Issue**: Exports `authOptions` which causes module evaluation
**Line 8**: `export const authOptions` - This gets evaluated when imported

### 2. `app/api/lessons/[id]/route.ts` ⚠️ **PRIMARY CULPRIT**
**Status**: Still using old pattern
**Issue**: Imports `authOptions` at module level (line 3)
**Current Code**:
```typescript
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
```
**Needs**: Update to use `auth()` function instead

### 3. `lib/auth.ts`
**Status**: Uses new `auth()` function - should be OK
**Note**: Verify it's not causing circular imports

### 4. `lib/prisma.ts`
**Status**: Prisma client initialization
**Note**: Check if PrismaAdapter is causing issues during module eval

## Supporting Files (Review for Context)

### 5. `app/providers.tsx`
**Status**: SessionProvider configuration
**Note**: Should be fine, but verify basePath settings

### 6. `app/api/dashboard/stats/route.ts`
**Status**: Uses `auth()` function - should be OK
**Note**: Verify it's working correctly

### 7. `app/api/dashboard/weekly-progress/route.ts`
**Status**: Uses `auth()` function - should be OK

### 8. `app/api/dashboard/performance/route.ts`
**Status**: Uses `auth()` function - should be OK

### 9. `app/api/lessons/route.ts`
**Status**: Uses `auth()` function - should be OK

## Configuration Files

### 10. `package.json`
**Note**: NextAuth version `^5.0.0-beta.30` - beta version may have issues

### 11. `next.config.js`
**Note**: Check for any middleware or route configurations

## Key Issues to Address

1. **Module-level `authOptions` export** - Causes initialization during import
2. **`app/api/lessons/[id]/route.ts`** - Still imports `authOptions` directly
3. **PrismaAdapter initialization** - May be evaluated too early
4. **NextAuth v5 beta compatibility** - May need different pattern for Next.js 16

## Recommended Fixes

1. Make `authOptions` a getter function instead of direct export
2. Update `app/api/lessons/[id]/route.ts` to use `auth()` function
3. Consider moving `authOptions` to a separate file that doesn't initialize NextAuth
4. Verify Prisma client is initialized correctly

