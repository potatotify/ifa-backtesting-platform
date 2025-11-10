"use client";

import {useState} from "react";

interface ParameterFormProps {
  onSubmit: (parameters: any) => void;
  disabled?: boolean;
}

export default function ParameterForm({
  onSubmit,
  disabled
}: ParameterFormProps) {
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
    contract_margin: 13000
  });

  const handleChange = (name: string, value: string | boolean) => {
    // Allow empty string for number inputs
    if (typeof value === 'string') {
      setParameters((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setParameters((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty strings to 0 or default values before submitting
    const submittedParams = {
      ...parameters,
      starting_balance: parameters.starting_balance || 100000,
      tp_ticks: parameters.tp_ticks || 20,
      sl_ticks: parameters.sl_ticks || 20,
      risk_percentage: parameters.risk_percentage || 1,
      trailing_stop_ticks: parameters.trailing_stop_ticks || 5,
      tick_size: parameters.tick_size || 0.25,
      tick_value: parameters.tick_value || 5,
      commission_per_trade: parameters.commission_per_trade || 5,
      slippage_ticks: parameters.slippage_ticks || 1,
      contract_margin: parameters.contract_margin || 13000,
    };
    
    onSubmit(submittedParams);
  };

  const Tooltip = ({text}: {text: string}) => (
    <span
      className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs rounded-full bg-gray-700 text-gray-300 cursor-help hover:bg-gray-600 hover:text-white transition-colors"
      title={text}
    >
      ?
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Strategy Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">
          Strategy Settings
        </h4>
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              Starting Balance ($)
              <Tooltip text="Initial capital available for trading. This is your total account balance at the start." />
            </label>
            <input
              type="number"
              value={parameters.starting_balance}
              onChange={(e) => handleChange("starting_balance", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Take Profit (Ticks)
                <Tooltip text="Target profit distance from entry price in ticks. When price moves this far in your favor, position closes with profit." />
              </label>
              <input
                type="number"
                value={parameters.tp_ticks}
                onChange={(e) => handleChange("tp_ticks", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="50"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Stop Loss (Ticks)
                <Tooltip text="Maximum loss distance from entry price in ticks. When price moves this far against you, position closes to limit loss." />
              </label>
              <input
                type="number"
                value={parameters.sl_ticks}
                onChange={(e) => handleChange("sl_ticks", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                max="50"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              Risk Percentage (%)
              <Tooltip text="Percentage of your balance to risk per trade. Controls position size based on your stop loss. Lower = safer, higher = more aggressive." />
            </label>
            <input
              type="number"
              step="0.1"
              value={parameters.risk_percentage}
              onChange={(e) => handleChange("risk_percentage", e.target.value)}
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
              onChange={(e) => handleChange("trailing_stop", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="trailing_stop"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              Enable Trailing Stop
              <Tooltip text="Automatically moves your stop loss to lock in profits as the trade moves in your favor. Helps protect gains." />
            </label>
          </div>

          {parameters.trailing_stop && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Trailing Stop (Ticks)
                <Tooltip text="Distance in ticks to trail your stop loss behind the highest (for long) or lowest (for short) price. Smaller = tighter protection." />
              </label>
              <input
                type="number"
                value={parameters.trailing_stop_ticks}
                onChange={(e) => handleChange("trailing_stop_ticks", e.target.value)}
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
        <h4 className="text-lg font-semibold text-white mb-3">
          Market Constants
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Tick Size
                <Tooltip text="Minimum price movement for this instrument. For NQ futures, this is 0.25 points." />
              </label>
              <input
                type="number"
                step="0.01"
                value={parameters.tick_size}
                onChange={(e) => handleChange("tick_size", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Tick Value ($)
                <Tooltip text="Dollar value of one tick movement. For NQ futures, each 0.25 point move = $5." />
              </label>
              <input
                type="number"
                value={parameters.tick_value}
                onChange={(e) => handleChange("tick_value", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Commission per Trade ($)
                <Tooltip text="Broker commission charged per trade (round-trip). Includes both entry and exit fees." />
              </label>
              <input
                type="number"
                value={parameters.commission_per_trade}
                onChange={(e) => handleChange("commission_per_trade", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                Slippage (Ticks)
                <Tooltip text="Expected price slippage when executing orders. Accounts for the difference between expected and actual fill price." />
              </label>
              <input
                type="number"
                value={parameters.slippage_ticks}
                onChange={(e) => handleChange("slippage_ticks", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              Contract Margin ($)
              <Tooltip text="Required margin per contract. For NQ E-mini futures, typically around $13,000. Limits how many contracts you can trade." />
            </label>
            <input
              type="number"
              value={parameters.contract_margin}
              onChange={(e) => handleChange("contract_margin", e.target.value)}
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
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Run Backtest
      </button>
    </form>
  );
}
