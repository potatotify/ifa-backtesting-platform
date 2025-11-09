// Route: / (Home page with file upload and parameter form)

'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ParameterForm from '@/components/ParameterForm'
import LoadingIndicator from '@/components/LoadingIndicator'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (file: File, metadata: any) => {
    setUploadedFile(file)
    setFileMetadata(metadata)
    setError(null)
  }

  const handleRunBacktest = async (parameters: any) => {
    if (!uploadedFile) {
      setError('Please upload a CSV file first')
      return
    }

    setIsLoading(true)
    setError(null)
    setLoadingStage('Uploading file...')
    setProgress(10)

    try {
      // Upload file and parameters
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('parameters', JSON.stringify(parameters))

      console.log('Uploading file:', uploadedFile.name)
      console.log('Parameters:', parameters)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(30)
      setLoadingStage('File uploaded successfully')

      console.log('Upload response status:', uploadResponse.status)

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('Upload error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Server error: ${uploadResponse.status} - ${errorText}`)
        }
        
        throw new Error(errorData.error || 'File upload failed')
      }

      const uploadData = await uploadResponse.json()
      console.log('Upload successful:', uploadData)

      setProgress(40)
      setLoadingStage('Starting backtest...')

      // Run backtest with progress simulation
      const backtestPromise = fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        fileId: uploadData.fileId,
        fileUrl: uploadData.fileUrl,  // NEW - Cloudinary URL
        parameters,
        }),

      })

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 85) {
            const increment = Math.random() * 3
            return Math.min(prev + increment, 85)
          }
          return prev
        })
      }, 2000)

      // Update stage messages over time
      setTimeout(() => setLoadingStage('Loading data...'), 5000)
      setTimeout(() => setLoadingStage('Calculating EMA indicators...'), 15000)
      setTimeout(() => setLoadingStage('Detecting signals...'), 30000)
      setTimeout(() => setLoadingStage('Simulating trades... (This takes time)'), 45000)
      setTimeout(() => setLoadingStage('Analyzing performance...'), 120000)
      setTimeout(() => setLoadingStage('Finalizing results...'), 180000)

      const backtestResponse = await backtestPromise
      clearInterval(progressInterval)

      setProgress(95)
      setLoadingStage('Processing results...')

      console.log('Backtest response status:', backtestResponse.status)

      if (!backtestResponse.ok) {
        const errorText = await backtestResponse.text()
        console.error('Backtest error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Server error: ${backtestResponse.status} - ${errorText}`)
        }
        
        throw new Error(errorData.error || 'Backtest execution failed')
      }

      const backtestData = await backtestResponse.json()
      console.log('Backtest successful:', backtestData)
      
      setProgress(100)
      setLoadingStage('Complete!')
      
      setTimeout(() => {
        setResults(backtestData)
        setIsLoading(false)
      }, 500)

    } catch (err: any) {
      console.error('Error in handleRunBacktest:', err)
      setError(err.message || 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          3-Candle EMA9 Reversal Strategy
        </h2>
        <p className="text-gray-400">
          Upload your OHLC data and configure strategy parameters to run a backtest
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p className="whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {!results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Upload OHLC Data
            </h3>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Configure Parameters
            </h3>
            <ParameterForm
              onSubmit={handleRunBacktest}
              disabled={!uploadedFile || isLoading}
            />
          </div>
        </div>
      ) : (
        <ResultsDisplay results={results} onReset={() => setResults(null)} />
      )}

      {isLoading && (
        <LoadingIndicator 
          stage={loadingStage} 
          progress={progress} 
        />
      )}
    </div>
  )
}
