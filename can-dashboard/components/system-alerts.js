"use client"

import { useState, useEffect } from "react"
import { useData } from "./data-context"
import { AlertTriangle, CheckCircle, XCircle, Bell, BellOff, Thermometer, Zap, Activity } from "lucide-react"

export default function SystemAlerts() {
  const { currentData, history } = useData()
  const [alerts, setAlerts] = useState([])
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [showAllAlerts, setShowAllAlerts] = useState(false)

  useEffect(() => {
    if (!currentData.temp616 || !currentData.measurement617 || !currentData.status615) return

    const newAlerts = []
    const timestamp = new Date().toLocaleString()

    // Temperature alerts
    if (currentData.temp616.MtrTemp > 70) {
      newAlerts.push({
        id: `motor-temp-${Date.now()}`,
        type: "critical",
        category: "Temperature",
        message: `Motor temperature critical: ${currentData.temp616.MtrTemp.toFixed(1)}°C`,
        timestamp,
        icon: Thermometer,
        value: currentData.temp616.MtrTemp,
        threshold: 70,
      })
    }

    // Voltage alerts
    if (currentData.measurement617.DcBusVolt > 450) {
      newAlerts.push({
        id: `voltage-${Date.now()}`,
        type: "critical",
        category: "Electrical",
        message: `DC Bus voltage overvoltage: ${currentData.measurement617.DcBusVolt.toFixed(1)}V`,
        timestamp,
        icon: Zap,
        value: currentData.measurement617.DcBusVolt,
        threshold: 450,
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
        icon: AlertTriangle,
        value: "ACTIVE",
        threshold: "OFF",
      })
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50)) // Keep last 50 alerts
    }
  }, [currentData])

  const clearAlerts = () => {
    setAlerts([])
  }

  const criticalAlerts = alerts.filter((alert) => alert.type === "critical")

  const displayedAlerts = showAllAlerts ? criticalAlerts : criticalAlerts.slice(0, 5)

  return (
    <div className="system-alerts">
      <div className="alerts-header">
        <div className="alerts-title">
          <Bell size={20} />
          <h3>System Alerts</h3>
          <div className="alert-counts">
            {criticalAlerts.length > 0 && <span className="alert-badge critical">{criticalAlerts.length}</span>}
          </div>
        </div>

        <div className="alerts-controls">
          <button
            className={`alert-toggle ${alertsEnabled ? "enabled" : "disabled"}`}
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            {alertsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>

          {criticalAlerts.length > 0 && (
            <button className="clear-alerts" onClick={clearAlerts}>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="alerts-summary">
        <div className="summary-card critical">
          <XCircle size={16} />
          <span className="summary-count">{criticalAlerts.length}</span>
          <span className="summary-label">Critical</span>
        </div>
      </div>

      {alertsEnabled && (
        <div className="alerts-list">
          {displayedAlerts.length === 0 ? (
            <div className="no-alerts">
              <CheckCircle size={24} />
              <span>All systems operating normally</span>
            </div>
          ) : (
            displayedAlerts.map((alert) => {
              const IconComponent = alert.icon
              return (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    <IconComponent size={18} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-category">{alert.category}</span>
                      <span className="alert-time">{alert.timestamp}</span>
                    </div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-details">
                      <span>Current: {typeof alert.value === "number" ? alert.value.toFixed(2) : alert.value}</span>
                      <span>
                        Threshold: {typeof alert.threshold === "number" ? alert.threshold.toFixed(2) : alert.threshold}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {criticalAlerts.length > 5 && (
            <button className="show-more-alerts" onClick={() => setShowAllAlerts(!showAllAlerts)}>
              {showAllAlerts ? `Show Less` : `Show All ${criticalAlerts.length} Alerts`}
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .system-alerts {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .alerts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .alerts-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22c55e;
        }

        .alerts-title h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .alert-counts {
          display: flex;
          gap: 0.5rem;
        }

        .alert-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .alert-badge.critical {
          background: #ef4444;
        }

        .alert-badge.warning {
          background: #f59e0b;
        }

        .alert-badge.info {
          background: #22c55e;
        }

        .alerts-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .alert-toggle {
          padding: 0.5rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .alert-toggle.enabled {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.5);
        }

        .alert-toggle.disabled {
          color: #6b7280;
          opacity: 0.7;
        }

        .clear-alerts {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .clear-alerts:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .alerts-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .summary-card.critical {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .summary-card.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .summary-card.info {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .summary-count {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .summary-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .no-alerts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          color: #22c55e;
          font-weight: 500;
        }

        .alert-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid;
          transition: all 0.3s ease;
        }

        .alert-item.critical {
          background: rgba(239, 68, 68, 0.05);
          border-left-color: #ef4444;
        }

        .alert-item.warning {
          background: rgba(245, 158, 11, 0.05);
          border-left-color: #f59e0b;
        }

        .alert-item.info {
          background: rgba(34, 197, 94, 0.05);
          border-left-color: #22c55e;
        }

        .alert-item:hover {
          transform: translateX(4px);
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .alert-item.critical .alert-icon {
          color: #ef4444;
        }

        .alert-item.warning .alert-icon {
          color: #f59e0b;
        }

        .alert-item.info .alert-icon {
          color: #22c55e;
        }

        .alert-content {
          flex: 1;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .alert-category {
          font-weight: 600;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .alert-time {
          font-size: 0.7rem;
          opacity: 0.6;
        }

        .alert-message {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .alert-details {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .show-more-alerts {
          padding: 0.75rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          background: rgba(34, 197, 94, 0.05);
          color: #22c55e;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          font-family: inherit;
        }

        .show-more-alerts:hover {
          background: rgba(34, 197, 94, 0.1);
        }

        @media (max-width: 768px) {
          .alerts-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .alerts-summary {
            grid-template-columns: 1fr;
          }
          
          .alert-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .alert-details {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  )
}
