import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={user.role} />
      
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
