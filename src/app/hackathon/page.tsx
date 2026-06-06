import Link from "next/link";
import { Code2, ArrowLeft } from "lucide-react";

export default function HackathonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center">
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Code2 className="w-10 h-10" />
      </div>
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Hackathon Project</h1>
      <p className="text-lg text-slate-600 max-w-md mb-8 leading-relaxed">
        This link is not active. AITalent-HR is a proof-of-concept built for a hackathon. While the core AI features are fully functional, marketing pages like this one have been omitted.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-full transition-all hover:shadow-lg">
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
}
