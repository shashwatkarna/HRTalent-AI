import { db as prisma } from '../src/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const defaultPassword = 'Password123!';

// Function to generate email based on name
function generateEmail(name: string) {
  // Handle roles without explicit names like "Support Agent 1"
  if (name.includes('Agent') || name.includes('Executive ') || name.includes('Auditor') || name.includes('Creator') || name.includes('Specialist') || name.includes('Writer') || name.includes('Analyst') || name.includes('Accountant')) {
    return `${name.toLowerCase().replace(/ /g, '.')}@aitalent.com`;
  }
  const parts = name.split(' ');
  const first = parts[0].toLowerCase();
  const last = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  return `${first}.${last}@aitalent.com`;
}

// Function to generate random phone number
function generatePhone() {
  return `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Addresses
const addresses = [
  "123 Tech Boulevard, San Francisco, CA 94105",
  "456 Innovation Drive, Austin, TX 78701",
  "789 Startup Way, New York, NY 10011",
  "101 Data Avenue, Seattle, WA 98109",
  "202 Cloud Street, Boston, MA 02110"
];

const orgStructure = [
  { name: "John Anderson", title: "OWNER / MANAGEMENT ADMIN 1", role: "MANAGEMENT", dept: "Executive" },
  { name: "Sarah Mitchell", title: "OWNER / MANAGEMENT ADMIN 2", role: "MANAGEMENT", dept: "Executive" },
  {
    name: "Emily Rodriguez", title: "CHIEF HR & PEOPLE OPERATIONS", role: "SENIOR_MANAGER", dept: "HR & People Operations", reports: [
      { name: "Olivia Carter", title: "HR Manager - Recruitment", role: "HR_RECRUITER", dept: "HR & People Operations", reports: [
        { name: "James Wilson", title: "Recruiter", role: "HR_RECRUITER", dept: "HR & People Operations" },
        { name: "Sophia Martin", title: "Recruiter", role: "HR_RECRUITER", dept: "HR & People Operations" },
        { name: "Ethan Hall", title: "Recruiter", role: "HR_RECRUITER", dept: "HR & People Operations" }
      ]},
      { name: "Grace Thompson", title: "HR Manager - Employee Relations", role: "EMPLOYEE", dept: "HR & People Operations", reports: [
        { name: "Mia Walker", title: "HR Executive", role: "EMPLOYEE", dept: "HR & People Operations" },
        { name: "Ava Young", title: "HR Executive", role: "EMPLOYEE", dept: "HR & People Operations" },
        { name: "Henry Scott", title: "HR Executive", role: "EMPLOYEE", dept: "HR & People Operations" }
      ]},
      { name: "Benjamin Lewis", title: "HR Manager - Training & Development", role: "EMPLOYEE", dept: "HR & People Operations", reports: [
        { name: "Emma Green", title: "Trainer", role: "EMPLOYEE", dept: "HR & People Operations" },
        { name: "Daniel King", title: "Trainer", role: "EMPLOYEE", dept: "HR & People Operations" }
      ]}
    ]
  },
  {
    name: "Michael Brown", title: "SENIOR MANAGER - ENGINEERING", role: "SENIOR_MANAGER", dept: "Engineering", reports: [
      { name: "David Wilson", title: "Engineering Manager - Backend", role: "EMPLOYEE", dept: "Engineering", reports: [
        { name: "Team Lead - API Team", title: "Team Lead", role: "EMPLOYEE", dept: "Engineering", isPlaceholder: true, reports: [
          { name: "Noah Harris", title: "Backend Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Lucas Walker", title: "Backend Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Liam Adams", title: "Backend Engineer", role: "EMPLOYEE", dept: "Engineering" }
        ]},
        { name: "Team Lead - Platform Team", title: "Team Lead", role: "EMPLOYEE", dept: "Engineering", isPlaceholder: true, reports: [
          { name: "Elijah Clark", title: "Platform Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Mason Turner", title: "Platform Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Logan Baker", title: "Platform Engineer", role: "EMPLOYEE", dept: "Engineering" }
        ]}
      ]},
      { name: "Lisa Garcia", title: "Engineering Manager - Frontend", role: "EMPLOYEE", dept: "Engineering", reports: [
        { name: "Team Lead - Web Team", title: "Team Lead", role: "EMPLOYEE", dept: "Engineering", isPlaceholder: true, reports: [
          { name: "Ava Thompson", title: "Frontend Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Sophia Moore", title: "Frontend Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Chloe Davis", title: "Frontend Engineer", role: "EMPLOYEE", dept: "Engineering" }
        ]},
        { name: "Team Lead - Mobile Team", title: "Team Lead", role: "EMPLOYEE", dept: "Engineering", isPlaceholder: true, reports: [
          { name: "Isabella Green", title: "Mobile Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Amelia White", title: "Mobile Engineer", role: "EMPLOYEE", dept: "Engineering" },
          { name: "Harper Hall", title: "Mobile Engineer", role: "EMPLOYEE", dept: "Engineering" }
        ]}
      ]},
      { name: "Jennifer Lee", title: "Engineering Manager - DevOps", role: "EMPLOYEE", dept: "Engineering", reports: [
        { name: "Ethan Martin", title: "DevOps Engineer", role: "EMPLOYEE", dept: "Engineering" },
        { name: "Jack Cooper", title: "DevOps Engineer", role: "EMPLOYEE", dept: "Engineering" },
        { name: "Alexander Reed", title: "Cloud Engineer", role: "EMPLOYEE", dept: "Engineering" },
        { name: "William Scott", title: "SRE Engineer", role: "EMPLOYEE", dept: "Engineering" }
      ]}
    ]
  },
  {
    name: "Robert Johnson", title: "SENIOR MANAGER - PRODUCT", role: "SENIOR_MANAGER", dept: "Product", reports: [
      { name: "Product Manager - Enterprise", title: "Product Manager", role: "EMPLOYEE", dept: "Product", isPlaceholder: true, reports: [
        { name: "Mia Turner", title: "Product Owner", role: "EMPLOYEE", dept: "Product" },
        { name: "Victoria King", title: "Business Analyst", role: "EMPLOYEE", dept: "Product" },
        { name: "Samuel White", title: "Business Analyst", role: "EMPLOYEE", dept: "Product" }
      ]},
      { name: "Product Manager - Consumer Apps", title: "Product Manager", role: "EMPLOYEE", dept: "Product", isPlaceholder: true, reports: [
        { name: "Charlotte Lewis", title: "Product Owner", role: "EMPLOYEE", dept: "Product" },
        { name: "Jacob Young", title: "Business Analyst", role: "EMPLOYEE", dept: "Product" },
        { name: "Lily Walker", title: "Business Analyst", role: "EMPLOYEE", dept: "Product" }
      ]},
      { name: "UX Manager", title: "UX Manager", role: "EMPLOYEE", dept: "Product", isPlaceholder: true, reports: [
        { name: "Emma Carter", title: "UI Designer", role: "EMPLOYEE", dept: "Product" },
        { name: "Daniel Moore", title: "UX Designer", role: "EMPLOYEE", dept: "Product" },
        { name: "Hannah Baker", title: "Graphic Designer", role: "EMPLOYEE", dept: "Product" },
        { name: "Michael Reed", title: "Researcher", role: "EMPLOYEE", dept: "Product" }
      ]}
    ]
  },
  {
    name: "William Adams", title: "SENIOR MANAGER - SALES", role: "SENIOR_MANAGER", dept: "Sales", reports: [
      { name: "Regional Sales Manager - North", title: "Sales Manager", role: "EMPLOYEE", dept: "Sales", isPlaceholder: true, reports: [
        { name: "Ryan Cooper", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" },
        { name: "Nathan Hill", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" },
        { name: "Aaron Lee", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" }
      ]},
      { name: "Regional Sales Manager - South", title: "Sales Manager", role: "EMPLOYEE", dept: "Sales", isPlaceholder: true, reports: [
        { name: "Zoe Harris", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" },
        { name: "Ella Clark", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" },
        { name: "Luke Green", title: "Sales Executive", role: "EMPLOYEE", dept: "Sales" }
      ]},
      { name: "Inside Sales Manager", title: "Inside Sales Manager", role: "EMPLOYEE", dept: "Sales", isPlaceholder: true, reports: [
        { name: "Grace White", title: "Sales Representative", role: "EMPLOYEE", dept: "Sales" },
        { name: "Dylan Evans", title: "Sales Representative", role: "EMPLOYEE", dept: "Sales" },
        { name: "Owen Carter", title: "Sales Representative", role: "EMPLOYEE", dept: "Sales" }
      ]}
    ]
  },
  {
    name: "Rachel Thompson", title: "SENIOR MANAGER - CUSTOMER SUCCESS", role: "SENIOR_MANAGER", dept: "Customer Success", reports: [
      { name: "Customer Success Manager", title: "Customer Success Manager", role: "EMPLOYEE", dept: "Customer Success", isPlaceholder: true, reports: [
        { name: "Ethan Reed", title: "Customer Success Executive", role: "EMPLOYEE", dept: "Customer Success" },
        { name: "Sophia Young", title: "Customer Success Executive", role: "EMPLOYEE", dept: "Customer Success" },
        { name: "Ava Hill", title: "Customer Success Executive", role: "EMPLOYEE", dept: "Customer Success" }
      ]},
      { name: "Support Manager", title: "Support Manager", role: "EMPLOYEE", dept: "Customer Success", isPlaceholder: true, reports: [
        { name: "Jack Hall", title: "Support Lead", role: "EMPLOYEE", dept: "Customer Success", reports: [
          { name: "Support Agent 1", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" },
          { name: "Support Agent 2", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" },
          { name: "Support Agent 3", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" }
        ]},
        { name: "Liam Scott", title: "Support Lead", role: "EMPLOYEE", dept: "Customer Success", reports: [
          { name: "Support Agent 4", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" },
          { name: "Support Agent 5", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" },
          { name: "Support Agent 6", title: "Support Agent", role: "EMPLOYEE", dept: "Customer Success" }
        ]}
      ]}
    ]
  },
  {
    name: "Jessica Miller", title: "SENIOR MANAGER - MARKETING", role: "SENIOR_MANAGER", dept: "Marketing", reports: [
      { name: "Digital Marketing Manager", title: "Digital Marketing Manager", role: "EMPLOYEE", dept: "Marketing", isPlaceholder: true, reports: [
        { name: "SEO Specialist", title: "SEO Specialist", role: "EMPLOYEE", dept: "Marketing" },
        { name: "PPC Specialist", title: "PPC Specialist", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Content Writer", title: "Content Writer", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Marketing Analyst", title: "Marketing Analyst", role: "EMPLOYEE", dept: "Marketing" }
      ]},
      { name: "Brand Manager", title: "Brand Manager", role: "EMPLOYEE", dept: "Marketing", isPlaceholder: true, reports: [
        { name: "Brand Executive 1", title: "Brand Executive", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Brand Executive 2", title: "Brand Executive", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Brand Executive 3", title: "Brand Executive", role: "EMPLOYEE", dept: "Marketing" }
      ]},
      { name: "Social Media Manager", title: "Social Media Manager", role: "EMPLOYEE", dept: "Marketing", isPlaceholder: true, reports: [
        { name: "Social Media Executive 1", title: "Social Media Executive", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Social Media Executive 2", title: "Social Media Executive", role: "EMPLOYEE", dept: "Marketing" },
        { name: "Video Content Creator", title: "Video Content Creator", role: "EMPLOYEE", dept: "Marketing" }
      ]}
    ]
  },
  {
    name: "Christopher Davis", title: "SENIOR MANAGER - FINANCE", role: "SENIOR_MANAGER", dept: "Finance", reports: [
      { name: "Finance Manager", title: "Finance Manager", role: "EMPLOYEE", dept: "Finance", isPlaceholder: true, reports: [
        { name: "Accountant 1", title: "Accountant", role: "EMPLOYEE", dept: "Finance" },
        { name: "Accountant 2", title: "Accountant", role: "EMPLOYEE", dept: "Finance" },
        { name: "Accountant 3", title: "Accountant", role: "EMPLOYEE", dept: "Finance" }
      ]},
      { name: "Payroll Manager", title: "Payroll Manager", role: "EMPLOYEE", dept: "Finance", isPlaceholder: true, reports: [
        { name: "Payroll Executive 1", title: "Payroll Executive", role: "EMPLOYEE", dept: "Finance" },
        { name: "Payroll Executive 2", title: "Payroll Executive", role: "EMPLOYEE", dept: "Finance" }
      ]},
      { name: "Audit Manager", title: "Audit Manager", role: "EMPLOYEE", dept: "Finance", isPlaceholder: true, reports: [
        { name: "Internal Auditor 1", title: "Internal Auditor", role: "EMPLOYEE", dept: "Finance" },
        { name: "Internal Auditor 2", title: "Internal Auditor", role: "EMPLOYEE", dept: "Finance" }
      ]}
    ]
  },
  {
    name: "Daniel Martinez", title: "SENIOR MANAGER - OPERATIONS", role: "SENIOR_MANAGER", dept: "Operations", reports: [
      { name: "Operations Manager", title: "Operations Manager", role: "EMPLOYEE", dept: "Operations", isPlaceholder: true, reports: [
        { name: "Operations Executive 1", title: "Operations Executive", role: "EMPLOYEE", dept: "Operations" },
        { name: "Operations Executive 2", title: "Operations Executive", role: "EMPLOYEE", dept: "Operations" },
        { name: "Operations Executive 3", title: "Operations Executive", role: "EMPLOYEE", dept: "Operations" }
      ]},
      { name: "Procurement Manager", title: "Procurement Manager", role: "EMPLOYEE", dept: "Operations", isPlaceholder: true, reports: [
        { name: "Procurement Executive 1", title: "Procurement Executive", role: "EMPLOYEE", dept: "Operations" },
        { name: "Procurement Executive 2", title: "Procurement Executive", role: "EMPLOYEE", dept: "Operations" }
      ]},
      { name: "Logistics Manager", title: "Logistics Manager", role: "EMPLOYEE", dept: "Operations", isPlaceholder: true, reports: [
        { name: "Logistics Executive 1", title: "Logistics Executive", role: "EMPLOYEE", dept: "Operations" },
        { name: "Logistics Executive 2", title: "Logistics Executive", role: "EMPLOYEE", dept: "Operations" },
        { name: "Logistics Executive 3", title: "Logistics Executive", role: "EMPLOYEE", dept: "Operations" }
      ]}
    ]
  },
  // Direct Reports to Owners
  { name: "Chief Legal Officer", title: "Chief Legal Officer", role: "SENIOR_MANAGER", dept: "Executive" },
  { name: "Compliance Officer", title: "Compliance Officer", role: "SENIOR_MANAGER", dept: "Executive" },
  { name: "Internal Auditor", title: "Internal Auditor", role: "EMPLOYEE", dept: "Executive" },
  { name: "Executive Assistant", title: "Executive Assistant", role: "EMPLOYEE", dept: "Executive" },
  { name: "Strategy Consultant", title: "Strategy Consultant", role: "EMPLOYEE", dept: "Executive" },
  { name: "IT Security Officer", title: "IT Security Officer", role: "EMPLOYEE", dept: "Executive" }
];

let generatedCredentials: any[] = [];
const deptsMap = new Map();

async function getOrCreateDept(deptName: string) {
  if (deptsMap.has(deptName)) return deptsMap.get(deptName);
  
  let dept = await prisma.department.findUnique({ where: { name: deptName } });
  if (!dept) {
    dept = await prisma.department.create({ data: { name: deptName } });
  }
  deptsMap.set(deptName, dept.id);
  return dept.id;
}

async function processNode(node: any, managerProfileId: string | null = null) {
  let currentProfileId = null;

  // Placeholder names like "Team Lead - API Team" without a person's name 
  // We'll treat them as an actual person with that name for simplicity, 
  // or maybe use it as their name and title.
  const email = generateEmail(node.name);
  const salary = Math.floor(Math.random() * 80000) + 40000; // Random salary between 40k and 120k
  const phone = generatePhone();
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  const joiningDate = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365 * 3)); // random within last 3 years
  const deptId = await getOrCreateDept(node.dept);

  console.log(`Processing: ${node.name} (${email})`);

  // 1. Create Supabase Auth User
  let authUser;
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  authUser = users.find(u => u.email === email);
  
  if (!authUser) {
    const { data: newAuthUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { name: node.name }
    });
    if (error) {
      console.error(`Error creating Supabase user ${email}:`, error);
    } else {
      authUser = newAuthUser.user;
    }
  }

  // 2. Create Prisma User
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: node.role, name: node.name },
    create: { email, role: node.role, name: node.name }
  });

  // 3. Create Employee Profile
  const profile = await prisma.employeeProfile.upsert({
    where: { userId: user.id },
    update: {
      designation: node.title,
      departmentId: deptId,
      managerId: managerProfileId,
      salary,
      contactNumber: phone,
      address,
      joiningDate
    },
    create: {
      userId: user.id,
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
      designation: node.title,
      departmentId: deptId,
      managerId: managerProfileId,
      salary,
      contactNumber: phone,
      address,
      joiningDate,
      employmentStatus: "ACTIVE"
    }
  });

  currentProfileId = profile.id;
  
  generatedCredentials.push({
    Name: node.name,
    Role: node.role,
    Title: node.title,
    Email: email,
    Password: defaultPassword
  });

  // Process reports
  if (node.reports && node.reports.length > 0) {
    for (const report of node.reports) {
      await processNode(report, currentProfileId);
    }
  }
}

async function main() {
  console.log("Starting massive seed operation...");
  
  for (const node of orgStructure) {
    await processNode(node, null);
  }

  console.log("Seed complete! Printing credentials format...");
  
  const fs = require('fs');
  const path = require('path');
  
  const mdContent = `# Company Directory Credentials
This document contains the login credentials for all generated users in the organizational chart.
All accounts share the default password: \`${defaultPassword}\`

| Name | Title | System Role | Email |
|------|-------|-------------|-------|
` + generatedCredentials.map(c => `| ${c.Name} | ${c.Title} | ${c.Role} | ${c.Email} |`).join('\n');

  // We write this to an artifact so the agent can read it
  const artifactPath = path.join(process.cwd(), 'credentials.md');
  fs.writeFileSync(artifactPath, mdContent);
  console.log(`Credentials written to ${artifactPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
