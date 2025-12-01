// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
// This must be the FIRST line (before any imports) to resolve Prisma initialization errors
export const runtime = 'nodejs';

import type { NextRequest } from 'next/server';

// Dynamic imports to avoid module-level evaluation
// Import NextAuth and providers only when needed
let NextAuthModule: any = null;
let CredentialsProviderModule: any = null;
let GoogleProviderModule: any = null;
let PrismaAdapterModule: any = null;
let PrismaModule: any = null;
let bcryptModule: any = null;

async function getNextAuthModule() {
  if (!NextAuthModule) {
    NextAuthModule = await import('next-auth');
  }
  return NextAuthModule.default;
}

async function getCredentialsProvider() {
  if (!CredentialsProviderModule) {
    CredentialsProviderModule = await import('next-auth/providers/credentials');
  }
  return CredentialsProviderModule.default;
}

async function getGoogleProvider() {
  if (!GoogleProviderModule) {
    GoogleProviderModule = await import('next-auth/providers/google');
  }
  return GoogleProviderModule.default;
}

async function getPrisma() {
  if (!PrismaModule) {
    PrismaModule = await import('@/lib/prisma');
  }
  return PrismaModule.prisma;
}

async function getPrismaAdapter() {
  if (!PrismaAdapterModule) {
    PrismaAdapterModule = await import('@auth/prisma-adapter');
  }
  const prisma = await getPrisma();
  return PrismaAdapterModule.PrismaAdapter(prisma);
}

async function getBcrypt() {
  if (!bcryptModule) {
    bcryptModule = await import('bcryptjs');
  }
  return bcryptModule.default;
}

// Validate required environment variables
function validateEnvVars() {
  const required = ['NEXTAUTH_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please create a .env.local file with these variables. See ENV_SETUP_GUIDE.md for details.`
    );
  }
  
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      '⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long for security.'
    );
  }
}

// Make authOptions a getter function to avoid module-level evaluation
async function getAuthOptions(): Promise<any> {
  // Validate environment variables when options are first requested
  validateEnvVars();
  
  const GoogleProvider = await getGoogleProvider();
  const CredentialsProvider = await getCredentialsProvider();
  
  // Note: Adapter removed temporarily to fix __internal error
  // JWT strategy works without adapter - adapter is only needed for database sessions
  // We can add it back later once NextAuth v5 beta compatibility is resolved
  
  return {
    // adapter: await getPrismaAdapter(), // Temporarily disabled
    secret: process.env.NEXTAUTH_SECRET!,
    trustHost: true,
    basePath: '/api/auth',
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      }),
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Normalize email: trim and lowercase to match database storage
          const email = credentials.email.toString().trim().toLowerCase();
          const password = credentials.password as string;

          try {
            // Import prisma directly - singleton pattern handles hot-reload
            const { prisma } = await import('@/lib/prisma');
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user || !user.password) {
              return null;
            }

            // Verify password
            const bcrypt = await getBcrypt();
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (error) {
            console.error('Auth error:', error);
            return null;
          }
        },
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/auth/signin',
    },
    callbacks: {
      async jwt({ token, user }: { token: any; user: any }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        // Debug logging
        console.log('Session callback - token:', { id: token.id, email: token.email, name: token.name });
        console.log('Session callback - session before:', { hasUser: !!session.user, userKeys: session.user ? Object.keys(session.user) : [] });
        
        // Always ensure user object exists
        if (!session.user) {
          session.user = {};
        }
        
        // Populate user object from token
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.email) {
          session.user.email = token.email;
        }
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.picture || token.image) {
          session.user.image = token.picture || token.image;
        }
        
        console.log('Session callback - session after:', { hasUser: !!session.user, userId: session.user.id, userKeys: Object.keys(session.user) });
        return session;
      },
    },
  };
}

// Note: authOptions is NOT exported to prevent module-level evaluation
// All files should use the auth() function instead
// If you absolutely need authOptions, use getAuthOptions() (internal only)

// Initialize NextAuth - using lazy initialization to avoid module evaluation issues
let nextAuthInstance: any = null;

async function getNextAuth() {
  if (!nextAuthInstance) {
    try {
      const NextAuth = await getNextAuthModule();
      const authOptions = await getAuthOptions();
      nextAuthInstance = NextAuth(authOptions);
    } catch (error: any) {
      console.error('❌ Failed to initialize NextAuth:', error);
      if (error.message?.includes('environment variables')) {
        console.error('\n📋 Please check ENV_SETUP_GUIDE.md for setup instructions.');
      }
      throw error;
    }
  }
  return nextAuthInstance;
}

// Export handlers with explicit parameter handling and error handling
export async function GET(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  try {
    const { handlers } = await getNextAuth();
    return handlers.GET(req as any);
  } catch (error: any) {
    console.error('❌ Auth GET handler error:', error);
    // Return a proper JSON error response instead of HTML
    return new Response(
      JSON.stringify({ 
        error: 'Authentication configuration error',
        message: error.message || 'Please check your environment variables. See ENV_SETUP_GUIDE.md'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  try {
    const { handlers } = await getNextAuth();
    return handlers.POST(req as any);
  } catch (error: any) {
    console.error('❌ Auth POST handler error:', error);
    // Return a proper JSON error response instead of HTML
    return new Response(
      JSON.stringify({ 
        error: 'Authentication configuration error',
        message: error.message || 'Please check your environment variables. See ENV_SETUP_GUIDE.md'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Export auth utilities - all lazy to avoid module-level initialization
export async function auth(req?: Request | NextRequest | any) {
  const nextAuth = await getNextAuth();
  try {
    if (req) {
      // For NextRequest, we need to construct a proper Request with cookies
      let request: Request;
      
      if (req instanceof Request) {
        // It's already a Request
        request = req;
      } else {
        // It's a NextRequest - get URL and headers properly
        let url: string;
        let headers: Headers;
        
        // For NextRequest, use url property directly (it's always available)
        url = (req as any).url || (req as any).href || 'http://localhost:3000';
        
        // CRITICAL: Copy all headers including cookies from NextRequest
        // NextRequest.headers is a Headers object, we need to copy it properly
        if ((req as any).headers) {
          headers = new Headers();
          // Copy all headers from NextRequest to new Headers object
          (req as any).headers.forEach((value: string, key: string) => {
            headers.set(key, value);
          });
        } else {
          headers = new Headers();
        }
        
        request = new Request(url, {
          method: (req as any).method || 'GET',
          headers: headers,
        });
      }
      
      const result = await nextAuth.auth(request as any);
      console.log('auth() result with request:', {
        hasResult: !!result,
        hasUser: !!result?.user,
        userId: result?.user?.id,
        resultKeys: result ? Object.keys(result) : [],
        resultType: typeof result,
        resultStringified: JSON.stringify(result),
      });
      
      // NextAuth v5 beta might return { session } instead of session directly
      if (result && typeof result === 'object' && 'session' in result) {
        console.log('Found session in result.session:', result.session);
        return result.session;
      }
      
      return result;
    }
    // In API routes, auth() should automatically read from headers
    const result = await nextAuth.auth();
    console.log('auth() result without request:', {
      hasResult: !!result,
      hasUser: !!result?.user,
      userId: result?.user?.id,
      resultKeys: result ? Object.keys(result) : [],
      resultType: typeof result,
      resultStringified: JSON.stringify(result),
    });
    
    // NextAuth v5 beta might return { session } instead of session directly
    if (result && typeof result === 'object' && 'session' in result) {
      console.log('Found session in result.session:', result.session);
      return result.session;
    }
    
    return result;
  } catch (error: any) {
    console.error('Error in auth() function:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      reqType: req ? typeof req : 'undefined',
      hasNextUrl: req && typeof req === 'object' ? 'nextUrl' in req : false,
      nextUrlValue: req && typeof req === 'object' && 'nextUrl' in req ? (req as any).nextUrl : 'N/A',
    });
    return null;
  }
}

export async function signIn(...args: any[]) {
  const nextAuth = await getNextAuth();
  return nextAuth.signIn(...args as any);
}

export async function signOut(...args: any[]) {
  const nextAuth = await getNextAuth();
  return nextAuth.signOut(...args as any);
}

