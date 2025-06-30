import { useState, useEffect, useRef } from "react"
import { useData } from "./data-context"
import Header from "./header"
import GraphContainer from "./graph-container"
import HistoryView from "./history-view"
import dynamic from "next/dynamic"
import React, { Suspense } from "react"

const ReportsSection = dynamic(() => import("./reports-section.jsx"), { ssr: false })
import { Activity, BarChart3, Grid3X3 } from "lucide-react"
import SystemAlerts from "./system-alerts"
import PerformanceMetrics from "./performance-metrics"
import EnhancedStatusCards from "./enhanced-status-cards"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, graphs, history, reports
  const [dashboardTab, setDashboardTab] = useState("performance") // performance, vehicleControl, driveModes, safetySystems, systemControl, sensor, temperature

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("currentView")
      if (savedView) {
        setCurrentView(savedView)
      }
    }
  }, [])
  const [graphMode, setGraphMode] = useState("individual") // individual, overlay, quad
  const { isConnected } = useData()

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: false },
      duration: 2.0,
      ease: "power4.out",
      overwrite: "auto",
    })

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    })
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentView", currentView)
    }
  }, [currentView])

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Header
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        isConnected={isConnected}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="main-content" style={{ padding: "1rem 2rem" }}>
        {currentView === "dashboard" && (
          <>
            <div className="dashboard-tabs">
              <button
                className={`tab-btn ${dashboardTab === "performance" ? "active" : ""}`}
                onClick={() => setDashboardTab("performance")}
              >
                Performance Metrics
              </button>
              <button
                className={`tab-btn ${dashboardTab === "vehicle" ? "active" : ""}`}
                onClick={() => setDashboardTab("vehicle")}
              >
              Vehicle Control & Drive Modes
              </button>
              <button
                className={`tab-btn ${dashboardTab === "sensor" ? "active" : ""}`}
                onClick={() => setDashboardTab("sensor")}
              >
                Sensor Health Status
              </button>
            <button
              className={`tab-btn ${dashboardTab === "temperature" ? "active" : ""}`}
              onClick={() => setDashboardTab("temperature")}
            >
              Temperature Monitoring
            </button>
            <button
              className={`tab-btn ${dashboardTab === "alerts" ? "active" : ""}`}
              onClick={() => setDashboardTab("alerts")}
            >
              System Alerts
            </button>
          </div>

          {dashboardTab === "performance" && <PerformanceMetrics />}
          {dashboardTab === "vehicle" && <EnhancedStatusCards showOnlyStatusGroups={true} />}
          {dashboardTab === "sensor" && <EnhancedStatusCards showOnlySensorHealth={true} />}
          {dashboardTab === "temperature" && <EnhancedStatusCards showOnlyTemperature={true} />}
          {dashboardTab === "alerts" && <SystemAlerts />}
        </>
        )}

        {currentView === "graphs" && (
          <>
            <div className="graph-controls">
              <button
                className={`control-btn ${graphMode === "individual" ? "active" : ""}`}
                onClick={() => setGraphMode("individual")}
              >
                <BarChart3 size={16} />
                Individual
              </button>
              <button
                className={`control-btn ${graphMode === "overlay" ? "active" : ""}`}
                onClick={() => setGraphMode("overlay")}
              >
                <Activity size={16} />
                Overlay
              </button>
              <button
                className={`control-btn ${graphMode === "quad" ? "active" : ""}`}
                onClick={() => setGraphMode("quad")}
              >
                <Grid3X3 size={16} />
                Quad View
              </button>
            </div>
            <GraphContainer mode={graphMode} darkMode={darkMode} />
          </>
        )}

        {currentView === "history" && <HistoryView />}

        {currentView === "reports" && (
          <Suspense fallback={<div>Loading report section...</div>}>
            <ReportsSection />
          </Suspense>
        )}
      </main>

      <style jsx>{`
        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          background: rgb(247, 249, 248);
          border: 1px solid rgb(0, 0, 0);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          background: rgba(34, 197, 94, 0.2);
        }

        .tab-btn.active {
          background: #22c55e;
          color: white;
        }
      `}</style>
    </div>
  )
}
