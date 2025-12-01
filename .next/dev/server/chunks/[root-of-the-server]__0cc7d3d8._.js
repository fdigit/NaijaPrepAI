module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
// This must be the FIRST line (before any imports) to resolve Prisma initialization errors
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "auth",
    ()=>auth,
    "runtime",
    ()=>runtime,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
const runtime = 'nodejs';
// Dynamic imports to avoid module-level evaluation
// Import NextAuth and providers only when needed
let NextAuthModule = null;
let CredentialsProviderModule = null;
let GoogleProviderModule = null;
let PrismaAdapterModule = null;
let PrismaModule = null;
let bcryptModule = null;
async function getNextAuthModule() {
    if (!NextAuthModule) {
        NextAuthModule = await __turbopack_context__.A("[project]/node_modules/next-auth/index.js [app-route] (ecmascript, async loader)");
    }
    return NextAuthModule.default;
}
async function getCredentialsProvider() {
    if (!CredentialsProviderModule) {
        CredentialsProviderModule = await __turbopack_context__.A("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript, async loader)");
    }
    return CredentialsProviderModule.default;
}
async function getGoogleProvider() {
    if (!GoogleProviderModule) {
        GoogleProviderModule = await __turbopack_context__.A("[project]/node_modules/next-auth/providers/google.js [app-route] (ecmascript, async loader)");
    }
    return GoogleProviderModule.default;
}
async function getPrisma() {
    if (!PrismaModule) {
        PrismaModule = await __turbopack_context__.A("[project]/lib/prisma.ts [app-route] (ecmascript, async loader)");
    }
    return PrismaModule.prisma;
}
async function getPrismaAdapter() {
    if (!PrismaAdapterModule) {
        PrismaAdapterModule = await __turbopack_context__.A("[project]/node_modules/@auth/prisma-adapter/index.js [app-route] (ecmascript, async loader)");
    }
    const prisma = await getPrisma();
    return PrismaAdapterModule.PrismaAdapter(prisma);
}
async function getBcrypt() {
    if (!bcryptModule) {
        bcryptModule = await __turbopack_context__.A("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript, async loader)");
    }
    return bcryptModule.default;
}
// Validate required environment variables
function validateEnvVars() {
    const required = [
        'NEXTAUTH_SECRET',
        'DATABASE_URL'
    ];
    const missing = required.filter((key)=>!process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}\n` + `Please create a .env.local file with these variables. See ENV_SETUP_GUIDE.md for details.`);
    }
    if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
        console.warn('⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long for security.');
    }
}
// Make authOptions a getter function to avoid module-level evaluation
async function getAuthOptions() {
    // Validate environment variables when options are first requested
    validateEnvVars();
    const GoogleProvider = await getGoogleProvider();
    const CredentialsProvider = await getCredentialsProvider();
    // Note: Adapter removed temporarily to fix __internal error
    // JWT strategy works without adapter - adapter is only needed for database sessions
    // We can add it back later once NextAuth v5 beta compatibility is resolved
    return {
        // adapter: await getPrismaAdapter(), // Temporarily disabled
        secret: process.env.NEXTAUTH_SECRET,
        trustHost: true,
        basePath: '/api/auth',
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
            }),
            CredentialsProvider({
                name: 'Credentials',
                credentials: {
                    email: {
                        label: 'Email',
                        type: 'email'
                    },
                    password: {
                        label: 'Password',
                        type: 'password'
                    }
                },
                async authorize (credentials) {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }
                    // Normalize email: trim and lowercase to match database storage
                    const email = credentials.email.toString().trim().toLowerCase();
                    const password = credentials.password;
                    try {
                        // Import prisma directly - singleton pattern handles hot-reload
                        const { prisma } = await __turbopack_context__.A("[project]/lib/prisma.ts [app-route] (ecmascript, async loader)");
                        const user = await prisma.user.findUnique({
                            where: {
                                email
                            }
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
                            image: user.image
                        };
                    } catch (error) {
                        console.error('Auth error:', error);
                        return null;
                    }
                }
            })
        ],
        session: {
            strategy: 'jwt'
        },
        pages: {
            signIn: '/auth/signin'
        },
        callbacks: {
            async jwt ({ token, user }) {
                if (user) {
                    token.id = user.id;
                    token.email = user.email;
                    token.name = user.name;
                    token.picture = user.image;
                }
                return token;
            },
            async session ({ session, token }) {
                // Debug logging
                console.log('Session callback - token:', {
                    id: token.id,
                    email: token.email,
                    name: token.name
                });
                console.log('Session callback - session before:', {
                    hasUser: !!session.user,
                    userKeys: session.user ? Object.keys(session.user) : []
                });
                // Always ensure user object exists
                if (!session.user) {
                    session.user = {};
                }
                // Populate user object from token
                if (token.id) {
                    session.user.id = token.id;
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
                console.log('Session callback - session after:', {
                    hasUser: !!session.user,
                    userId: session.user.id,
                    userKeys: Object.keys(session.user)
                });
                return session;
            }
        }
    };
}
// Note: authOptions is NOT exported to prevent module-level evaluation
// All files should use the auth() function instead
// If you absolutely need authOptions, use getAuthOptions() (internal only)
// Initialize NextAuth - using lazy initialization to avoid module evaluation issues
let nextAuthInstance = null;
async function getNextAuth() {
    if (!nextAuthInstance) {
        try {
            const NextAuth = await getNextAuthModule();
            const authOptions = await getAuthOptions();
            nextAuthInstance = NextAuth(authOptions);
        } catch (error) {
            console.error('❌ Failed to initialize NextAuth:', error);
            if (error.message?.includes('environment variables')) {
                console.error('\n📋 Please check ENV_SETUP_GUIDE.md for setup instructions.');
            }
            throw error;
        }
    }
    return nextAuthInstance;
}
async function GET(req, context) {
    try {
        const { handlers } = await getNextAuth();
        return handlers.GET(req);
    } catch (error) {
        console.error('❌ Auth GET handler error:', error);
        // Return a proper JSON error response instead of HTML
        return new Response(JSON.stringify({
            error: 'Authentication configuration error',
            message: error.message || 'Please check your environment variables. See ENV_SETUP_GUIDE.md'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
async function POST(req, context) {
    try {
        const { handlers } = await getNextAuth();
        return handlers.POST(req);
    } catch (error) {
        console.error('❌ Auth POST handler error:', error);
        // Return a proper JSON error response instead of HTML
        return new Response(JSON.stringify({
            error: 'Authentication configuration error',
            message: error.message || 'Please check your environment variables. See ENV_SETUP_GUIDE.md'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
async function auth(req) {
    const nextAuth = await getNextAuth();
    try {
        if (req) {
            // For NextRequest, we need to construct a proper Request with cookies
            let request;
            if (req instanceof Request) {
                // It's already a Request
                request = req;
            } else {
                // It's a NextRequest - get URL and headers properly
                let url;
                let headers;
                // For NextRequest, use url property directly (it's always available)
                url = req.url || req.href || 'http://localhost:3000';
                // CRITICAL: Copy all headers including cookies from NextRequest
                // NextRequest.headers is a Headers object, we need to copy it properly
                if (req.headers) {
                    headers = new Headers();
                    // Copy all headers from NextRequest to new Headers object
                    req.headers.forEach((value, key)=>{
                        headers.set(key, value);
                    });
                } else {
                    headers = new Headers();
                }
                request = new Request(url, {
                    method: req.method || 'GET',
                    headers: headers
                });
            }
            const result = await nextAuth.auth(request);
            console.log('auth() result with request:', {
                hasResult: !!result,
                hasUser: !!result?.user,
                userId: result?.user?.id,
                resultKeys: result ? Object.keys(result) : [],
                resultType: typeof result,
                resultStringified: JSON.stringify(result)
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
            resultStringified: JSON.stringify(result)
        });
        // NextAuth v5 beta might return { session } instead of session directly
        if (result && typeof result === 'object' && 'session' in result) {
            console.log('Found session in result.session:', result.session);
            return result.session;
        }
        return result;
    } catch (error) {
        console.error('Error in auth() function:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 5).join('\n'),
            reqType: req ? typeof req : 'undefined',
            hasNextUrl: req && typeof req === 'object' ? 'nextUrl' in req : false,
            nextUrlValue: req && typeof req === 'object' && 'nextUrl' in req ? req.nextUrl : 'N/A'
        });
        return null;
    }
}
async function signIn(...args) {
    const nextAuth = await getNextAuth();
    return nextAuth.signIn(...args);
}
async function signOut(...args) {
    const nextAuth = await getNextAuth();
    return nextAuth.signOut(...args);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cc7d3d8._.js.map