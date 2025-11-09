// Component: Loading indicator with animated spinner

export default function LoadingIndicator() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Running Backtest...
          </h3>
          <p className="text-gray-400 text-center">
            This may take a few moments depending on the size of your data.
          </p>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
