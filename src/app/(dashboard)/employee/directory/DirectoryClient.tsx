"use client";

import React, { useState } from "react";
import { Search, Mail, Phone, Building, Briefcase, User } from "lucide-react";

export default function DirectoryClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // Get list of unique departments for filter dropdown
  const departments = Array.from(
    new Set(
      initialUsers
        .map((u) => u.employeeProfile?.department?.name)
        .filter(Boolean)
    )
  );

  // Filter users based on search query and department
  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeProfile?.designation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDept === "ALL" ||
      user.employeeProfile?.department?.name === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Directory</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Find and connect with your colleagues and team members.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Filter by:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept: any) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-slate-500">
          <User className="w-12 h-12 mb-3 text-slate-300 stroke-1" />
          <p className="font-bold text-slate-900">No team members found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or department filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((colleague) => {
            const profile = colleague.employeeProfile || {};
            const isSelf = colleague.id === colleague.id; // placeholder
            return (
              <div
                key={colleague.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:border-blue-300 transition-all duration-200 hover:shadow-md flex flex-col items-center text-center relative overflow-hidden group"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    profile.employmentStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/30' :
                    'bg-slate-100 text-slate-600 border border-slate-200/30'
                  }`}>
                    {profile.employmentStatus || 'ACTIVE'}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                  {colleague.image ? (
                    <img
                      src={colleague.image}
                      alt={colleague.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-700">
                      {colleague.name ? colleague.name[0]?.toUpperCase() : "U"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold text-slate-800 text-base mt-4 truncate w-full" title={colleague.name}>
                  {colleague.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-1 flex items-center justify-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {profile.designation || "Team Member"}
                </p>

                <div className="w-full border-t border-slate-100 my-4"></div>

                {/* Contact and Dept info */}
                <div className="w-full space-y-2.5 text-left text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-500">Dept:</span>
                    <span className="font-bold text-slate-700 truncate">{profile.department?.name || "Corporate"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-500">Email:</span>
                    <a
                      href={`mailto:${colleague.email}`}
                      className="font-bold text-slate-700 hover:text-blue-600 truncate hover:underline"
                      title={colleague.email}
                    >
                      {colleague.email}
                    </a>
                  </div>
                  {profile.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-500">Phone:</span>
                      <a
                        href={`tel:${profile.contactNumber}`}
                        className="font-bold text-slate-700 hover:text-blue-600 truncate hover:underline"
                      >
                        {profile.contactNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
