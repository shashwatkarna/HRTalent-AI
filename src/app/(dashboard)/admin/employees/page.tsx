import { Plus, Search, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Temporary Mock Data for UI testing (until we connect Supabase)
const mockEmployees = [
  { id: "EMP-001", name: "Alice Johnson", email: "alice@company.com", role: "Senior Developer", department: "Engineering", status: "ACTIVE" },
  { id: "EMP-002", name: "Bob Smith", email: "bob@company.com", role: "HR Manager", department: "Human Resources", status: "ACTIVE" },
  { id: "EMP-003", name: "Charlie Davis", email: "charlie@company.com", role: "Marketing Specialist", department: "Marketing", status: "ON_LEAVE" },
  { id: "EMP-004", name: "Diana Evans", email: "diana@company.com", role: "Product Manager", department: "Product", status: "ACTIVE" },
  { id: "EMP-005", name: "Evan Wright", email: "evan@company.com", role: "Sales Rep", department: "Sales", status: "TERMINATED" },
];

export default function EmployeeDirectoryPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 mt-1">Manage your workforce, update profiles, and view statuses.</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search employees by name, email, or ID..." 
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">Filter by Department</Button>
          <Button variant="outline" className="w-full sm:w-auto">Filter by Status</Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Emp ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Role & Dept</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-600">{employee.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-900">{employee.name}</div>
                    <div className="text-sm text-slate-500">{employee.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-700">{employee.role}</div>
                    <div className="text-sm text-slate-500">{employee.department}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={employee.status === "ACTIVE" ? "default" : employee.status === "ON_LEAVE" ? "secondary" : "destructive"}
                    className={
                      employee.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : 
                      employee.status === "ON_LEAVE" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                    }
                  >
                    {employee.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                      <FileEdit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
