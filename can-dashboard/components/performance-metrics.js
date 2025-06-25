"use client"

import { useData } from "./data-context"
import { TrendingUp, TrendingDown, Minus, Gauge, Thermometer, Zap, Activity } from "lucide-react"

export default function PerformanceMetrics() {
  const { currentData, history } = useData()

  if (!currentData.measurement617 || !currentData.temp616) return null

  // Calculate alerts count similar to system-alerts.js logic
  const alertsCount = (() => {
    if (!currentData.temp616 || !currentData.measurement617 || !currentData.status615) return 0

    let newAlerts = []

    const timestamp = new Date().toLocaleString()

    // Temperature alerts
    if (currentData.temp616.MtrTemp > 70) {
      newAlerts.push({
        id: `motor-temp-${Date.now()}`,
        type: "critical",
        category: "Temperature",
        message: `Motor temperature critical: ${currentData.temp616.MtrTemp.toFixed(1)}°C`,
        timestamp,
        value: currentData.temp616.MtrTemp,
        threshold: 70,
      })
    }

    if (currentData.temp616.CtlrTemp1 > 65) {
      newAlerts.push({
        id: `controller-temp1-${Date.now()}`,
        type: "warning",
        category: "Temperature",
        message: `Controller temperature high: ${currentData.temp616.CtlrTemp1.toFixed(1)}°C`,
        timestamp,
        value: currentData.temp616.CtlrTemp1,
        threshold: 65,
      })
    }

    if (currentData.temp616.CtlrTemp2 > 65) {
      newAlerts.push({
        id: `controller-temp2-${Date.now()}`,
        type: "warning",
        category: "Temperature",
        message: `Controller temperature high: ${currentData.temp616.CtlrTemp2.toFixed(1)}°C`,
        timestamp,
        value: currentData.temp616.CtlrTemp2,
        threshold: 65,
      })
    }

    // Voltage alerts
    if (currentData.measurement617.DcBusVolt > 450 || currentData.measurement617.DcBusVolt < 250) {
      if (currentData.measurement617.DcBusVolt > 450) {
        newAlerts.push({
          id: `voltage-${Date.now()}`,
          type: "critical",
          category: "Electrical",
          message: `DC Bus voltage overvoltage: ${currentData.measurement617.DcBusVolt.toFixed(1)}V`,
          timestamp,
          value: currentData.measurement617.DcBusVolt,
          threshold: 450,
        })
      } else {
        newAlerts.push({
          id: `voltage-${Date.now()}`,
          type: "warning",
          category: "Electrical",
          message: `DC Bus voltage undervoltage: ${currentData.measurement617.DcBusVolt.toFixed(1)}V`,
          timestamp,
          value: currentData.measurement617.DcBusVolt,
          threshold: 250,
        })
      }
    }

    // Current alerts
    if (currentData.measurement617.AcCurrMeaRms > 80) {
      newAlerts.push({
        id: `current-${Date.now()}`,
        type: "warning",
        category: "Electrical",
        message: `AC Current high: ${currentData.measurement617.AcCurrMeaRms.toFixed(1)}A`,
        timestamp,
        value: currentData.measurement617.AcCurrMeaRms,
        threshold: 80,
      })
    }

    // System status alerts
    if (currentData.status615.LimpHomeMode) {
      newAlerts.push({
        id: `limp-mode-${Date.now()}`,
        type: "critical",
        category: "System",
        message: "Vehicle in Limp Home Mode",
        timestamp,
        value: "ACTIVE",
        threshold: "OFF",
      })
    }

    // Sensor health alerts
    const sensorHealthIssues = Object.entries(currentData.status615)
      .filter(([key, value]) => key.startsWith("SnsrHealthStatus") && !value)
      .map(([key]) => key.replace("SnsrHealthStatus", ""))

    if (sensorHealthIssues.length > 0) {
      newAlerts.push({
        id: `sensor-health-${Date.now()}`,
        type: "warning",
        category: "Sensors",
        message: `Sensor health issues: ${sensorHealthIssues.join(", ")}`,
        timestamp,
        value: sensorHealthIssues.length,
        threshold: 0,
      })
    }

    // Count all alerts
    return newAlerts.length
  })()

  const calculateTrend = (key, category) => {
    if (history.length < 2) return 0

    const recent = history.slice(-5)
    const values = recent.map((item) => (item[category] ? item[category][key] : 0))

    if (values.length < 2) return 0

    const firstValue = values[0]
    const lastValue = values[values.length - 1]

    return ((lastValue - firstValue) / firstValue) * 100
  }

  const getEfficiencyScore = () => {
    const motorTemp = currentData.temp616.MtrTemp
    const voltage = currentData.measurement617.DcBusVolt
    const current = currentData.measurement617.AcCurrMeaRms
    const speed = currentData.measurement617.Mtrspd

    let score = 100

    // Temperature efficiency
    if (motorTemp > 60) score -= 20
    else if (motorTemp > 40) score -= 10

    // Voltage efficiency
    if (voltage < 300 || voltage > 400) score -= 15

    // Current efficiency
    if (current > 70) score -= 15

    // Speed efficiency
    if (speed > 2500) score -= 10

    return Math.max(0, score)
  }

  const getPowerConsumption = () => {
    const voltage = currentData.measurement617.DcBusVolt
    const current = currentData.measurement617.DcCurrEstd
    return (voltage * current) / 1000 // kW
  }

  const metrics = [
    {
      title: "Motor Speed",
      value: currentData.measurement617.Mtrspd,
      unit: "RPM",
      trend: calculateTrend("Mtrspd", "measurement617"),
      icon: Gauge,
      color: "#8b5cf6",
      max: 3000,
    },
    {
      title: "DC Bus Voltage",
      value: currentData.measurement617.DcBusVolt,
      unit: "V",
      trend: calculateTrend("DcBusVolt", "measurement617"),
      icon: Zap,
      color: "#f59e0b",
      max: 500,
    },
    {
      title: "AC Current RMS",
      value: currentData.measurement617.AcCurrMeaRms,
      unit: "A",
      trend: calculateTrend("AcCurrMeaRms", "measurement617"),
      icon: Activity,
      color: "#22c55e",
      max: 100,
    },
    {
      title: "Motor Temperature",
      value: currentData.temp616.MtrTemp,
      unit: "°C",
      trend: calculateTrend("MtrTemp", "temp616"),
      icon: Thermometer,
      color: "#ef4444",
      max: 100,
    },
  ]

  const getTrendIcon = (trend) => {
    if (trend > 1) return TrendingUp
    if (trend < -1) return TrendingDown
    return Minus
  }

  const getTrendColor = (trend) => {
    if (trend > 1) return "#22c55e"
    if (trend < -1) return "#ef4444"
    return "#6b7280"
  }

  const efficiencyScore = getEfficiencyScore()
  const powerConsumption = getPowerConsumption()

  return (
    <div className="performance-metrics">
      <div className="metrics-header">
        <h3>Performance Metrics</h3>
        <div className="overall-stats">
          <div className="stat-item">
            <span className="stat-label">Efficiency</span>
            <span
              className={`stat-value ${efficiencyScore > 80 ? "good" : efficiencyScore > 60 ? "warning" : "critical"}`}
            >
              {efficiencyScore.toFixed(0)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Power</span>
            <span className="stat-value">{powerConsumption.toFixed(2)} kW</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Alerts</span>
            <span className="stat-value critical">{alertsCount}</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend)
          const trendColor = getTrendColor(metric.trend)
          const IconComponent = metric.icon
          const percentage = (metric.value / metric.max) * 100

          return (
            <div key={metric.title} className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ color: metric.color }}>
                  <IconComponent size={20} />
                </div>
                <div className="metric-trend" style={{ color: trendColor }}>
                  <TrendIcon size={16} />
                  <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                </div>
              </div>

              <div className="metric-content">
                <h4>{metric.title}</h4>
                <div className="metric-value">
                  <span className="value">{metric.value.toFixed(1)}</span>
                  <span className="unit">{metric.unit}</span>
                </div>

                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: metric.color,
                    }}
                  ></div>
                </div>

                <div className="metric-range">
                  <span>0</span>
                  <span>{metric.max}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .performance-metrics {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .metrics-header h3 {
          margin: 0;
          color: #22c55e;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .overall-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .stat-value.good {
          color: #22c55e;
        }

        .stat-value.warning {
          color: #f59e0b;
        }

        .stat-value.critical {
          color: #ef4444;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .metric-icon {
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .metric-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .metric-value {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .metric-value .value {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .metric-value .unit {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .metric-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .metric-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .metric-range {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .metrics-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .overall-stats {
            justify-content: center;
            gap: 1rem;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
