// Component: File upload with CSV validation and preview

"use client";

import {useState, useRef} from "react";

interface FileUploadProps {
  onFileUpload: (file: File, metadata: any) => void;
}

export default function FileUpload({onFileUpload}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredColumns = ["date_time", "open", "high", "low", "close"];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset states
    setError(null);
    setPreview([]);
    setFile(null);

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 150 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 100MB limit");
      return;
    }

    setIsValidating(true);

    try {
      // Read first few lines for preview and validation
      const text = await readFilePreview(selectedFile);
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error("File appears to be empty");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate required columns
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(", ")}`
        );
      }

      // Create preview (first 5 rows)
      const previewData = lines
        .slice(0, 6)
        .map((line) => line.split(",").map((cell) => cell.trim()));

      setPreview(previewData);
      setFile(selectedFile);

      // Calculate metadata
      const metadata = {
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        rows: lines.length - 1, // Exclude header
        columns: headers
      };

      onFileUpload(selectedFile, metadata);
    } catch (err: any) {
      setError(err.message || "Failed to validate file");
    } finally {
      setIsValidating(false);
    }
  };

  const readFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const blob = file.slice(0, 50000); // Read first 50KB for preview

      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));

      reader.readAsText(blob);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleClear = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">CSV files only (MAX. 100MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {isValidating && (
        <div className="text-center text-gray-400">
          <p>Validating file...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {file && !error && (
        <div className="space-y-4">
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded flex items-center justify-between">
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm">
                {formatFileSize(file.size)} • {preview.length - 1} rows
                (preview)
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>

          {preview.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm text-gray-400 mb-2">
                Preview (first 5 rows):
              </p>
              <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-gray-700">
                  <tr>
                    {preview[0].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-left text-xs font-medium uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {preview.slice(1, 6).map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-3 py-2 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
