"use client";

import React, { useState, useRef, useTransition } from "react";
import { format } from "date-fns";
import { 
  Camera, User, Mail, Phone, MapPin, Building, Briefcase, 
  Calendar, Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Star, Award
} from "lucide-react";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State variables for form fields
  const [name, setName] = useState(user.name || "");
  const [contactNumber, setContactNumber] = useState(user.employeeProfile?.contactNumber || "");
  const [address, setAddress] = useState(user.employeeProfile?.address || "");
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const [imageBlob, setImageBlob] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showSalary, setShowSalary] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size: limit to 1.5MB to fit nicely in postgres text column
      if (file.size > 1500000) {
        setError("Profile picture size must be less than 1.5MB");
        return;
      }
      
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageBlob(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contactNumber", contactNumber);
      formData.append("address", address);
      if (imageBlob) {
        formData.append("image", imageBlob);
      }

      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Your profile has been successfully updated!");
        setImageBlob(null); // Clear pending upload state since it is saved
        router.refresh();
      }
    });
  };

  const joiningDateFormatted = user.employeeProfile?.joiningDate 
    ? format(new Date(user.employeeProfile.joiningDate), "MMMM dd, yyyy")
    : "N/A";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Corporate Profile</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Manage your personal details and view your official corporate HRMS profile.</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Profile Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Avatar Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          {/* Avatar Container */}
          <div className="relative mt-8 group cursor-pointer" onClick={handleImageClick}>
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-4xl font-extrabold text-blue-700 select-none">
                  {name[0]?.toUpperCase() || "U"}
                </span>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <Camera className="w-8 h-8 text-white animate-in zoom-in-75" />
              </div>
            </div>
            {/* Quick camera badge button */}
            <button 
              type="button" 
              className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          <h3 className="text-xl font-bold text-slate-800 mt-5">{name}</h3>
          <p className="text-sm font-semibold text-blue-600 mt-1">{user.role?.replace("_", " ")}</p>
          
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200/50 uppercase tracking-wider">
            {user.employeeProfile?.employmentStatus || "ACTIVE"}
          </div>

          <div className="w-full border-t border-slate-100 my-6"></div>

          {/* Quick Stats list */}
          <div className="w-full space-y-4 text-left text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400">Employee ID</span>
              <span className="font-bold text-slate-800">{user.employeeProfile?.employeeId || "EMP-N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400">Department</span>
              <span className="font-bold text-slate-800 truncate max-w-[150px]">{user.employeeProfile?.department?.name || "Corporate"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400">Official Email</span>
              <span className="font-bold text-slate-800 truncate max-w-[150px]" title={user.email}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <div className="lg:col-span-2 space-y-8">
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Section: Personal Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure your display name, contact phone number, and current home address.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={contactNumber} 
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Main St, San Francisco, CA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Corporate/Employment Info (Read-only) */}
            <div className="bg-slate-50/50 p-6 md:p-8 border-t border-slate-200/60 space-y-6">
              <div className="border-b border-slate-200/60 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-500" />
                  Employment Information
                </h2>
                <p className="text-xs text-slate-400 mt-1">These details are synced with core HR systems. Contact human resources to request changes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                
                {/* Employee ID */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>{user.employeeProfile?.employeeId || "EMP-N/A"}</span>
                  </div>
                </div>

                {/* Corporate Department */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>{user.employeeProfile?.department?.name || "N/A"}</span>
                  </div>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Designation</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{user.employeeProfile?.designation || "N/A"}</span>
                  </div>
                </div>

                {/* Joining Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Joining</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{joiningDateFormatted}</span>
                  </div>
                </div>

                {/* Employment Status */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Employment Status</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>{user.employeeProfile?.employmentStatus || "ACTIVE"}</span>
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate Email</label>
                  <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Base Salary */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Annual Base Salary</label>
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{showSalary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(user.employeeProfile?.salary || 0) : "••••••••"}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowSalary(!showSalary)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title={showSalary ? "Hide Salary" : "Show Salary"}
                    >
                      {showSalary ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Section: Recent Performance */}
            {user.employeeProfile?.reviewsReceived && user.employeeProfile.reviewsReceived.length > 0 && (
              <div className="bg-white p-6 md:p-8 border-t border-slate-200/60 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Recent Performance
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Your latest performance evaluation from your manager.</p>
                </div>
                
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-amber-900">Overall Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= (user.employeeProfile.reviewsReceived[0].rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  
                  {user.employeeProfile.reviewsReceived[0].metrics && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Work Quality</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={`wq-${star}`} className={`w-3 h-3 ${star <= user.employeeProfile.reviewsReceived[0].metrics.workQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Communication</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={`cm-${star}`} className={`w-3 h-3 ${star <= user.employeeProfile.reviewsReceived[0].metrics.communication ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Punctuality</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={`pt-${star}`} className={`w-3 h-3 ${star <= user.employeeProfile.reviewsReceived[0].metrics.punctuality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user.employeeProfile.reviewsReceived[0].managerComments && (
                    <div className="mt-4 pt-4 border-t border-amber-200/50">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Manager Feedback</p>
                      <p className="text-sm text-slate-700 italic">"{user.employeeProfile.reviewsReceived[0].managerComments}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
