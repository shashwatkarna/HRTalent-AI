"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
// Load environment variables from .env
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
// Initialize Supabase Admin Client using the Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables in .env");
}
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const accountsToSeed = [
    { email: 'aman.admin@aitalent.com', password: 'Password123!', role: 'ADMIN', name: 'Aman' },
    { email: 'aryan.manager@aitalent.com', password: 'Password123!', role: 'SENIOR_MANAGER', name: 'Aryan' },
    { email: 'shreya.hr@aitalent.com', password: 'Password123!', role: 'HR_RECRUITER', name: 'Shreya' },
    { email: 'shashwat.employee@aitalent.com', password: 'Password123!', role: 'EMPLOYEE', name: 'Shashwat' },
];
async function main() {
    console.log('🌱 Starting Database Seeding...');
    for (const account of accountsToSeed) {
        console.log(`\nProcessing ${account.email}...`);
        // 1. Check if user already exists in Supabase Auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.error('Failed to fetch users from Supabase Auth:', listError);
            continue;
        }
        let authUser = users.find(u => u.email === account.email);
        if (!authUser) {
            console.log(`  - Creating user in Supabase Auth...`);
            const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: account.email,
                password: account.password,
                email_confirm: true, // Auto-confirm email
                user_metadata: { name: account.name }
            });
            if (createError) {
                console.error(`  - ❌ Error creating Supabase Auth for ${account.email}:`, createError.message);
                continue;
            }
            authUser = newAuthUser.user;
            console.log(`  - ✅ Supabase Auth created with ID: ${authUser.id}`);
        }
        else {
            console.log(`  - ✅ Supabase Auth already exists with ID: ${authUser.id}`);
        }
        // 2. Upsert user into Prisma Database
        console.log(`  - Upserting role ${account.role} into Prisma DB...`);
        try {
            await prisma.user.upsert({
                where: { email: account.email },
                update: {
                    role: account.role,
                    name: account.name
                },
                create: {
                    email: account.email,
                    role: account.role,
                    name: account.name
                }
            });
            console.log(`  - ✅ Prisma record synchronized!`);
        }
        catch (dbError) {
            console.error(`  - ❌ Error upserting Prisma record for ${account.email}:`, dbError);
        }
    }
    console.log('\n✅ Seeding complete! You can now log in with these accounts.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
