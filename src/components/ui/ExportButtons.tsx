"use client";

import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from "sonner";

interface ExportButtonsProps {
  elementId: string;
  filename: string;
}

export function ExportButtons({ elementId, filename }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const exportPDF = async () => {
    try {
      setIsExportingPDF(true);
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Could not find table to export");
        return;
      }

      toast.info("Generating PDF...", { id: "pdf-export" });
      
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
      
      toast.success("PDF Downloaded Successfully!", { id: "pdf-export" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: "pdf-export" });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportExcel = () => {
    try {
      setIsExportingExcel(true);
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Could not find table to export");
        return;
      }
      
      // If the element itself is a table, or if it contains a table
      const tableElement = element.tagName === "TABLE" ? element : element.querySelector("table");
      
      if (!tableElement) {
        toast.error("No table data found to export to Excel");
        return;
      }

      const wb = XLSX.utils.table_to_book(tableElement, { sheet: "Sheet1" });
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      toast.success("Excel File Downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Excel file");
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={exportPDF} 
        disabled={isExportingPDF}
        variant="outline" 
        size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
      >
        <FileText className="w-4 h-4 mr-2" />
        {isExportingPDF ? "Exporting..." : "PDF"}
      </Button>
      <Button 
        onClick={exportExcel} 
        disabled={isExportingExcel}
        variant="outline" 
        size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
      >
        <Table className="w-4 h-4 mr-2" />
        {isExportingExcel ? "Exporting..." : "Excel"}
      </Button>
    </div>
  );
}
