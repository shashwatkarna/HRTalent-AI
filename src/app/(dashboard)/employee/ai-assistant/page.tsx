import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export default async function EmployeeAIAssistantPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    select: { name: true, role: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">AI Assistant</h1>
        <p className="text-slate-500">Have a question about HR policies or benefits? Ask our AI!</p>
      </div>

      <ChatClient userName={user.name?.split(" ")[0] || "Employee"} />
    </div>
  );
}
