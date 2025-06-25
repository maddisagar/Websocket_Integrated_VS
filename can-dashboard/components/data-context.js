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

function calculateAlerts(currentData) {
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
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const websocketUrl = "ws://your-esp32-websocket-url"

    const ws = new WebSocket(websocketUrl)

    ws.onopen = () => {
      setIsConnected(true)
      console.log("WebSocket connected to", websocketUrl)
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
      console.log("WebSocket disconnected")
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    const intervalId = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setCurrentData((prevData) => {
          const newData = {
            ...prevData,
            timestamp: new Date().toISOString(),
            status615: Object.fromEntries(
              Object.entries(prevData.status615).map(([key, value]) => [
                key,
                Math.random() > 0.5 ? !value : value,
              ])
            ),
            temp616: {
              CtlrTemp1: (prevData.temp616.CtlrTemp1 + (Math.random() * 2 - 1)).toFixed(1),
              CtlrTemp2: (prevData.temp616.CtlrTemp2 + (Math.random() * 2 - 1)).toFixed(1),
              CtlrTemp: (prevData.temp616.CtlrTemp + (Math.random() * 2 - 1)).toFixed(1),
              MtrTemp: (prevData.temp616.MtrTemp + (Math.random() * 2 - 1)).toFixed(1),
            },
            measurement617: {
              AcCurrMeaRms: (prevData.measurement617.AcCurrMeaRms + (Math.random() * 2 - 1)).toFixed(1),
              DcCurrEstd: (prevData.measurement617.DcCurrEstd + (Math.random() * 2 - 1)).toFixed(1),
              DcBusVolt: (prevData.measurement617.DcBusVolt + (Math.random() * 2 - 1)).toFixed(1),
              Mtrspd: Math.min(Math.max(prevData.measurement617.Mtrspd + Math.floor(Math.random() * 21 - 10), 0), 3000),
              ThrotVolt: (prevData.measurement617.ThrotVolt + (Math.random() * 0.2 - 0.1)).toFixed(1),
            },
          }
          newData.temp616 = Object.fromEntries(
            Object.entries(newData.temp616).map(([k, v]) => [k, parseFloat(v)])
          )
          newData.measurement617 = Object.fromEntries(
            Object.entries(newData.measurement617).map(([k, v]) => [k, parseFloat(v)])
          )
          setHistory((prevHistory) => {
            const updated = [...prevHistory, newData]
            return updated.slice(-100)
          })
          return newData
        })
      }
    }, 1000)

    return () => {
      ws.close()
      clearInterval(intervalId)
    }
  }, [])

  const alerts = useMemo(() => calculateAlerts(currentData), [currentData])

  return (
    <DataContext.Provider
      value={{
        currentData,
        history,
        isConnected,
        alerts,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
