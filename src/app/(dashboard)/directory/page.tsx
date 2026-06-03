import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DirectoryClient from "./DirectoryClient";

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Fetch all users with profiles & departments
  const users = await db.user.findMany({
    where: {
      role: { not: "ADMIN" }
    },
    include: {
      employeeProfile: {
        include: {
          department: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return <DirectoryClient initialUsers={users} />;
}
