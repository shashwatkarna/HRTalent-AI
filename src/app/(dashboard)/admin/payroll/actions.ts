"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function runMonthlyPayroll(month: string) {
  try {
    // 1. Check if payroll was already run for this month
    const existingPayslip = await db.payslip.findFirst({
      where: { month }
    });

    if (existingPayslip) {
      return { success: false, error: `Payroll for ${month} has already been processed.` };
    }

    // 2. Fetch all active employees
    const activeEmployees = await db.employeeProfile.findMany({
      where: { employmentStatus: "ACTIVE" }
    });

    if (activeEmployees.length === 0) {
      return { success: false, error: "No active employees found to run payroll." };
    }

    // 3. Prepare bulk insert payload
    const payslipsData = activeEmployees.map(emp => {
      const baseAnnual = emp.salary || 0;
      const monthlyGross = baseAnnual / 12;
      const allowances = monthlyGross * 0.05;
      const deductions = monthlyGross * 0.12;
      const netSalary = monthlyGross + allowances - deductions;

      return {
        employeeProfileId: emp.id,
        month,
        basicSalary: monthlyGross,
        allowances,
        deductions,
        netSalary,
        status: "PAID"
      };
    });

    // 4. Execute bulk insert
    await db.payslip.createMany({
      data: payslipsData
    });

    // 5. Revalidate the page so the UI updates
    revalidatePath("/admin/payroll");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to run payroll:", error);
    return { success: false, error: error.message };
  }
}
