"use client";

import * as React from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="h-8 text-xs"
    >
      <Download className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
