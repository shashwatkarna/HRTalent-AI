"use client";

import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { updateEmployee, requestTermination } from "./actions";

export default function EmployeeRowActions({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState(user.role);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await updateEmployee(user.id, { name, role });
    setIsLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsEditModalOpen(false);
    }
  };

  const handleTerminationRequest = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for termination.");
      return;
    }
    setIsLoading(true);
    const res = await requestTermination(user.id, reason);
    setIsLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsDeleteModalOpen(false);
      setReason("");
      alert("Termination Request submitted to HR successfully.");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
            <button 
              onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4 text-blue-500" /> Edit Employee
            </button>
            <button 
              onClick={() => { setIsOpen(false); setIsDeleteModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Request Termination
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Employee</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR_RECRUITER">HR Recruiter</option>
                  <option value="SENIOR_MANAGER">Senior Manager</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 transition-colors">
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Request Termination</h2>
            <p className="text-slate-500 mb-4 text-sm">
              You are proposing to terminate <strong>{user.name}</strong>. This request will be routed to HR for final approval and execution.
            </p>
            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Termination</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Please explain why you are requesting this termination..."
                required
              />
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleTerminationRequest} disabled={isLoading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 transition-colors">
                {isLoading ? "Submitting..." : "Submit Request to HR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
