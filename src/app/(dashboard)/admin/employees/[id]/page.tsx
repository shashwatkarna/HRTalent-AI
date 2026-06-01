import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Placeholder data. Will fetch from Prisma using the `id` later.
  const employee = {
    id: id,
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "Senior Developer",
    department: "Engineering",
    status: "ACTIVE",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Avenue, Silicon Valley, CA",
    joiningDate: "Oct 12, 2022",
    salary: "$140,000",
    manager: "Sarah Connor (Director of Eng)"
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <Link href="/admin/employees" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm">
          {employee.name.charAt(0)}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{employee.status}</Badge>
          </div>
          <p className="text-lg text-slate-500 font-medium">{employee.role} • {employee.department}</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">Edit Profile</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Message</Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Contact Information</h3>
          
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="w-5 h-5 text-slate-400" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Phone className="w-5 h-5 text-slate-400" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <MapPin className="w-5 h-5 text-slate-400" />
            <span>{employee.address}</span>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Employment Details</h3>
          
          <div className="flex items-center gap-3 text-slate-600">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Emp ID:</span> 
            <span>{employee.id}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Building className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Reports To:</span> 
            <span>{employee.manager}</span>
          </div>
          <div className="flex justify-between border-t pt-4 mt-2">
            <div className="text-center">
              <p className="text-sm text-slate-500">Joined</p>
              <p className="font-medium text-slate-900">{employee.joiningDate}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Base Salary</p>
              <p className="font-medium text-slate-900">{employee.salary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
