import { useState, useEffect, useRef } from "react"
import { useData } from "./data-context"
import Header from "./header"
import GraphContainer from "./graph-container"
import HistoryView from "./history-view"
import ReportsSection from "./reports-section"
import { Activity, BarChart3, Grid3X3 } from "lucide-react"
import SystemAlerts from "./system-alerts"
import PerformanceMetrics from "./performance-metrics"
import EnhancedStatusCards from "./enhanced-status-cards"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, graphs, history, reports
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
            <PerformanceMetrics />
            <SystemAlerts />
            <EnhancedStatusCards />
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

        {currentView === "graphs" && <GraphContainer mode="individual" fullView={true} />}

        {currentView === "history" && <HistoryView />}

        {currentView === "reports" && <ReportsSection />}
      </main>
    </div>
  )
}
