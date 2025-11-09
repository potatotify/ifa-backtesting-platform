// Route: POST /api/backtest
// Runs Python backtest script as child process and returns results

import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, filePath, parameters } = body

    if (!filePath || !parameters) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create a temporary config file for Python script
    const configPath = path.join(process.cwd(), 'uploads', `config_${Date.now()}.json`)
    await writeFile(configPath, JSON.stringify({
      filepath: filePath,
      ...parameters,
    }))

    // Run Python script
    const pythonScriptPath = path.join(process.cwd(), 'trail_backtesting-1.py')
    const result = await runPythonScript(pythonScriptPath, configPath)

    // Parse Python output
    const tradesPath = path.join(process.cwd(), 'trades.csv')
    const metricsPath = path.join(process.cwd(), 'metrics.csv')

    // Read CSV files
    const tradesData = await parseCSV(tradesPath)
    const metricsData = await parseCSV(metricsPath)

    // Format response
    const response = {
      trades: tradesData.map((trade: any) => ({
        entry_time: trade['Entry Time'],
        position: trade['Type'],
        entry_price: parseFloat(trade['Entry Price']),
        exit_time: trade['Exit Time'],
        exit_reason: trade['Outcome'],
        exit_price: parseFloat(trade['Exit Price']),
        pnl: parseFloat(trade['PNL']),
      })),
      metrics: metricsData.length > 0 ? {
        total_trades: parseInt(metricsData[0]['Total Trades']),
        wins: Math.round(parseFloat(metricsData[0]['Win Rate']) * parseInt(metricsData[0]['Total Trades'])),
        losses: Math.round((1 - parseFloat(metricsData[0]['Win Rate'])) * parseInt(metricsData[0]['Total Trades'])),
        win_rate: parseFloat(metricsData[0]['Win Rate']),
        total_pnl: parseFloat(metricsData[0]['Total Profit']),
        avg_pnl: parseFloat(metricsData[0]['Average Profit per Trade']),
        max_drawdown: parseFloat(metricsData[0]['Max Drawdown']),
        sharpe_ratio: parseFloat(metricsData[0]['Sharpe Ratio']),
      } : {},
      downloadLinks: {
        trades_csv: `/api/download?file=trades.csv`,
        metrics_csv: `/api/download?file=metrics.csv`,
      },
    }

    // Save results to MongoDB
    const { db } = await connectToDatabase()
    await db.collection('backtests').insertOne({
      fileId,
      parameters,
      results: response,
      createdAt: new Date(),
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Backtest error:', error)
    return NextResponse.json(
      { error: error.message || 'Backtest execution failed' },
      { status: 500 }
    )
  }
}

function runPythonScript(scriptPath: string, configPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath, configPath])
    
    let output = ''
    let errorOutput = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
      console.log('Python output:', data.toString())
    })

    python.stderr.on('data', (data) => {
      errorOutput += data.toString()
      console.error('Python error:', data.toString())
    })

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`))
      } else {
        resolve(output)
      }
    })

    python.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`))
    })
  })
}

async function parseCSV(filePath: string): Promise<any[]> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n')
    
    if (lines.length === 0) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: any = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || ''
      })
      rows.push(row)
    }
    
    return rows
  } catch (error) {
    console.error('CSV parse error:', error)
    return []
  }
}
