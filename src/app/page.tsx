'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ParameterForm from '@/components/ParameterForm'
import LoadingIndicator from '@/components/LoadingIndicator'
import ResultsDisplay from '@/components/ResultsDisplay'

interface FileMetadata {
  fileUrl: string
  publicId: string
  filename: string
  size: number
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (file: File, metadata: FileMetadata) => {
    setUploadedFile(file)
    setFileMetadata(metadata)
    setError(null)
    console.log('File uploaded to Cloudinary:', metadata)
  }

  const handleRunBacktest = async (parameters: any) => {
    if (!fileMetadata) {
      setError('Please upload a CSV file first')
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(10)
    setLoadingStage('Downloading CSV from Cloudinary...')

    try {
      // Simulate download progress (10% -> 50%)
      const downloadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 50) return prev + 5
          return prev
        })
      }, 300)

      // Start backtest
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/run-backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: fileMetadata.fileUrl,
          parameters: parameters,
        }),
      })

      clearInterval(downloadInterval)
      setProgress(50)
      setLoadingStage('Running simulation...')

      // Simulate backtest progress (50% -> 90%)
      const backtestInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 3
          return prev
        })
      }, 500)

      if (!response.ok) {
        clearInterval(backtestInterval)
        const errorData = await response.json()
        throw new Error(errorData.error || 'Backtest failed')
      }

      const data = await response.json()
      clearInterval(backtestInterval)

      // ✅ SAVE BACKTEST TO MONGODB (with all data including charts)
      try {
        console.log('Saving backtest to MongoDB...')
        const saveResponse = await fetch('/api/backtest/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parameters: parameters,
            results: {
              metrics: data.metrics,
              trades: data.trades,
              chart_data: data.chart_data,
              chart_files: data.chart_files,
              downloadLinks: data.downloadLinks
            },
            fileUrl: fileMetadata.fileUrl,
          }),
        })

        if (saveResponse.ok) {
          console.log('✅ Backtest saved to history')
        } else {
          console.error('❌ Failed to save backtest')
        }
      } catch (saveError) {
        console.error('❌ MongoDB save error:', saveError)
        // Don't block results if save fails
      }
      
      setProgress(100)
      setLoadingStage('Complete!')

      setTimeout(() => {
        setResults(data)
        setIsLoading(false)
      }, 500)

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          3-Candle EMA9 Reversal Strategy
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your OHLC data and configure strategy parameters to run a backtest
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p className="whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {!results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload OHLC Data
            </h3>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configure Parameters
            </h3>
            <ParameterForm
              onSubmit={handleRunBacktest}
              disabled={!fileMetadata || isLoading}
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
