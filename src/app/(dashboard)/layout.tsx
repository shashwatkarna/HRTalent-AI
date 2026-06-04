import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardProvider } from "@/components/layout/DashboardProvider";
import DashboardLayoutWrapper from "@/components/layout/DashboardLayoutWrapper";

import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: {
      employeeProfile: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProvider>
      <DashboardLayoutWrapper user={user}>
        <RealtimeProvider role={user.role}>
          {children}
        </RealtimeProvider>
      </DashboardLayoutWrapper>
    </DashboardProvider>
  );
}
