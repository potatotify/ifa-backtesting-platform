'use client'

interface LoadingIndicatorProps {
  stage: string
  progress: number
}

export default function LoadingIndicator({ stage, progress }: LoadingIndicatorProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Running Backtest
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {stage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-pulse opacity-50 bg-white"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {progress < 50 && "📤 Uploading your data..."}
          {progress >= 50 && progress < 90 && "⚙️ Running simulation... This may take a few minutes"}
          {progress >= 90 && "✨ Almost done!"}
        </div>
      </div>
    </div>
  )
}
