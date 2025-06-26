"use client"

import { useState, useEffect } from "react"
import { useData } from "./data-context"
import "../src/app/date-picker.css"
import {
  AlertCircle,
  BarChart2,
  AlertTriangle,
  Thermometer,
  TrendingUp,
  Activity,
  ChevronDown,
} from "lucide-react"
import AnimatedCounter from "./animated-counter"

function CircularProgress({ percentage }) {
  const radius = 40
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} className="circular-progress">
      <circle
        stroke="#fcd34d"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ opacity: 0.3 }}
      />
      <circle
        stroke="#f97316"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="20"
        fill="#1e293b"
        fontWeight="700"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export default function ReportsSection() {
  const { dailyReports } = useData()
  // Fix selectedDate to latest available date in dailyReports (24hr completed)
  const getLatestDate = () => {
    const dates = Object.keys(dailyReports)
    if (dates.length === 0) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      return yesterday.toISOString().slice(0, 10)
    }
    return dates.sort().reverse()[0]
  }
  const [selectedDate, setSelectedDate] = useState(getLatestDate())
  const reportData = dailyReports[selectedDate] || null
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (hasError) {
    return (
      <div className="reports-section error">
        <h2>Report</h2>
        <div className="error-message">Error loading report: {errorMessage}</div>
      </div>
    )
  }

  try {
    if (!reportData) {
      return (
        <div className="reports-section">
          <div className="header-row">
            <h2>Report</h2>
            <input
              type="date"
              value={selectedDate}
              max={getLatestDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
              aria-label="Select report date"
            />
          </div>
          <div className="no-report">No report data available for the selected date.</div>
        </div>
      )
    }

    return (
      <div className="reports-section">
          <div className="header-row">
            <h2>Report</h2>
            <input
              type="date"
              value={selectedDate}
              max={getLatestDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
              aria-label="Select report date"
            />
          </div>

        <div className="top-card">
          <div className="critical-alerts">
            <div className="icon-circle red-bg">
              <AlertCircle size={24} color="white" />
            </div>
            <div className="critical-text">
              <div className="title">Critical</div>
              <div className="title">Alerts</div>
              <div className="value">45</div>
            </div>
          </div>

          <div className="system-modes">
            <div className="mode-item green">
              <BarChart2 size={20} />
              <div>
                <div className="mode-label">Regen</div>
                <div className="mode-sub-label">Mode</div>
                <div className="mode-value">48</div>
              </div>
            </div>
            <div className="mode-item green">
              <TrendingUp size={20} />
              <div>
                <div className="mode-label">ASC</div>
                <div className="mode-sub-label">Mode</div>
                <div className="mode-value">51</div>
              </div>
            </div>
            <div className="mode-item yellow">
              <Activity size={20} />
              <div>
                <div className="mode-label">Hill</div>
                <div className="mode-sub-label">Hold</div>
                <div className="mode-value">
                  <AnimatedCounter value={reportData.systemModesCounts.hillHold} />
                </div>
              </div>
            </div>
            <div className="mode-item red">
              <AlertTriangle size={20} />
              <div>
                <div className="mode-label">Limp</div>
                <div className="mode-value">45</div>
              </div>
            </div>
            <div className="mode-item green">
              <ChevronDown size={20} />
              <div>
                <div className="mode-value">
                  <CircularProgress percentage={45} />
                </div>
                <div className="mode-label">Idle Shutdown</div>
              </div>
            </div>
          </div>
        </div>

        <div className="temperature-cards">
          <div className="temp-card red-bg-light">
            <div className="temp-icon">
              <Thermometer size={20} color="#ea580c" />
            </div>
            <div className="temp-content">
              <div className="temp-title">Motor Temperature</div>
              <div className="temp-values">
                <div>
                  Min <strong>58.1°C</strong>
                </div>
                <div>
                  Max <strong>66.7°C</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="temp-card green-bg-light">
            <div className="temp-icon">
              <Thermometer size={20} color="#22c55e" />
            </div>
            <div className="temp-content">
              <div className="temp-title">Controller Temperature</div>
              <div className="temp-values">
                <div>
                  Min <strong>44.3°C</strong>
                </div>
                <div>
                  Max <strong>63°C</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    setHasError(true)
    setErrorMessage(error.message)
    return null
  }
}