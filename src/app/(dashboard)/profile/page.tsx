import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: {
      employeeProfile: {
        include: {
          department: true,
          reviewsReceived: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
