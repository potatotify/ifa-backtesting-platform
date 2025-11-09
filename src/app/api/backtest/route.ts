// Route: POST /api/backtest
// Runs Python backtest script as child process and returns results

import {NextRequest, NextResponse} from "next/server";
import {spawn} from "child_process";
import path from "path";
import {readFile, writeFile, readdir, mkdir} from "fs/promises";
import {existsSync} from "fs";
import {connectToDatabase} from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {fileId, filePath, parameters} = body;

    if (!filePath || !parameters) {
      return NextResponse.json(
        {error: "Missing required parameters"},
        {status: 400}
      );
    }

    // Create a temporary config file for Python script
    const configPath = path.join(
      process.cwd(),
      "uploads",
      `config_${Date.now()}.json`
    );
    await writeFile(
      configPath,
      JSON.stringify({
        filepath: filePath,
        ...parameters
      })
    );

    // Run Python script
    const pythonScriptPath = path.join(process.cwd(), "trail_backtesting-1.py");
    const result = await runPythonScript(pythonScriptPath, configPath);

    // Parse Python output
    const tradesPath = path.join(process.cwd(), "trades.csv");
    const metricsPath = path.join(process.cwd(), "metrics.csv");

    // Read CSV files
    const tradesData = await parseCSV(tradesPath);
    const metricsData = await parseCSV(metricsPath);

    // Get HTML chart files from plots folder
    const plotsDir = path.join(process.cwd(), "plots");
    let chartFiles: string[] = [];

    // Create plots directory if it doesn't exist
    if (!existsSync(plotsDir)) {
      try {
        await mkdir(plotsDir, {recursive: true});
        console.log("Created plots directory");
      } catch (error) {
        console.warn("Could not create plots directory:", error);
      }
    }

    // Try to read chart files
    try {
      const files = await readdir(plotsDir);
      chartFiles = files
        .filter((f) => f.endsWith(".html"))
        .sort() // Sort to ensure consistent order
        .map((f) => `/api/charts/${f}`); // Create API route URLs
    } catch (error) {
      console.warn("No chart files found in plots directory");
    }

    // Format trades with all required fields - FIXED: Calculate cumulative PNL properly
    let cumulativePnl = 0;
    const formattedTrades = tradesData.map((trade: any) => {
      const pnl = parseFloat(trade["PNL"]) || 0;
      cumulativePnl += pnl; // Add to running total

      return {
        entry_time: trade["Entry Time"],
        position: trade["Type"],
        entry_price: parseFloat(trade["Entry Price"]),
        sl_price:
          parseFloat(trade["Stop Loss"]) ||
          parseFloat(trade["Entry Price"]) * 0.99,
        tp_price:
          parseFloat(trade["Take Profit"]) ||
          parseFloat(trade["Entry Price"]) * 1.01,
        exit_time: trade["Exit Time"],
        exit_reason: trade["Outcome"],
        exit_price: parseFloat(trade["Exit Price"]),
        pnl: pnl,
        cumulative_pnl: cumulativePnl
      };
    });

    // Calculate additional metrics
    const wins = formattedTrades.filter((t) => t.pnl > 0);
    const losses = formattedTrades.filter((t) => t.pnl < 0);
    const avgWin =
      wins.length > 0
        ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length
        : 0;
    const avgLoss =
      losses.length > 0
        ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
        : 0;
    const bestTrade =
      formattedTrades.length > 0
        ? Math.max(...formattedTrades.map((t) => t.pnl))
        : 0;
    const worstTrade =
      formattedTrades.length > 0
        ? Math.min(...formattedTrades.map((t) => t.pnl))
        : 0;

    // Generate chart data for basic visualization
    const chartData = generateChartData(
      formattedTrades,
      parameters.starting_balance
    );

    // Format metrics
    const metrics =
      metricsData.length > 0
        ? {
            total_trades: parseInt(metricsData[0]["Total Trades"]),
            wins: wins.length,
            losses: losses.length,
            win_rate: parseFloat(metricsData[0]["Win Rate"]),
            total_pnl: parseFloat(metricsData[0]["Total Profit"]),
            avg_pnl: parseFloat(metricsData[0]["Average Profit per Trade"]),
            avg_win: avgWin,
            avg_loss: avgLoss,
            risk_reward_ratio: avgLoss > 0 ? avgWin / avgLoss : 0,
            max_drawdown: parseFloat(metricsData[0]["Max Drawdown"]),
            sharpe_ratio: parseFloat(metricsData[0]["Sharpe Ratio"]),
            best_trade: bestTrade,
            worst_trade: worstTrade
          }
        : {};

    const response = {
      trades: formattedTrades,
      metrics,
      chart_data: chartData,
      chart_files: chartFiles, // HTML chart files from Python script
      downloadLinks: {
        trades_csv: `/api/download?file=trades.csv`,
        metrics_csv: `/api/download?file=metrics.csv`
      }
    };

    // Save results to MongoDB
    const {db} = await connectToDatabase();
    await db.collection("backtests").insertOne({
      fileId,
      parameters,
      results: response,
      createdAt: new Date()
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Backtest error:", error);
    return NextResponse.json(
      {error: error.message || "Backtest execution failed"},
      {status: 500}
    );
  }
}

function runPythonScript(
  scriptPath: string,
  configPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath, configPath]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Python output:", data.toString());
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Python error:", data.toString());
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Python script failed with code ${code}: ${errorOutput}`)
        );
      } else {
        resolve(output);
      }
    });

    python.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

async function parseCSV(filePath: string): Promise<any[]> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.trim().split("\n");

    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || "";
      });
      rows.push(row);
    }

    return rows;
  } catch (error) {
    console.error("CSV parse error:", error);
    return [];
  }
}

// Generate chart data as backup/for Recharts
function generateChartData(trades: any[], startingBalance: number) {
  const equityCurve = [];
  const monthlyReturns: {[key: string]: number} = {};

  let currentBalance = startingBalance;

  trades.forEach((trade, index) => {
    currentBalance += trade.pnl;

    equityCurve.push({
      trade_number: index + 1,
      date: trade.exit_time,
      balance: parseFloat(currentBalance.toFixed(2))
    });

    // Extract month from date (assumes format like "2020-01-15 09:30:00")
    const month = trade.exit_time.substring(0, 7); // "2020-01"
    monthlyReturns[month] = (monthlyReturns[month] || 0) + trade.pnl;
  });

  const monthlyReturnsArray = Object.entries(monthlyReturns).map(
    ([month, pnl]) => ({
      month,
      pnl: parseFloat((pnl as number).toFixed(2))
    })
  );

  return {
    equity_curve: equityCurve,
    monthly_returns: monthlyReturnsArray
  };
}
