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
"[project]/services/gamificationService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BADGES",
    ()=>BADGES,
    "XP_VALUES",
    ()=>XP_VALUES,
    "awardBadge",
    ()=>awardBadge,
    "awardXP",
    ()=>awardXP,
    "calculateLevel",
    ()=>calculateLevel,
    "checkAndAwardBadges",
    ()=>checkAndAwardBadges,
    "getUserGamificationStats",
    ()=>getUserGamificationStats,
    "getXPForNextLevel",
    ()=>getXPForNextLevel,
    "updateDailyStreak",
    ()=>updateDailyStreak,
    "updateSubjectProgress",
    ()=>updateSubjectProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
const XP_VALUES = {
    GENERATE_LESSON: 50,
    COMPLETE_QUIZ: 30,
    QUIZ_PERFECT_SCORE: 50,
    COMPLETE_EXAM_PREP: 100,
    EXAM_PREP_HIGH_SCORE: 150,
    DAILY_STREAK_BONUS: 10
};
const BADGES = {
    // Learning Badges
    FIRST_LESSON: {
        id: 'first_lesson',
        name: 'First Steps',
        description: 'Generated your first lesson',
        icon: '🎯'
    },
    FAST_LEARNER: {
        id: 'fast_learner',
        name: 'Fast Learner',
        description: 'Completed 5 quizzes in one day',
        icon: '⚡'
    },
    CONSISTENT_STUDENT: {
        id: 'consistent_student',
        name: 'Consistent Student',
        description: '7-day study streak',
        icon: '🔥'
    },
    DEDICATED_LEARNER: {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: '30-day study streak',
        icon: '💪'
    },
    // Subject Mastery Badges
    MATH_GURU: {
        id: 'math_guru',
        name: 'Mathematics Guru',
        description: 'Completed 10 Mathematics lessons',
        icon: '📐'
    },
    SCIENCE_MASTER: {
        id: 'science_master',
        name: 'Science Master',
        description: 'Completed 10 Science lessons',
        icon: '🔬'
    },
    ENGLISH_EXPERT: {
        id: 'english_expert',
        name: 'English Expert',
        description: 'Completed 10 English lessons',
        icon: '📚'
    },
    // Achievement Badges
    QUIZ_MASTER: {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Scored 100% on 5 quizzes',
        icon: '🏆'
    },
    EXAM_CHAMPION: {
        id: 'exam_champion',
        name: 'Exam Champion',
        description: 'Scored 90%+ on an exam prep',
        icon: '👑'
    },
    LESSON_CREATOR: {
        id: 'lesson_creator',
        name: 'Lesson Creator',
        description: 'Generated 20 lessons',
        icon: '✨'
    },
    XP_LEGEND: {
        id: 'xp_legend',
        name: 'XP Legend',
        description: 'Reached 10,000 XP points',
        icon: '🌟'
    }
};
// Level thresholds (XP required for each level)
const LEVEL_THRESHOLDS = [
    0,
    100,
    250,
    500,
    1000,
    2000,
    3500,
    5500,
    8000,
    10000,
    15000,
    20000,
    30000,
    40000,
    50000
];
function calculateLevel(xp) {
    for(let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--){
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}
function getXPForNextLevel(currentXP) {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return 0; // Max level
    }
    return LEVEL_THRESHOLDS[currentLevel] - currentXP;
}
async function awardXP(userId, xpAmount, reason) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            xpPoints: true,
            level: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const newXP = user.xpPoints + xpAmount;
    const oldLevel = user.level;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: userId
        },
        data: {
            xpPoints: newXP,
            level: newLevel
        }
    });
    // Check for level-based badges
    if (leveledUp) {
        await checkAndAwardBadges(userId, {
            level: newLevel
        });
    }
    return {
        newXP,
        newLevel,
        leveledUp
    };
}
async function updateDailyStreak(userId) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            dailyStreak: true,
            lastActivityDate: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
    if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
    }
    let newStreak = user.dailyStreak;
    let isNewStreak = false;
    if (!lastActivity) {
        // First activity
        newStreak = 1;
        isNewStreak = true;
    } else {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) {
            // Same day, no change
            newStreak = user.dailyStreak;
        } else if (daysDiff === 1) {
            // Consecutive day
            newStreak = user.dailyStreak + 1;
            isNewStreak = true;
        } else {
            // Streak broken
            newStreak = 1;
            isNewStreak = true;
        }
    }
    // Award streak bonus XP
    if (isNewStreak && newStreak > 1) {
        const streakBonus = (newStreak - 1) * XP_VALUES.DAILY_STREAK_BONUS;
        await awardXP(userId, streakBonus, `Daily streak bonus (${newStreak} days)`);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: userId
        },
        data: {
            dailyStreak: newStreak,
            lastActivityDate: today
        }
    });
    // Check for streak-based badges
    await checkAndAwardBadges(userId, {
        streak: newStreak
    });
    return {
        streak: newStreak,
        isNewStreak
    };
}
async function awardBadge(userId, badgeId) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            badges: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Check if badge already awarded
    if (user.badges.includes(badgeId)) {
        return false;
    }
    const updatedBadges = [
        ...user.badges,
        badgeId
    ];
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: userId
        },
        data: {
            badges: updatedBadges
        }
    });
    return true;
}
async function checkAndAwardBadges(userId, context) {
    const awardedBadges = [];
    // Get current user stats
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            badges: true,
            xpPoints: true,
            lessons: {
                select: {
                    id: true,
                    subject: true
                }
            },
            quizAttempts: {
                select: {
                    id: true,
                    score: true
                }
            },
            examPrepAttempts: {
                select: {
                    id: true,
                    score: true
                }
            }
        }
    });
    if (!user) {
        return awardedBadges;
    }
    // Level-based badges
    if (context.level && context.level >= 10) {
        if (!user.badges.includes(BADGES.XP_LEGEND.id)) {
            await awardBadge(userId, BADGES.XP_LEGEND.id);
            awardedBadges.push(BADGES.XP_LEGEND.id);
        }
    }
    // Streak-based badges
    if (context.streak) {
        if (context.streak >= 7 && !user.badges.includes(BADGES.CONSISTENT_STUDENT.id)) {
            await awardBadge(userId, BADGES.CONSISTENT_STUDENT.id);
            awardedBadges.push(BADGES.CONSISTENT_STUDENT.id);
        }
        if (context.streak >= 30 && !user.badges.includes(BADGES.DEDICATED_LEARNER.id)) {
            await awardBadge(userId, BADGES.DEDICATED_LEARNER.id);
            awardedBadges.push(BADGES.DEDICATED_LEARNER.id);
        }
    }
    // Lesson-based badges
    const lessonsCount = user.lessons.length;
    if (lessonsCount >= 1 && !user.badges.includes(BADGES.FIRST_LESSON.id)) {
        await awardBadge(userId, BADGES.FIRST_LESSON.id);
        awardedBadges.push(BADGES.FIRST_LESSON.id);
    }
    if (lessonsCount >= 20 && !user.badges.includes(BADGES.LESSON_CREATOR.id)) {
        await awardBadge(userId, BADGES.LESSON_CREATOR.id);
        awardedBadges.push(BADGES.LESSON_CREATOR.id);
    }
    // Quiz-based badges
    const perfectQuizzes = user.quizAttempts.filter((q)=>q.score === 100).length;
    if (perfectQuizzes >= 5 && !user.badges.includes(BADGES.QUIZ_MASTER.id)) {
        await awardBadge(userId, BADGES.QUIZ_MASTER.id);
        awardedBadges.push(BADGES.QUIZ_MASTER.id);
    }
    // Subject-based badges
    if (context.subject) {
        const subjectLessons = user.lessons.filter((l)=>l.subject === context.subject).length;
        if (context.subject === 'Mathematics' && subjectLessons >= 10 && !user.badges.includes(BADGES.MATH_GURU.id)) {
            await awardBadge(userId, BADGES.MATH_GURU.id);
            awardedBadges.push(BADGES.MATH_GURU.id);
        }
        if ([
            'Physics',
            'Chemistry',
            'Biology'
        ].includes(context.subject) && subjectLessons >= 10 && !user.badges.includes(BADGES.SCIENCE_MASTER.id)) {
            await awardBadge(userId, BADGES.SCIENCE_MASTER.id);
            awardedBadges.push(BADGES.SCIENCE_MASTER.id);
        }
        if (context.subject === 'English' && subjectLessons >= 10 && !user.badges.includes(BADGES.ENGLISH_EXPERT.id)) {
            await awardBadge(userId, BADGES.ENGLISH_EXPERT.id);
            awardedBadges.push(BADGES.ENGLISH_EXPERT.id);
        }
    }
    // Exam-based badges
    if (context.examScore && context.examScore >= 90) {
        if (!user.badges.includes(BADGES.EXAM_CHAMPION.id)) {
            await awardBadge(userId, BADGES.EXAM_CHAMPION.id);
            awardedBadges.push(BADGES.EXAM_CHAMPION.id);
        }
    }
    return awardedBadges;
}
async function updateSubjectProgress(userId, subject, update) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            subjectProgress: true
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const progress = user.subjectProgress || {};
    const subjectData = progress[subject] || {
        lessonsCompleted: 0,
        quizzesPassed: 0,
        xpEarned: 0
    };
    if (update.lessonsCompleted !== undefined) {
        subjectData.lessonsCompleted = (subjectData.lessonsCompleted || 0) + update.lessonsCompleted;
    }
    if (update.quizzesPassed !== undefined) {
        subjectData.quizzesPassed = (subjectData.quizzesPassed || 0) + update.quizzesPassed;
    }
    if (update.xpEarned !== undefined) {
        subjectData.xpEarned = (subjectData.xpEarned || 0) + update.xpEarned;
    }
    progress[subject] = subjectData;
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: userId
        },
        data: {
            subjectProgress: progress
        }
    });
}
async function getUserGamificationStats(userId) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            xpPoints: true,
            level: true,
            badges: true,
            dailyStreak: true,
            lastActivityDate: true,
            subjectProgress: true,
            lessons: {
                select: {
                    id: true,
                    subject: true
                }
            },
            quizAttempts: {
                select: {
                    id: true,
                    score: true,
                    createdAt: true
                }
            }
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const xpForNextLevel = getXPForNextLevel(user.xpPoints);
    const progressToNextLevel = user.level < LEVEL_THRESHOLDS.length ? (user.xpPoints - LEVEL_THRESHOLDS[user.level - 1]) / (LEVEL_THRESHOLDS[user.level] - LEVEL_THRESHOLDS[user.level - 1]) * 100 : 100;
    // Get badge details
    const badgeDetails = user.badges.map((badgeId)=>{
        const badge = Object.values(BADGES).find((b)=>b.id === badgeId);
        return badge || null;
    }).filter(Boolean);
    return {
        xp: user.xpPoints,
        level: user.level,
        xpForNextLevel,
        progressToNextLevel,
        badges: badgeDetails,
        dailyStreak: user.dailyStreak,
        lastActivityDate: user.lastActivityDate,
        subjectProgress: user.subjectProgress || {},
        totalLessons: user.lessons.length,
        totalQuizzes: user.quizAttempts.length,
        perfectQuizzes: user.quizAttempts.filter((q)=>q.score === 100).length
    };
}
}),
"[project]/app/api/gamification/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$gamificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/gamificationService.ts [app-route] (ecmascript)");
const runtime = 'nodejs';
;
;
;
async function GET(request) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
        if (!session?.user?.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$gamificationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserGamificationStats"])(session.user.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(stats);
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to fetch gamification stats'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8d7dfc9a._.js.map