"use client";

import { useState } from "react";

export default function ReportGenerationPage() {
  const [reportType, setReportType] = useState<string>("");
  const [formatType, setFormatType] = useState<string>("");

  const handleGenerate = async () => {
    // Map UI values to API values
    const apiReportType = reportType === "volunteer-activities" ? "volunteers" : "events";
    const apiFormatType = formatType.toUpperCase();

    try {
      // Call the report generation API
      const response = await fetch(
        `/api/reports?type=${apiReportType}&format=${apiFormatType}`
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to generate report: ${error.error || "Unknown error"}`);
        return;
      }

      // Get the blob and download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Set filename based on report type and format
      const reportTypeName = reportType === "volunteer-activities" ? "volunteer-activities" : "event-management";
      const extension = formatType === "pdf" ? "pdf" : "csv";
      a.download = `${reportTypeName}-report.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Report Generation</h1>

      <div className="card rounded-2xl p-5 shadow-lg space-y-6">
        {/* Report Type Dropdown */}
        <div>
          <label
            htmlFor="report-type"
            className="block text-sm font-medium text-slate-100 mb-2"
          >
            Report Type
          </label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a report type</option>
            <option value="volunteer-activities">Volunteer Activities</option>
            <option value="event-management">Event Management</option>
          </select>
        </div>

        {/* Format Type Dropdown */}
        <div>
          <label
            htmlFor="format-type"
            className="block text-sm font-medium text-slate-100 mb-2"
          >
            Format Type
          </label>
          <select
            id="format-type"
            value={formatType}
            onChange={(e) => setFormatType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a format</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            onClick={handleGenerate}
            disabled={!reportType || !formatType}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              reportType && formatType
                ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
