"use client"

import { useState, useMemo, useEffect } from "react"
import { useData } from "./data-context"
import { ChevronDown, AlertCircle, Thermometer, BarChart2, TrendingUp, Activity, AlertTriangle } from "lucide-react"
import Chart from "./chart"

function AnimatedCounter({ value, className }) {
  const [displayValue, setDisplayValue] = useState(0)

  useMemo(() => {
    let start = 0
    const end = value
    if (start === end) return

    const duration = 1000
    const increment = end / (duration / 16)
    let current = start

    const step = () => {
      current += increment
      if (current >= end) {
        setDisplayValue(end)
      } else {
        setDisplayValue(Math.floor(current))
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [value])

  return <span className={className}>{displayValue}</span>
}

function CircularProgress({ percentage }) {
  const radius = 40
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2}>
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
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s" }}
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


function MetricCard({ icon, title, value, iconColor, valueClassName, containerClassName }) {
  return (
    <div className={`metric-card ${containerClassName || ""}`}>
      <div className="icon-circle" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <div className="metric-content">
        <div className="metric-title">{title}</div>
        <div className={`metric-value ${valueClassName || ""}`}>{value}</div>
      </div>
    </div>
  )
}

export default function ReportsSection() {
  const { dailyReports, getReportsByDateRange } = useData()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [reportData, setReportData] = useState(null)

  // Update reportData when selectedDate or dateRange changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const reports = getReportsByDateRange(dateRange.start, dateRange.end)
      setReportData(reports)
    } else if (selectedDate) {
      setReportData(dailyReports[selectedDate] || null)
    } else {
      setReportData(null)
    }
  }, [selectedDate, dateRange, dailyReports, getReportsByDateRange])

  // Handlers for date and range selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setDateRange({ start: null, end: null })
  }

  const handleRangeStartChange = (e) => {
    setDateRange((prev) => ({ ...prev, start: e.target.value }))
    setSelectedDate(null)
  }

  const handleRangeEndChange = (e) => {
    setDateRange((prev) => ({ ...prev, end: e.target.value }))
    setSelectedDate(null)
  }

  // Helper to aggregate multiple reports in dateRange for display
  const aggregateRangeReport = (reports) => {
    if (!reports) return null
    const keys = ["criticalAlertsCount", "systemModesCounts", "temperatureStats"]
    const agg = {
      criticalAlertsCount: 0,
      systemModesCounts: {
        regenMode: 0,
        ascMode: 0,
        hillHold: 0,
        limp: 0,
        idleShutdown: 0,
      },
      temperatureStats: {
        minMotorTemp: null,
        maxMotorTemp: null,
        minControllerTemp: null,
        maxControllerTemp: null,
      },
    }

    Object.values(reports).forEach((report) => {
      agg.criticalAlertsCount += report.criticalAlertsCount || 0
      Object.entries(report.systemModesCounts || {}).forEach(([key, val]) => {
        agg.systemModesCounts[key] += val || 0
      })
      const tempStats = report.temperatureStats || {}
      agg.temperatureStats.minMotorTemp =
        agg.temperatureStats.minMotorTemp === null
          ? tempStats.minMotorTemp
          : Math.min(agg.temperatureStats.minMotorTemp, tempStats.minMotorTemp)
      agg.temperatureStats.maxMotorTemp =
        agg.temperatureStats.maxMotorTemp === null
          ? tempStats.maxMotorTemp
          : Math.max(agg.temperatureStats.maxMotorTemp, tempStats.maxMotorTemp)
      agg.temperatureStats.minControllerTemp =
        agg.temperatureStats.minControllerTemp === null
          ? tempStats.minControllerTemp
          : Math.min(agg.temperatureStats.minControllerTemp, tempStats.minControllerTemp)
      agg.temperatureStats.maxControllerTemp =
        agg.temperatureStats.maxControllerTemp === null
          ? tempStats.maxControllerTemp
          : Math.max(agg.temperatureStats.maxControllerTemp, tempStats.maxControllerTemp)
    })

    return agg
  }

  const displayReport = dateRange.start && dateRange.end ? aggregateRangeReport(reportData) : reportData

  // Prepare data for charts
  const temperatureChartData = useMemo(() => {
    if (!displayReport) return null
    return {
      labels: ["Min Motor Temp", "Max Motor Temp", "Min Controller Temp", "Max Controller Temp"],
      datasets: [
        {
          label: "Temperature (°C)",
          data: [
            displayReport.temperatureStats.minMotorTemp || 0,
            displayReport.temperatureStats.maxMotorTemp || 0,
            displayReport.temperatureStats.minControllerTemp || 0,
            displayReport.temperatureStats.maxControllerTemp || 0,
          ],
          backgroundColor: ["#f97316", "#f97316", "#fcd34d", "#fcd34d"],
        },
      ],
    }
  }, [displayReport])

  const systemModesChartData = useMemo(() => {
    if (!displayReport) return null
    return {
      labels: ["Regen Mode", "ASC Mode", "Hill Hold", "Limp Mode", "Idle Shutdown"],
      datasets: [
        {
          label: "Count",
          data: [
            displayReport.systemModesCounts.regenMode,
            displayReport.systemModesCounts.ascMode,
            displayReport.systemModesCounts.hillHold,
            displayReport.systemModesCounts.limp,
            displayReport.systemModesCounts.idleShutdown,
          ],
          backgroundColor: ["#22c55e", "#22c55e", "#22c55e", "#ef4444", "#22c55e"],
        },
      ],
    }
  }, [displayReport])

  return (
    <div className="reports-section">
      <div className="header-row">
        <h2>Report</h2>
        <div className="filters">
          <label>
            Select Date:{" "}
            <input type="date" value={selectedDate} onChange={handleDateChange} max={new Date().toISOString().slice(0, 10)} />
          </label>
          <label>
            Or Select Date Range:{" "}
            <input type="date" value={dateRange.start || ""} onChange={handleRangeStartChange} max={new Date().toISOString().slice(0, 10)} />
            {" - "}
            <input type="date" value={dateRange.end || ""} onChange={handleRangeEndChange} max={new Date().toISOString().slice(0, 10)} />
          </label>
        </div>
      </div>

      {displayReport ? (
        <div className="report-cards-container">
          <MetricCard
            icon={<AlertCircle size={24} color="white" />}
            title="Critical Alerts"
            value={<AnimatedCounter value={displayReport.criticalAlertsCount} />}
          />
          <MetricCard
            icon={<BarChart2 size={24} color="#22c55e" />}
            title="Regen Mode"
            value={<AnimatedCounter value={displayReport.systemModesCounts.regenMode} />}
          />
          <MetricCard
            icon={<TrendingUp size={24} color="#22c55e" />}
            title="ASC Mode"
            value={<AnimatedCounter value={displayReport.systemModesCounts.ascMode} />}
          />
          <MetricCard
            icon={<Activity size={24} color="#22c55e" />}
            title="Hill Hold Mode"
            value={<AnimatedCounter value={displayReport.systemModesCounts.hillHold} />}
          />
          <MetricCard
            icon={<AlertTriangle size={24} color="#ef4444" />}
            title="Limp Mode"
            value={<AnimatedCounter value={displayReport.systemModesCounts.limp} />}
          />
          <MetricCard
            icon={<ChevronDown size={24} color="#22c55e" />}
            title="Idle Shutdown"
            value={<AnimatedCounter value={displayReport.systemModesCounts.idleShutdown} />}
          />
          <div className="temperature-charts">
            <div className="chart-card">
              <h3>Temperature Stats (°C)</h3>
              <Chart type="bar" data={temperatureChartData} />
            </div>
            <div className="chart-card">
              <h3>System Modes Counts</h3>
              <Chart type="bar" data={systemModesChartData} />
            </div>
          </div>
        </div>
      ) : (
        <div className="no-report">No report data available for the selected date or range.</div>
      )}
    </div>
  )
}
