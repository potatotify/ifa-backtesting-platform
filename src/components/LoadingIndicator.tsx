// Component: Loading indicator with real progress

interface LoadingIndicatorProps {
  stage?: string
  progress?: number
}

export default function LoadingIndicator({ 
  stage = 'Processing...', 
  progress = 0 
}: LoadingIndicatorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Running Backtest
          </h3>
          <p className="text-gray-300 text-center mb-4 font-medium">
            {stage}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">
            {progress.toFixed(0)}% Complete
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Processing large dataset. This may take 3-5 minutes.
            <br />
            Please keep this tab open.
          </p>
        </div>
      </div>
    </div>
  )
}
