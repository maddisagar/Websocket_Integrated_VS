"use client"

import { createContext, useContext, useState, useEffect } from "react"

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

export const DataProvider = ({ children }) => {
  const [currentData, setCurrentData] = useState(sampleWebSocketData)
  const [history, setHistory] = useState([sampleWebSocketData])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Replace the placeholder URL below with your actual ESP32 websocket URL
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

    // Add interval to simulate dynamic data update every 1 second if not connected
    const intervalId = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setCurrentData((prevData) => {
          // Create new data with slight random variations for testing
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
          // Convert string values back to numbers
          newData.temp616 = Object.fromEntries(
            Object.entries(newData.temp616).map(([k, v]) => [k, parseFloat(v)])
          )
          newData.measurement617 = Object.fromEntries(
            Object.entries(newData.measurement617).map(([k, v]) => [k, parseFloat(v)])
          )
          // Update history with new data, keep max 100 entries
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

  return (
    <DataContext.Provider
      value={{
        currentData,
        history,
        isConnected,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
