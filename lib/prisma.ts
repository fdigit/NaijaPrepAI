// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Extend the Global interface for TypeScript to recognize the global prisma property
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// Lazy initialization function - only creates PrismaClient when called
// This prevents module-level evaluation issues with Next.js 16 + Turbopack
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // In production, always create a new client
    return new PrismaClient();
  } else {
    // In development, use the global object to keep a single instance
    if (!global.cachedPrisma) {
      // Create PrismaClient only when function is called (not at module load)
      global.cachedPrisma = new PrismaClient();
    }
    return global.cachedPrisma;
  }
}

// Export as a Proxy to make it truly lazy - only creates client when property is accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    // If it's a function, bind it to the client instance
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
