import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar remains fixed on the left */}
      <Sidebar />
      
      {/* Main Content Area next to Sidebar */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
