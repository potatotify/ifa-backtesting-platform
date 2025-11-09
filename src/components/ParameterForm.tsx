// Component: Strategy parameter configuration form with validation

'use client'

import { useState } from 'react'

interface ParameterFormProps {
  onSubmit: (parameters: any) => void
  disabled?: boolean
}

export default function ParameterForm({ onSubmit, disabled }: ParameterFormProps) {
  const [parameters, setParameters] = useState({
    starting_balance: 100000,
    tp_ticks: 20,
    sl_ticks: 20,
    risk_percentage: 1,
    trailing_stop: false,
    trailing_stop_ticks: 5,
    tick_size: 0.25,
    tick_value: 5,
    commission_per_trade: 5,
    slippage_ticks: 1,
    contract_margin: 13000,
  })

  const handleChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(parameters)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Strategy Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Strategy Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Starting Balance ($)
            </label>
            <input
              type="number"
              value={parameters.starting_balance}
              onChange={(e) => handleChange('starting_balance', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Take Profit (Ticks)
              </label>
              <input
                type="number"
                value={parameters.tp_ticks}
                onChange={(e) => handleChange('tp_ticks', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stop Loss (Ticks)
              </label>
              <input
                type="number"
                value={parameters.sl_ticks}
                onChange={(e) => handleChange('sl_ticks', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Risk Percentage (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={parameters.risk_percentage}
              onChange={(e) => handleChange('risk_percentage', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0.5"
              max="5"
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="trailing_stop"
              checked={parameters.trailing_stop}
              onChange={(e) => handleChange('trailing_stop', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="trailing_stop" className="text-sm font-medium text-gray-300">
              Enable Trailing Stop
            </label>
          </div>

          {parameters.trailing_stop && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Trailing Stop (Ticks)
              </label>
              <input
                type="number"
                value={parameters.trailing_stop_ticks}
                onChange={(e) => handleChange('trailing_stop_ticks', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="3"
                max="20"
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Market Constants */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Market Constants</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tick Size
              </label>
              <input
                type="number"
                step="0.01"
                value={parameters.tick_size}
                onChange={(e) => handleChange('tick_size', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tick Value ($)
              </label>
              <input
                type="number"
                value={parameters.tick_value}
                onChange={(e) => handleChange('tick_value', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Commission per Trade ($)
              </label>
              <input
                type="number"
                value={parameters.commission_per_trade}
                onChange={(e) => handleChange('commission_per_trade', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Slippage (Ticks)
              </label>
              <input
                type="number"
                value={parameters.slippage_ticks}
                onChange={(e) => handleChange('slippage_ticks', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contract Margin ($)
            </label>
            <input
              type="number"
              value={parameters.contract_margin}
              onChange={(e) => handleChange('contract_margin', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
          disabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Run Backtest
      </button>
    </form>
  )
}
