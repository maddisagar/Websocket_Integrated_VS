"use client"

import { Sun, Moon, Activity, BarChart3, BarChart2, History, Wifi, WifiOff, Menu } from 'lucide-react'
import { useState } from "react"

export default function Header({ darkMode, toggleTheme, isConnected, currentView, setCurrentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <Activity size={32} />
            </div>
            <div className="title-section">
              <h1>CAN Dashboard</h1>
              <div className="connection-status">
                {isConnected ? (
                  <>
                    <Wifi size={16} />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={16} />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <nav className="nav-section desktop-nav">
            <button
              className={`nav-btn ${currentView === "dashboard" ? "active" : ""}`}
              onClick={() => setCurrentView("dashboard")}
            >
              <Activity size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-btn ${currentView === "graphs" ? "active" : ""}`}
              onClick={() => setCurrentView("graphs")}
            >
              <BarChart3 size={18} />
              <span>Graphs</span>
            </button>
            <button
              className={`nav-btn ${currentView === "history" ? "active" : ""}`}
              onClick={() => setCurrentView("history")}
            >
              <History size={18} />
              <span>History</span>
            </button>
            <button
              className={`nav-btn ${currentView === "reports" ? "active" : ""}`}
              onClick={() => setCurrentView("reports")}
            >
              <BarChart2 size={18} />
              <span>Reports</span>
            </button>
          </nav>

          <div className="header-actions">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={20} />
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <button
              className={`mobile-nav-btn ${currentView === "dashboard" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("dashboard")
                setMobileMenuOpen(false)
              }}
            >
              <Activity size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`mobile-nav-btn ${currentView === "graphs" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("graphs")
                setMobileMenuOpen(false)
              }}
            >
              <BarChart3 size={18} />
              <span>Graphs</span>
            </button>
            <button
              className={`mobile-nav-btn ${currentView === "history" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("history")
                setMobileMenuOpen(false)
              }}
            >
              <History size={18} />
              <span>History</span>
            </button>
            <button
              className={`mobile-nav-btn ${currentView === "reports" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("reports")
                setMobileMenuOpen(false)
              }}
            >
              <BarChart2 size={18} />
              <span>Reports</span>
            </button>
          </div>
        )}
      </header>

      <style jsx>{`
        .header {
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
        }

        .title-section h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          opacity: 0.8;
        }

        .desktop-nav {
          display: flex;
          gap: 0.5rem;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          color: inherit;
          font-family: inherit;
        }

        .nav-btn:hover {
          background: rgba(34, 197, 94, 0.1);
          transform: translateY(-1px);
        }

        .nav-btn.active {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-menu-btn {
          display: none;
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 12px;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          cursor: pointer;
          transition: all 0.3s ease;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .theme-toggle {
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 12px;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .theme-toggle:hover, .mobile-menu-btn:hover {
          background: rgba(34, 197, 94, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
        }

        .mobile-nav {
          display: none;
          flex-direction: column;
          padding: 1rem;
          border-top: 1px solid rgba(34, 197, 94, 0.2);
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
        }

        .mobile-nav-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          color: inherit;
          text-align: left;
          font-family: inherit;
        }

        .mobile-nav-btn:hover {
          background: rgba(34, 197, 94, 0.1);
        }

        .mobile-nav-btn.active {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
          }
          
          .desktop-nav {
            display: none;
          }
          
          .mobile-menu-btn {
            display: flex;
          }
          
          .mobile-nav {
            display: flex;
          }
          
          .title-section h1 {
            font-size: 1.2rem;
          }
          
          .logo {
            width: 40px;
            height: 40px;
          }
          
          .theme-toggle, .mobile-menu-btn {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  )
}
