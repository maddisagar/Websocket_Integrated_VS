"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

const sampleWebSocketData = {
  timestamp: new Date().toISOString(),
  status615: {
    EcoPost: true,
    LimpHomeMode: false,
    Brake: true,
    Forward: true,
    Reverse: false,
    Neutral: true,
    HillholdMode: false,
    RegeMode: true,
    ThrotMode: false,
    AscMode: true,
    SnsrHealthStatus: true,
    SnsrHealthStatusDcBus: true,
    SnsrHealthStatus12V: true,
    SnsrHealthStatus5V: true,
    SnsrHealthStatusPhBCurr: true,
    SnsrHealthStatusPhCCurr: true,
    SnsrHealthStatusThrot1: true,
    SnsrHealthStatusQep: true,
    SnsrHealthStatusCtlrTemp1: true,
    SnsrHealthStatusMtrTemp: true,
    SnsrHealthStatusThrot2: true,
    SnsrHealthStatusCtlrTemp2: true,
    PcModeEnable: true,
    StartStop: false,
    DcuControlModeStatus: true,
    IdleShutdown: false,
  },
  temp616: {
    CtlrTemp1: 45.3,
    CtlrTemp2: 47.8,
    CtlrTemp: 46.5,
    MtrTemp: 55.2,
  },
  measurement617: {
    AcCurrMeaRms: 65.4,
    DcCurrEstd: 40.2,
    DcBusVolt: 350.7,
    Mtrspd: 1800,
    ThrotVolt: 3.2,
  },
}

export function calculateAlerts(currentData) {
  if (!currentData.temp616 || !currentData.measurement617 || !currentData.status615) return []

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
      value: currentData.temp616.MtrTemp,
      threshold: 70,
    })
  }

  if (currentData.temp616.CtlrTemp1 > 65 || currentData.temp616.CtlrTemp2 > 65) {
    newAlerts.push({
      id: `controller-temp-${Date.now()}`,
      type: "warning",
      category: "Temperature",
      message: `Controller temperature high: ${Math.max(currentData.temp616.CtlrTemp1, currentData.temp616.CtlrTemp2).toFixed(1)}°C`,
      timestamp,
      value: Math.max(currentData.temp616.CtlrTemp1, currentData.temp616.CtlrTemp2),
      threshold: 65,
    })
  }

  // Voltage alerts
  if (currentData.measurement617.DcBusVolt > 450 || currentData.measurement617.DcBusVolt < 250) {
    newAlerts.push({
      id: `voltage-${Date.now()}`,
      type: currentData.measurement617.DcBusVolt > 450 ? "critical" : "warning",
      category: "Electrical",
      message: `DC Bus voltage ${currentData.measurement617.DcBusVolt > 450 ? "overvoltage" : "undervoltage"}: ${currentData.measurement617.DcBusVolt.toFixed(1)}V`,
      timestamp,
      value: currentData.measurement617.DcBusVolt,
      threshold: currentData.measurement617.DcBusVolt > 450 ? 450 : 250,
    })
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

  return newAlerts
}

export const DataProvider = ({ children }) => {
  const [currentData, setCurrentData] = useState(sampleWebSocketData)
  const [history, setHistory] = useState([sampleWebSocketData])
  const [dailyReports, setDailyReports] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dailyReports")
      if (stored) {
        return JSON.parse(stored)
      } else {
        const startDate = new Date("2026-06-20")
        const today = new Date()
        const reports = {}
        for (
          let d = new Date(startDate);
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().slice(0, 10)
          reports[dateStr] = {
            criticalAlertsCount: Math.floor(Math.random() * 50),
            systemModesCounts: {
              regenMode: Math.floor(Math.random() * 100),
              ascMode: Math.floor(Math.random() * 100),
              hillHold: Math.floor(Math.random() * 100),
              limp: Math.floor(Math.random() * 50),
              idleShutdown: Math.floor(Math.random() * 100),
            },
            temperatureStats: {
              minMotorTemp: (Math.random() * 20 + 40).toFixed(1),
              maxMotorTemp: (Math.random() * 20 + 60).toFixed(1),
              minControllerTemp: (Math.random() * 20 + 30).toFixed(1),
              maxControllerTemp: (Math.random() * 20 + 60).toFixed(1),
            },
          }
        }
        return reports
      }
    }
    return {}
  })

  const getReportsByDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const reports = {}
    let currentDate = new Date(startDate)
    const lastDate = new Date(endDate)
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().slice(0, 10)
      if (dailyReports[dateStr]) {
        reports[dateStr] = dailyReports[dateStr]
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return reports
  }
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dailyReports", JSON.stringify(dailyReports))
    }
  }, [dailyReports])

  const aggregateDailyReport = (date) => {
    if (!history || history.length === 0) return null
    const dayData = history.filter((item) => item.timestamp.startsWith(date))
    if (dayData.length === 0) return null

    const criticalAlertsCount = dayData.reduce((count, item) => {
      return count + (item.status615?.LimpHomeMode ? 1 : 0)
    }, 0)

    const systemModesCounts = {
      regenMode: dayData.reduce((sum, item) => sum + (item.status615?.RegeMode ? 1 : 0), 0),
      ascMode: dayData.reduce((sum, item) => sum + (item.status615?.AscMode ? 1 : 0), 0),
      hillHold: dayData.reduce((sum, item) => sum + (item.status615?.HillholdMode ? 1 : 0), 0),
      limp: dayData.reduce((sum, item) => sum + (item.status615?.LimpHomeMode ? 1 : 0), 0),
      idleShutdown: dayData.reduce((sum, item) => sum + (item.status615?.IdleShutdown ? 1 : 0), 0),
    }

    const motorTemps = dayData.map((item) => item.temp616?.MtrTemp).filter((t) => typeof t === "number")
    const controllerTemps1 = dayData.map((item) => item.temp616?.CtlrTemp1).filter((t) => typeof t === "number")
    const controllerTemps2 = dayData.map((item) => item.temp616?.CtlrTemp2).filter((t) => typeof t === "number")

    const minMotorTemp = motorTemps.length ? Math.min(...motorTemps) : null
    const maxMotorTemp = motorTemps.length ? Math.max(...motorTemps) : null

    const minControllerTemp =
      controllerTemps1.length && controllerTemps2.length
        ? Math.min(Math.min(...controllerTemps1), Math.min(...controllerTemps2))
        : null
    const maxControllerTemp =
      controllerTemps1.length && controllerTemps2.length
        ? Math.max(Math.max(...controllerTemps1), Math.max(...controllerTemps2))
        : null

    return {
      criticalAlertsCount,
      systemModesCounts,
      temperatureStats: {
        minMotorTemp,
        maxMotorTemp,
        minControllerTemp,
        maxControllerTemp,
      },
    }
  }

  useEffect(() => {
    const updateDailyReport = () => {
      const today = new Date().toISOString().slice(0, 10)
      const report = aggregateDailyReport(today)
      if (report) {
        setDailyReports((prev) => ({ ...prev, [today]: report }))
      }
    }

    updateDailyReport()

    const now = new Date()
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()

    const timeoutId = setTimeout(() => {
      updateDailyReport()
      setInterval(updateDailyReport, 24 * 60 * 60 * 1000)
    }, msUntilMidnight)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [history])

  const websocketUrl = "ws://192.168.4.1:81"
  useEffect(() => {
    let ws
    let reconnectInterval = 1000
    let reconnectTimeoutId

    const connect = () => {
      ws = new WebSocket(websocketUrl)

      ws.onopen = () => {
        setIsConnected(true)
        console.log("WebSocket connected to", websocketUrl)
        reconnectInterval = 1000
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setCurrentData(data)
          setHistory((prev) => {
            const updated = [...prev, data]
            return updated.slice(-100)
          })
        } catch (error) {
          console.error("Error parsing websocket data:", error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log("WebSocket disconnected, attempting to reconnect...")
        reconnectTimeoutId = setTimeout(() => {
          reconnectInterval = Math.min(reconnectInterval * 2, 30000)
          connect()
        }, reconnectInterval)
      }

      ws.onerror = (event) => {
        if (event && event.type === "error") {
          console.warn("WebSocket encountered an error event:", event)
        } else {
          console.error("WebSocket error event type:", event.type, "event object:", event)
        }
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId)
    }
  }, [])

  const alerts = useMemo(() => calculateAlerts(currentData), [currentData])

  return (
    <DataContext.Provider
      value={{
        currentData,
        history,
        dailyReports,
        isConnected,
        alerts,
        getReportsByDateRange,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
