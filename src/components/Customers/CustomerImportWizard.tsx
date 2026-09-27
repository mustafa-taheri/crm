"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  validateImportRows,
  executeCustomerImport,
  type ImportValidationResult,
  type ImportRow,
} from "@/lib/actions/import";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

type Step = "upload" | "map" | "validate" | "summary";

export function CustomerImportWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("upload");
  const [fileName, setFileName] = React.useState("");
  const [rawRows, setRawRows] = React.useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);

  const [columnMap, setColumnMap] = React.useState<{
    name: string;
    mobile: string;
    email: string;
    company: string;
    city: string;
    industry: string;
    source: string;
    status: string;
  }>({
    name: "",
    mobile: "",
    email: "",
    company: "",
    city: "",
    industry: "",
    source: "",
    status: "",
  });

  const [validationResult, setValidationResult] =
    React.useState<ImportValidationResult | null>(null);
  const [validating, setValidating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState(0);

  // 1. File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const rows = results.data as Record<string, string>[];
          if (rows.length > 0) {
            const detectedHeaders = Object.keys(rows[0]);
            setHeaders(detectedHeaders);
            setRawRows(rows);
            autoMapColumns(detectedHeaders);
            setStep("map");
          }
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        if (data.length > 0) {
          const detectedHeaders = Object.keys(data[0]);
          setHeaders(detectedHeaders);
          setRawRows(data);
          autoMapColumns(detectedHeaders);
          setStep("map");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const autoMapColumns = (detectedHeaders: string[]) => {
    const lower = detectedHeaders.map((h) => ({
      original: h,
      clean: h.toLowerCase().trim(),
    }));
    const findMatch = (keys: string[]) =>
      lower.find((h) => keys.some((k) => h.clean.includes(k)))?.original || "";

    setColumnMap({
      name: findMatch(["name", "customer", "full name", "client"]),
      mobile: findMatch(["mobile", "phone", "contact", "whatsapp", "cell"]),
      email: findMatch(["email", "mail"]),
      company: findMatch(["company", "organization", "firm", "business"]),
      city: findMatch(["city", "location", "town"]),
      industry: findMatch(["industry", "sector", "category"]),
      source: findMatch(["source", "lead source"]),
      status: findMatch(["status", "stage"]),
    });
  };

  // 2. Validate Mapping
  const handleValidate = async () => {
    if (!columnMap.name || !columnMap.mobile) {
      alert("Please map both Customer Name and Mobile Number columns.");
      return;
    }

    setValidating(true);
    try {
      const result = await validateImportRows(rawRows, columnMap);
      setValidationResult(result);
      setStep("validate");
    } catch (err: unknown) {
      alert((err as Error).message || "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  // 3. Execute Import
  const handleExecuteImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setImporting(true);
    try {
      const res = await executeCustomerImport(validationResult.validRows);
      setImportedCount(res.imported);
      setStep("summary");
    } catch (err: unknown) {
      alert((err as Error).message || "Import execution failed");
    } finally {
      setImporting(false);
    }
  };

  // Download Error CSV
  const downloadErrorCSV = () => {
    if (!validationResult || validationResult.errors.length === 0) return;
    const errorData = validationResult.errors.map((e) => ({
      "Row Number": e.row,
      "Failure Reason": e.reason,
      ...e.data,
    }));
    const csv = Papa.unparse(errorData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `import_errors_${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Wizard Step Progress */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Import Customers
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={
              step === "upload" ? "text-primary" : "text-muted-foreground"
            }
          >
            1. Upload
          </span>
          <span>→</span>
          <span
            className={
              step === "map" ? "text-primary" : "text-muted-foreground"
            }
          >
            2. Map Fields
          </span>
          <span>→</span>
          <span
            className={
              step === "validate" ? "text-primary" : "text-muted-foreground"
            }
          >
            3. Preview & Validate
          </span>
          <span>→</span>
          <span
            className={
              step === "summary" ? "text-primary" : "text-muted-foreground"
            }
          >
            4. Done
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Customer File</CardTitle>
            <CardDescription>
              Upload a .csv or .xlsx file containing your customer records.
              Maximum 5,000 rows per batch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-muted/50 transition-colors">
              <FileSpreadsheet className="h-12 w-12 text-primary mb-3 opacity-80" />
              <p className="text-sm font-medium mb-1">
                Drag and drop your spreadsheet here, or browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports CSV, XLSX, XLS
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button variant="default" size="sm" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: MAP FIELDS */}
      {step === "map" && (
        <Card>
          <CardHeader>
            <CardTitle>Map Columns</CardTitle>
            <CardDescription>
              Match columns from{" "}
              <strong className="text-foreground">{fileName}</strong> (
              {rawRows.length} rows) to CRM fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Customer Name * (Required)</Label>
                <Select
                  value={columnMap.name}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, name: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Mobile Number * (Required)</Label>
                <Select
                  value={columnMap.mobile}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, mobile: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Select
                  value={columnMap.email}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, email: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Company / Business</Label>
                <Select
                  value={columnMap.company}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, company: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>
                <Select
                  value={columnMap.city}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, city: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select
                  value={columnMap.industry}
                  onValueChange={(val) =>
                    setColumnMap({ ...columnMap, industry: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleValidate} disabled={validating}>
                {validating ? "Validating..." : "Validate & Preview →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: PREVIEW & VALIDATE */}
      {step === "validate" && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Review the records before importing into your database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Rows</p>
                <p className="text-xl font-bold">{validationResult.total}</p>
              </div>
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <p className="text-xs text-success font-medium">
                  Valid & Ready
                </p>
                <p className="text-xl font-bold text-success">
                  {validationResult.valid}
                </p>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <p className="text-xs text-warning font-medium">
                  Duplicates (Skipped)
                </p>
                <p className="text-xl font-bold text-warning">
                  {validationResult.duplicates}
                </p>
              </div>
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-xs text-error font-medium">
                  Errors (Skipped)
                </p>
                <p className="text-xl font-bold text-error">
                  {validationResult.errors.length - validationResult.duplicates}
                </p>
              </div>
            </div>

            {/* Error Preview */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Issues Detected ({validationResult.errors.length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadErrorCSV}
                    className="h-7 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download Error Report (.csv)
                  </Button>
                </div>
                <div className="rounded-md border bg-muted/30 max-h-48 overflow-y-auto p-3 text-xs space-y-1.5 font-mono">
                  {validationResult.errors.slice(0, 10).map((err, i) => (
                    <div key={i} className="text-error flex items-start gap-2">
                      <span className="font-bold">Row {err.row}:</span>
                      <span>{err.reason}</span>
                    </div>
                  ))}
                  {validationResult.errors.length > 10 && (
                    <p className="text-muted-foreground italic pt-1">
                      ...and {validationResult.errors.length - 10} more.
                      Download full report above.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("map")}>
                Back to Mapping
              </Button>
              <Button
                onClick={handleExecuteImport}
                disabled={importing || validationResult.valid === 0}
              >
                {importing
                  ? "Importing Customers..."
                  : `Import ${validationResult.valid} Customers`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SUMMARY */}
      {step === "summary" && (
        <Card className="text-center py-8">
          <CardContent className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">Import Completed!</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Successfully added{" "}
              <strong className="text-foreground">
                {importedCount} customers
              </strong>{" "}
              to Tohfawala CRM.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link href="/customers">
                <Button>View All Customers</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
