'use client'

import { useState } from 'react'
import Papa from 'papaparse'

interface FileUploadProps {
  onFileUpload: (file: File, metadata: FileMetadata) => void
}

interface FileMetadata {
  fileUrl: string
  publicId: string
  filename: string
  size: number
}

interface CSVPreview {
  headers: string[]
  rows: any[][]
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)

  const validateCSV = (file: File): Promise<CSVPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const text = e.target?.result as string
        
        Papa.parse(text, {
          preview: 6,
          complete: (results) => {
            const data = results.data as any[][]
            
            if (data.length < 2) {
              reject('CSV file is empty or has no data rows')
              return
            }

            const headers = data[0].map((h: any) => String(h).toLowerCase().trim())
            const requiredColumns = ['date_time', 'open', 'high', 'low', 'close']
            
            const missingColumns = requiredColumns.filter(col => !headers.includes(col))
            if (missingColumns.length > 0) {
              reject(`Missing required columns: ${missingColumns.join(', ')}`)
              return
            }

            const dataRows = data.slice(1, 6)
            
            resolve({
              headers: data[0],
              rows: dataRows
            })
          },
          error: (error: Error) => {
            reject(`Failed to parse CSV: ${error.message}`)
          }
        })
      }

      reader.onerror = () => {
        reject('Failed to read file')
      }

      reader.readAsText(file)
    })
  }

  const uploadToCloudinary = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'backtest_uploads')

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          
          const metadata: FileMetadata = {
            fileUrl: response.secure_url,
            publicId: response.public_id,
            filename: file.name,
            size: file.size,
          }
          
          setUploaded(true)
          onFileUpload(file, metadata)
          setUploading(false)
        } else {
          throw new Error('Upload failed')
        }
      })

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please check your Cloudinary configuration.')
        setUploading(false)
      })

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`)
      xhr.send(formData)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
      setUploading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    
    if (selectedFile) {
      setError(null)
      setValidationError(null)
      setCsvPreview(null)
      setUploaded(false)

      const maxSize = 100 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError(`File too large. Maximum size is 100MB`)
        return
      }

      if (!selectedFile.name.endsWith('.csv')) {
        setError('Only CSV files are supported')
        return
      }

      setFile(selectedFile)

      try {
        const preview = await validateCSV(selectedFile)
        setCsvPreview(preview)
        await uploadToCloudinary(selectedFile)
      } catch (err: any) {
        setValidationError(err)
        setFile(null)
      }
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setError(null)
    setValidationError(null)
    setCsvPreview(null)
    setUploaded(false)
    setUploadProgress(0)
    
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-gray-500 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <div className="text-center space-y-3">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-white font-medium">Upload CSV File</p>
                <p className="text-sm text-gray-400 mt-1">
                  Required: date_time, open, high, low, close
                </p>
              </div>
              <p className="text-xs text-gray-500">Max 100MB</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`h-10 w-10 rounded flex items-center justify-center ${
                uploaded ? 'bg-green-900/50' : 'bg-blue-900/50'
              }`}>
                {uploaded ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {uploaded ? 'Uploaded ✓' : `Uploading... ${Math.round(uploadProgress)}%`}
                </p>
              </div>
            </div>
            {uploaded && (
              <button
                onClick={handleClearFile}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          {uploading && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {(validationError || error) && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium mb-1">Error</p>
          <p className="text-sm">{validationError || error}</p>
        </div>
      )}

      {csvPreview && uploaded && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-white text-sm font-medium">Data Preview</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50">
                <tr>
                  {csvPreview.headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-gray-300 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-gray-700">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-gray-400">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
