# 📊 Trading Strategy Backtesting Platform

A full-stack web application for backtesting trading strategies with historical OHLC data. Built with Next.js, Python Flask, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🚀 Features

- **CSV Data Upload** - Upload historical OHLC data with drag-and-drop interface
- **Strategy Configuration** - Customizable parameters (TP/SL, risk %, trailing stops)
- **Real-time Backtesting** - Python-based backtesting engine with live progress tracking
- **Performance Analytics** - Detailed metrics, equity curves, and monthly returns
- **Interactive Charts** - Plotly-based candlestick charts with trade markers
- **Backtest History** - MongoDB storage for all past backtests
- **Comparison Mode** - Compare multiple backtests side-by-side
- **PDF Reports** - Download comprehensive backtest reports
- **Light/Dark Theme** - Beautiful UI with theme toggle support

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts (frontend), Plotly (backend)
- **File Upload:** Cloudinary
- **PDF Generation:** jsPDF + html2canvas
- **Theme:** next-themes

### Backend
- **Framework:** Python Flask
- **Backtesting Engine:** Custom Python implementation
- **Data Processing:** pandas, numpy
- **Charting:** plotly
- **API:** RESTful endpoints

### Database & Cloud
- **Database:** MongoDB Atlas
- **File Storage:** Cloudinary
- **Deployment:** Vercel (frontend), Render/Railway (backend)

## 📁 Project Structure
├── src/
│ ├── app/
│ │ ├── page.tsx # Main backtest page
│ │ ├── history/
│ │ │ ├── page.tsx # Backtest history list
│ │ │ └── [id]/page.tsx # Individual backtest details
│ │ ├── api/
│ │ │ ├── backtest/save/ # Save backtest to MongoDB
│ │ │ ├── history/ # Fetch backtest history
│ │ │ ├── uploads/ # File upload metadata
│ │ │ └── chart-proxy/ # Proxy for Plotly charts
│ │ ├── layout.tsx # Root layout with theme provider
│ │ └── globals.css # Global styles
│ └── components/
│ ├── FileUpload.tsx # CSV upload component
│ ├── ParameterForm.tsx # Strategy configuration form
│ ├── LoadingIndicator.tsx # Progress indicator
│ ├── ResultsDisplay.tsx # Backtest results view
│ ├── Charts.tsx # Recharts equity/monthly charts
│ ├── CompareBacktests.tsx # Comparison modal
│ ├── ThemeProvider.tsx # Theme context provider
│ └── ThemeToggle.tsx # Light/dark theme switcher
├── backend/
│ ├── app.py # Flask API server
│ ├── trail_backtesting.py # Backtesting engine
│ └── requirements.txt # Python dependencies
├── lib/
│ └── mongodb.ts # MongoDB connection utility
└── tailwind.config.ts # Tailwind configuration

## 🔄 Workflow

### 1. **Upload Data**
   - User uploads CSV file with OHLC data (date_time, open, high, low, close)
   - File is validated and uploaded to Cloudinary
   - Metadata saved to MongoDB

### 2. **Configure Strategy**
   - User selects preset (Conservative/Balanced/Aggressive) or customizes parameters
   - Parameters: TP/SL ticks, risk %, trailing stop, commissions, margin

### 3. **Run Backtest**
   - Frontend sends file URL + parameters to Python Flask backend
   - Backend downloads CSV, runs 3-Candle EMA9 Reversal Strategy
   - Returns: trades, metrics, equity curve, monthly returns, Plotly charts

### 4. **View Results**
   - Display metrics dashboard (total trades, win rate, P&L, Sharpe ratio)
   - Interactive equity curve and monthly returns charts
   - Detailed trade history table with sorting/filtering
   - Advanced Plotly candlestick charts with trade markers

### 5. **Save & Compare**
   - Backtest automatically saved to MongoDB
   - Access history page to view all past backtests
   - Compare two backtests side-by-side
   - Download PDF reports or CSV exports

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Cloudinary account

### Frontend Setup

Clone repository
git clone <your-repo-url>
cd ifa-backtesting

Install dependencies
npm install

Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/backtest_db

Run development server
npm run dev
