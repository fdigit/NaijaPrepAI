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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/prisma.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
// Lazy initialization function - only creates PrismaClient when called
// This prevents module-level evaluation issues with Next.js 16 + Turbopack
function getPrismaClient() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        // In development, use the global object to keep a single instance
        if (!global.cachedPrisma) {
            // Create PrismaClient only when function is called (not at module load)
            global.cachedPrisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
        }
        return global.cachedPrisma;
    }
}
const prisma = new Proxy({}, {
    get (_target, prop) {
        const client = getPrismaClient();
        const value = client[prop];
        // If it's a function, bind it to the client instance
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});
const __TURBOPACK__default__export__ = prisma;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/promises [external] (node:stream/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/promises", () => require("node:stream/promises"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/services/geminiService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateExamQuestions",
    ()=>generateExamQuestions,
    "generateLessonPlan",
    ()=>generateLessonPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/node/index.mjs [app-route] (ecmascript)");
;
const ai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
    apiKey: ("TURBOPACK compile-time value", "AIzaSyB3qrR6zVNSSTssJ8SiRkR8snfz05L153k") || process.env.API_KEY
});
const generateLessonPlan = async (selection)=>{
    const modelId = "gemini-2.5-flash"; // Using Flash for speed and efficiency with large text generation
    const prompt = `
    Create a comprehensive Nigerian curriculum (NERDC) aligned lesson plan.
    
    Context:
    - Class: ${selection.classLevel}
    - Subject: ${selection.subject}
    - Term: ${selection.term}
    - Week: ${selection.week}
    - Specific Topic: ${selection.topic}

    Requirements:
    1. **Lesson Notes**: Detailed, academic tone, approx 800-1000 words. Use Markdown for formatting (headers, bold, lists). Include definitions, formulas (if applicable), and examples relevant to the Nigerian context.
    2. **Summary**: 3-5 concise bullet points for revision.
    3. **Practice Questions**: 5 Multiple Choice Questions (MCQs) with 4 options (A-D) and one correct answer with explanation.
    4. **Theory Question**: 1 structured theory question with a detailed model answer.

    Format the response as a structured JSON object.
  `;
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                    properties: {
                        topicTitle: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                            description: "The formal title of the lesson"
                        },
                        introduction: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                            description: "A brief introductory paragraph"
                        },
                        mainContent: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                            description: "Full lesson notes in Markdown format"
                        },
                        summaryPoints: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                            items: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING
                            },
                            description: "List of key takeaways"
                        },
                        practiceQuestions: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                            items: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                                properties: {
                                    question: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING
                                    },
                                    options: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                                        items: {
                                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING
                                        },
                                        description: "Array of 4 options"
                                    },
                                    correctOptionIndex: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].INTEGER,
                                        description: "0-3 index of correct option"
                                    },
                                    explanation: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                        description: "Why this answer is correct"
                                    }
                                },
                                required: [
                                    "question",
                                    "options",
                                    "correctOptionIndex",
                                    "explanation"
                                ]
                            },
                            description: "5 MCQs"
                        },
                        theoryQuestion: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                            properties: {
                                question: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING
                                },
                                answer: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                    description: "Detailed model answer"
                                }
                            },
                            required: [
                                "question",
                                "answer"
                            ]
                        }
                    },
                    required: [
                        "topicTitle",
                        "introduction",
                        "mainContent",
                        "summaryPoints",
                        "practiceQuestions",
                        "theoryQuestion"
                    ]
                }
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No content generated");
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
const generateExamQuestions = async (subject, classLevel, aggregatedContent, questionCount = 50)=>{
    const modelId = "gemini-2.5-flash";
    // Build content summary for prompt
    const contentSummary = aggregatedContent.fullContent.length > 10000 ? aggregatedContent.fullContent.substring(0, 10000) + "\n\n[Content truncated for length...]" : aggregatedContent.fullContent;
    const prompt = `
You are an expert Nigerian curriculum (NERDC) exam question generator specializing in Computer-Based Test (CBT) format questions.

Context:
- Subject: ${subject}
- Class Level: ${classLevel}
- Total Lessons Analyzed: ${aggregatedContent.lessonCount}
- Topics Covered: ${aggregatedContent.topics.join(", ")}

Lesson Content Summary:
${contentSummary}

Key Summary Points:
${aggregatedContent.summaryPoints.slice(0, 20).join("\n- ")}

Requirements:
1. Generate ${questionCount} comprehensive CBT (Computer-Based Test) questions
2. Questions MUST cover ALL topics from the provided lessons: ${aggregatedContent.topics.join(", ")}
3. Difficulty distribution:
   - 30% easy questions (basic recall and understanding)
   - 50% medium questions (application and analysis)
   - 20% hard questions (synthesis and evaluation)
4. Each question should:
   - Test understanding, not just memorization
   - Be relevant to Nigerian curriculum standards (NERDC)
   - Have exactly 4 options (A, B, C, D)
   - Include a detailed explanation of why the correct answer is right
   - Reference which topic it covers
   - Be appropriate for ${classLevel} level
5. Ensure comprehensive coverage - every major topic should have at least one question
6. Questions should prepare students for actual WAEC/BECE exams
7. Avoid duplicate questions or questions too similar to each other
8. Make questions practical and applicable to real-world scenarios where possible

Format the response as a JSON array of questions.
`;
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                    items: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                        properties: {
                            question: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                description: "The question text"
                            },
                            options: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                                items: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING
                                },
                                description: "Array of exactly 4 options (A, B, C, D)"
                            },
                            correctOptionIndex: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].INTEGER,
                                description: "Index of correct option (0-3)"
                            },
                            explanation: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                description: "Detailed explanation of why this answer is correct"
                            },
                            topicCovered: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                description: "Which topic from the lessons this question covers"
                            },
                            difficulty: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Type"].STRING,
                                enum: [
                                    "easy",
                                    "medium",
                                    "hard"
                                ],
                                description: "Difficulty level of the question"
                            }
                        },
                        required: [
                            "question",
                            "options",
                            "correctOptionIndex",
                            "explanation",
                            "topicCovered",
                            "difficulty"
                        ]
                    }
                }
            }
        });
        if (response.text) {
            const questions = JSON.parse(response.text);
            // Validate questions
            if (!Array.isArray(questions)) {
                throw new Error("AI response is not an array");
            }
            // Validate each question has 4 options
            const invalidQuestions = questions.filter((q)=>!q.options || q.options.length !== 4);
            if (invalidQuestions.length > 0) {
                console.warn(`Warning: ${invalidQuestions.length} questions have invalid option count`);
            }
            return questions;
        }
        throw new Error("No content generated");
    } catch (error) {
        console.error("Gemini API Error (Exam Questions):", error);
        throw error;
    }
};
}),
"[project]/services/examPrepService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aggregateLessonContent",
    ()=>aggregateLessonContent,
    "calculateExamResults",
    ()=>calculateExamResults,
    "deleteExamPrep",
    ()=>deleteExamPrep,
    "generateExamPrep",
    ()=>generateExamPrep,
    "getBestExamPrepAttempt",
    ()=>getBestExamPrepAttempt,
    "getExamPrepAttemptStats",
    ()=>getExamPrepAttemptStats,
    "getExamPrepAttempts",
    ()=>getExamPrepAttempts,
    "getExamPrepById",
    ()=>getExamPrepById,
    "getExamPreps",
    ()=>getExamPreps,
    "getLessonsBySubject",
    ()=>getLessonsBySubject,
    "saveExamPrepAttempt",
    ()=>saveExamPrepAttempt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$geminiService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/geminiService.ts [app-route] (ecmascript)");
;
;
;
/**
 * Convert TypeScript ClassLevel enum to Prisma ClassLevel enum
 */ function mapClassLevelToPrisma(classLevel) {
    const normalized = classLevel.replace(/\s+/g, '').toUpperCase();
    if (normalized === 'JSS1') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].JSS1;
    if (normalized === 'JSS2') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].JSS2;
    if (normalized === 'JSS3') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].JSS3;
    if (normalized === 'SSS1') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].SSS1;
    if (normalized === 'SSS2') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].SSS2;
    if (normalized === 'SSS3') return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].SSS3;
    return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ClassLevel"].SSS1;
}
async function getLessonsBySubject(userId, subject, classLevel) {
    try {
        const prismaClassLevel = classLevel ? mapClassLevelToPrisma(classLevel) : undefined;
        const lessons = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].lesson.findMany({
            where: {
                userId,
                subject,
                ...prismaClassLevel && {
                    classLevel: prismaClassLevel
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return lessons;
    } catch (error) {
        console.error('Error fetching lessons by subject:', error);
        throw error;
    }
}
function aggregateLessonContent(lessons) {
    if (lessons.length === 0) {
        return {
            topics: [],
            fullContent: '',
            summaryPoints: [],
            lessonCount: 0
        };
    }
    const topics = [];
    const summaryPoints = [];
    const contentParts = [];
    lessons.forEach((lesson)=>{
        // Collect topics
        if (lesson.topic && !topics.includes(lesson.topic)) {
            topics.push(lesson.topic);
        }
        if (lesson.topicTitle && !topics.includes(lesson.topicTitle)) {
            topics.push(lesson.topicTitle);
        }
        // Collect summary points
        if (lesson.summaryPoints && Array.isArray(lesson.summaryPoints)) {
            summaryPoints.push(...lesson.summaryPoints);
        }
        // Collect main content with topic header
        if (lesson.mainContent) {
            contentParts.push(`\n## Topic: ${lesson.topicTitle || lesson.topic}\n\n${lesson.mainContent}`);
        }
    });
    return {
        topics: [
            ...new Set(topics)
        ],
        fullContent: contentParts.join('\n\n'),
        summaryPoints: [
            ...new Set(summaryPoints)
        ],
        lessonCount: lessons.length
    };
}
async function generateExamPrep(userId, subject, classLevel, examName, questionCount = 50) {
    try {
        // 1. Get all lessons for this subject
        const lessons = await getLessonsBySubject(userId, subject, classLevel);
        if (lessons.length === 0) {
            throw new Error(`No lessons found for subject "${subject}". Please create some lessons first.`);
        }
        // 2. Aggregate lesson content
        const aggregatedContent = aggregateLessonContent(lessons);
        // 3. Generate questions using AI
        const questions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$geminiService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateExamQuestions"])(subject, classLevel, aggregatedContent, questionCount);
        // 4. Extract topics covered from lessons
        const topicsCovered = aggregatedContent.topics;
        // 5. Save to database
        const prismaClassLevel = mapClassLevelToPrisma(classLevel);
        const examPrep = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrep.create({
            data: {
                userId,
                subject,
                classLevel: prismaClassLevel,
                examName: examName || `${subject} Exam Prep`,
                sourceLessonIds: lessons.map((l)=>l.id),
                questions: questions,
                totalQuestions: questions.length,
                topicsCovered,
                isActive: true
            }
        });
        return examPrep;
    } catch (error) {
        console.error('Error generating exam prep:', error);
        throw error;
    }
}
async function getExamPreps(userId, filters) {
    try {
        const whereClause = {
            userId
        };
        if (filters?.subject) {
            whereClause.subject = filters.subject;
        }
        if (filters?.classLevel) {
            whereClause.classLevel = filters.classLevel;
        }
        // Default to showing only active exams if not specified
        if (filters?.isActive !== undefined) {
            whereClause.isActive = filters.isActive;
        } else {
            // Default: show only active exams
            whereClause.isActive = true;
        }
        const examPreps = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrep.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return examPreps;
    } catch (error) {
        console.error('Error fetching exam preps:', error);
        throw error;
    }
}
async function getExamPrepById(id, userId) {
    try {
        const examPrep = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrep.findUnique({
            where: {
                id
            }
        });
        // Verify ownership if userId provided
        if (examPrep && userId && examPrep.userId !== userId) {
            throw new Error('Unauthorized access to exam prep');
        }
        return examPrep;
    } catch (error) {
        console.error('Error fetching exam prep:', error);
        throw error;
    }
}
async function deleteExamPrep(id, userId) {
    try {
        // Verify ownership
        const examPrep = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrep.findUnique({
            where: {
                id
            }
        });
        if (!examPrep) {
            throw new Error('Exam prep not found');
        }
        if (examPrep.userId !== userId) {
            throw new Error('Unauthorized: Cannot delete this exam prep');
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrep.delete({
            where: {
                id
            }
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting exam prep:', error);
        throw error;
    }
}
function calculateExamResults(questions, answers) {
    let correctAnswers = 0;
    const results = [];
    questions.forEach((question, index)=>{
        const answer = answers.find((a)=>a.questionIndex === index);
        const selectedOption = answer?.selectedOption ?? -1;
        const isCorrect = selectedOption === question.correctOptionIndex;
        if (isCorrect) {
            correctAnswers++;
        }
        results.push({
            questionIndex: index,
            isCorrect,
            selectedOption,
            correctOption: question.correctOptionIndex,
            explanation: question.explanation,
            question: question.question
        });
    });
    const score = questions.length > 0 ? correctAnswers / questions.length * 100 : 0;
    return {
        score: Math.round(score * 100) / 100,
        correctAnswers,
        totalQuestions: questions.length,
        results
    };
}
async function saveExamPrepAttempt(data) {
    try {
        const attempt = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrepAttempt.create({
            data: {
                userId: data.userId,
                examPrepId: data.examPrepId,
                totalQuestions: data.totalQuestions,
                correctAnswers: data.correctAnswers,
                score: data.score,
                timeSpent: data.timeSpent,
                answers: data.answers
            }
        });
        return attempt;
    } catch (error) {
        console.error('Error saving exam prep attempt:', error);
        throw error;
    }
}
async function getBestExamPrepAttempt(userId, examPrepId) {
    try {
        const attempt = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrepAttempt.findFirst({
            where: {
                userId,
                examPrepId
            },
            orderBy: {
                score: 'desc'
            }
        });
        return attempt;
    } catch (error) {
        console.error('Error fetching best exam prep attempt:', error);
        throw error;
    }
}
async function getExamPrepAttempts(userId, examPrepId) {
    try {
        const attempts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrepAttempt.findMany({
            where: {
                userId,
                examPrepId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return attempts;
    } catch (error) {
        console.error('Error fetching exam prep attempts:', error);
        throw error;
    }
}
async function getExamPrepAttemptStats(userId, examPrepId) {
    try {
        console.log(`[getExamPrepAttemptStats] Checking attempts for userId: ${userId}, examPrepId: ${examPrepId}`);
        const attempts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examPrepAttempt.findMany({
            where: {
                userId,
                examPrepId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`[getExamPrepAttemptStats] Found ${attempts.length} attempts`);
        if (attempts.length === 0) {
            return {
                attemptCount: 0,
                bestAttempt: null,
                lastAttempt: null
            };
        }
        const bestAttempt = attempts.reduce((best, current)=>current.score > best.score ? current : best);
        const stats = {
            attemptCount: attempts.length,
            bestAttempt: {
                score: bestAttempt.score,
                correctAnswers: bestAttempt.correctAnswers,
                totalQuestions: bestAttempt.totalQuestions,
                createdAt: bestAttempt.createdAt
            },
            lastAttempt: {
                score: attempts[0].score,
                correctAnswers: attempts[0].correctAnswers,
                totalQuestions: attempts[0].totalQuestions,
                createdAt: attempts[0].createdAt
            }
        };
        console.log(`[getExamPrepAttemptStats] Returning stats:`, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching exam prep attempt stats:', error);
        throw error;
    }
}
}),
"[project]/app/api/exam-prep/[id]/attempt/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$examPrepService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/examPrepService.ts [app-route] (ecmascript)");
const runtime = 'nodejs';
;
;
;
async function POST(request, { params }) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
        if (!session?.user?.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { id } = await params;
        const body = await request.json();
        const { answers, timeSpent } = body;
        if (!answers || !Array.isArray(answers)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Answers array is required'
            }, {
                status: 400
            });
        }
        // Get exam prep
        const examPrep = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$examPrepService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExamPrepById"])(id, session.user.id);
        if (!examPrep) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Exam prep not found'
            }, {
                status: 404
            });
        }
        // Parse questions from JSON
        const questions = examPrep.questions;
        if (!questions || questions.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No questions found in exam prep'
            }, {
                status: 400
            });
        }
        // Calculate results
        const results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$examPrepService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateExamResults"])(questions, answers);
        // Save attempt to database
        try {
            console.log(`[Exam Attempt] Saving attempt for userId: ${session.user.id}, examPrepId: ${id}`);
            const savedAttempt = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$examPrepService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveExamPrepAttempt"])({
                userId: session.user.id,
                examPrepId: id,
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                score: results.score,
                timeSpent: timeSpent || undefined,
                answers: answers
            });
            console.log(`[Exam Attempt] Successfully saved attempt:`, savedAttempt.id);
        } catch (saveError) {
            console.error('[Exam Attempt] Error saving exam attempt:', saveError);
        // Continue even if save fails - still return results
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results
        });
    } catch (error) {
        console.error('Error processing exam attempt:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to process exam attempt'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__68295a94._.js.map