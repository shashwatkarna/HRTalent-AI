export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">HRTalent<span className="text-blue-600">AI</span></h1>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>
        
        {/* Placeholder Login Form */}
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
