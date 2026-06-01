import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Initialize Supabase Admin Client using the Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables in .env");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
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
    } else {
      console.log(`  - ✅ Supabase Auth already exists with ID: ${authUser.id}`);
    }

    // 2. Upsert user into Prisma Database
    console.log(`  - Upserting role ${account.role} into Prisma DB...`);
    
    try {
      await prisma.user.upsert({
        where: { email: account.email },
        update: {
          role: account.role as any,
          name: account.name
        },
        create: {
          email: account.email,
          role: account.role as any,
          name: account.name
        }
      });
      console.log(`  - ✅ Prisma record synchronized!`);
    } catch (dbError) {
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
