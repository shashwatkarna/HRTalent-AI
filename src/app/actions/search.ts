"use server";

import { db } from "@/lib/prisma";

export type SearchResultType = 'candidate' | 'job' | 'employee' | 'department';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(query: string, userRole: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();
  const results: SearchResult[] = [];

  try {
    // 1. Employee Search (Available to ALL roles, acts as company directory)
    const employees = await db.user.findMany({
      where: {
        role: { not: "ADMIN" },
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } }
        ]
      },
      include: {
        employeeProfile: {
          include: { department: true }
        }
      },
      take: 5
    });

    employees.forEach(emp => {
      results.push({
        id: `emp-${emp.id}`,
        type: 'employee',
        title: emp.name || "Unknown",
        subtitle: emp.employeeProfile?.designation || emp.role,
        href: '/directory'
      });
    });

    // 2. Department Search (Only ADMIN / MANAGEMENT)
    if (userRole === "ADMIN" || userRole === "MANAGEMENT") {
      const departments = await db.department.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" }
        },
        take: 3
      });

      departments.forEach(dept => {
        results.push({
          id: `dept-${dept.id}`,
          type: 'department',
          title: dept.name,
          subtitle: "Department",
          href: '/admin/analytics' // Or wherever departments are managed
        });
      });
    }

    // 3. Candidates & Jobs Search (HR_RECRUITER, SENIOR_MANAGER, ADMIN)
    if (["HR_RECRUITER", "SENIOR_MANAGER", "ADMIN", "MANAGEMENT"].includes(userRole)) {
      
      const candidates = await db.candidate.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } }
          ]
        },
        include: {
          jobPosting: true
        },
        take: 5
      });

      candidates.forEach(cand => {
        results.push({
          id: `cand-${cand.id}`,
          type: 'candidate',
          title: cand.name,
          subtitle: `Applied for: ${cand.jobPosting?.title || 'Unknown Role'}`,
          href: userRole === "SENIOR_MANAGER" ? '/manager/recruitment' : '/hr/candidates'
        });
      });

      const jobs = await db.jobPosting.findMany({
        where: {
          title: { contains: searchTerm, mode: "insensitive" }
        },
        take: 3
      });

      jobs.forEach(job => {
        results.push({
          id: `job-${job.id}`,
          type: 'job',
          title: job.title,
          subtitle: "Job Posting",
          href: '/hr/jobs'
        });
      });
    }

    return results;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}
