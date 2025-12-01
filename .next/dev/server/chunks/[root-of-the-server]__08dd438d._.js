module.exports = [
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__08dd438d._.js.map