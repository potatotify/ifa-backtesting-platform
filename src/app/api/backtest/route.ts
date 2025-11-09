// Route: POST /api/backtest
// Runs Python backtest script as child process and returns results

import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { readFile, writeFile, unlink } from 'fs/promises'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  let configPath = ''
  
  try {
    const body = await request.json()
    const { fileId, filePath, parameters } = body

    console.log('Backtest request received:', { fileId, filePath, parameters })

    if (!filePath || !parameters) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create a temporary config file for Python script
    configPath = path.join(process.cwd(), 'uploads', `config_${Date.now()}.json`)
    const config = {
      filepath: filePath,
      ...parameters,
    }
    
    console.log('Writing config to:', configPath)
    await writeFile(configPath, JSON.stringify(config, null, 2))

    // Run Python script
    const pythonScriptPath = path.join(process.cwd(), 'trail_backtesting-1.py')
    console.log('Running Python script:', pythonScriptPath)
    console.log('With config:', configPath)
    
    await runPythonScript(pythonScriptPath, configPath)
    console.log('✅ Python script completed successfully')

    // Clean up config file after successful execution
    try {
      await unlink(configPath)
      console.log('Config file cleaned up')
    } catch (e) {
      console.log('Config file already deleted or not found')
    }

    // Wait a moment for files to be written
    await new Promise(resolve => setTimeout(resolve, 500))

    // Read generated CSV files
    const tradesPath = path.join(process.cwd(), 'trades.csv')
    const metricsPath = path.join(process.cwd(), 'metrics.csv')

    console.log('Reading trades from:', tradesPath)
    console.log('Reading metrics from:', metricsPath)

    // Parse CSV files
    const tradesData = await parseCSV(tradesPath)
    const metricsData = await parseCSV(metricsPath)

    console.log('✅ Parsed trades:', tradesData.length)
    console.log('✅ Parsed metrics:', metricsData.length)

    if (tradesData.length === 0) {
      throw new Error('No trades data found. Check if trades.csv was generated correctly.')
    }

    if (metricsData.length === 0) {
      throw new Error('No metrics data found. Check if metrics.csv was generated correctly.')
    }

    // Format response
    const response = {
      trades: tradesData.map((trade: any) => ({
        entry_time: trade['Entry Time'] || trade['entry_time'] || '',
        position: trade['Type'] || trade['position'] || '',
        entry_price: parseFloat(trade['Entry Price'] || trade['entry_price'] || '0'),
        exit_time: trade['Exit Time'] || trade['exit_time'] || '',
        exit_reason: trade['Outcome'] || trade['exit_reason'] || '',
        exit_price: parseFloat(trade['Exit Price'] || trade['exit_price'] || '0'),
        pnl: parseFloat(trade['PNL'] || trade['pnl'] || '0'),
      })),
      metrics: {
        total_trades: parseInt(metricsData[0]['Total Trades'] || '0'),
        wins: Math.round(parseFloat(metricsData[0]['Win Rate'] || '0') * parseInt(metricsData[0]['Total Trades'] || '0')),
        losses: parseInt(metricsData[0]['Total Trades'] || '0') - Math.round(parseFloat(metricsData[0]['Win Rate'] || '0') * parseInt(metricsData[0]['Total Trades'] || '0')),
        win_rate: parseFloat(metricsData[0]['Win Rate'] || '0'),
        total_pnl: parseFloat(metricsData[0]['Total Profit'] || '0'),
        avg_pnl: parseFloat(metricsData[0]['Average Profit per Trade'] || '0'),
        max_drawdown: parseFloat(metricsData[0]['Max Drawdown'] || '0'),
        sharpe_ratio: parseFloat(metricsData[0]['Sharpe Ratio'] || '0'),
      },
      downloadLinks: {
        trades_csv: `/api/download?file=trades.csv`,
        metrics_csv: `/api/download?file=metrics.csv`,
      },
    }

    console.log('✅ Formatted response with', response.trades.length, 'trades')
    console.log('Metrics:', response.metrics)

    // Save results to MongoDB
    try {
      const { db } = await connectToDatabase()
      await db.collection('backtests').insertOne({
        fileId,
        parameters,
        results: response,
        createdAt: new Date(),
      })
      console.log('✅ Results saved to MongoDB')
    } catch (dbError) {
      console.error('MongoDB save error (non-fatal):', dbError)
      // Don't fail the request if MongoDB save fails
    }

    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('❌ Backtest error:', error)
    
    // Clean up config file on error
    if (configPath) {
      try {
        await unlink(configPath)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Backtest execution failed' },
      { status: 500 }
    )
  }
}

function runPythonScript(scriptPath: string, configPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'
    
    console.log(`Spawning ${pythonCommand} process...`)
    const python = spawn(pythonCommand, [scriptPath, configPath])
    
    let output = ''
    let errorOutput = ''
    let hasCompleted = false

    python.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      console.log('Python output:', text.trim())
      
      // Check if backtest completed
      if (text.includes('Backtest completed!')) {
        hasCompleted = true
      }
    })

    python.stderr.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      console.error('Python stderr:', text.trim())
    })

    python.on('close', (code) => {
      console.log(`Python process exited with code ${code}`)
      
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`))
      } else if (!hasCompleted) {
        console.warn('Python script exited but may not have completed normally')
        resolve(output)
      } else {
        resolve(output)
      }
    })

    python.on('error', (error) => {
      console.error('Python process error:', error)
      reject(new Error(`Failed to start Python process: ${error.message}`))
    })

    // Set a timeout (10 minutes)
    setTimeout(() => {
      if (!hasCompleted) {
        python.kill()
        reject(new Error('Python script execution timeout (10 minutes)'))
      }
    }, 600000)
  })
}

async function parseCSV(filePath: string): Promise<any[]> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n')
    
    if (lines.length === 0) {
      console.error('CSV file is empty:', filePath)
      return []
    }
    
    const headers = lines[0].split(',').map(h => h.trim())
    console.log('CSV headers:', headers)
    
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
  } catch (error: any) {
    console.error('CSV parse error for', filePath, ':', error.message)
    return []
  }
}
