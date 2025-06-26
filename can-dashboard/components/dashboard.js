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

        {currentView === "reports" && <ReportsSection />}
      </main>

      <style jsx>{`
        .graph-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: nowrap;
        }

        .control-btn {
          background: rgba(34, 197, 94, 0.1);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.3s ease;
          white-space: nowrap;
        }

        .control-btn:hover {
          background: rgba(34, 197, 94, 0.2);
        }

        .control-btn.active {
          background: #22c55e;
          color: white;
        }

        @media (max-width: 768px) {
          .graph-controls {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .control-btn {
            flex: 1 1 45%;
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
            white-space: normal;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .graph-controls {
            flex-direction: column;
            gap: 0.25rem;
          }

          .control-btn {
            flex: 1 1 100%;
            padding: 0.3rem 0.6rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}
