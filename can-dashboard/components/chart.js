"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"

const Chart = forwardRef(function Chart({ data, metric, metrics, height = 200, overlay = false, darkMode = true }, ref) {
  const canvasRef = useRef(null)
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: "" })
  const [isMobile, setIsMobile] = useState(false)

  useImperativeHandle(ref, () => ({
    canvasRef: canvasRef.current,
  }))

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get metrics to draw
    const metricsToRender = overlay ? metrics : (metrics || [metric])
    if (!metricsToRender || metricsToRender.length === 0) return

    // Prepare data points
    const dataPoints = data.slice(-50).map((item, index) => {
      const values = {}
      metricsToRender.forEach((m) => {
        const value = item && item[m.category] && typeof item[m.category] === "object" && m.key in item[m.category] ? item[m.category][m.key] : 0
        values[m.key] = typeof value === "boolean" ? (value ? 1 : 0) : value || 0
      })
      return { index, timestamp: item.timestamp, ...values }
    })

    if (dataPoints.length === 0) return

    // Calculate scales
    const xScale = chartWidth / Math.max(dataPoints.length - 1, 1)

    metricsToRender.forEach((currentMetric, metricIndex) => {
      const values = dataPoints.map((d) => d[currentMetric.key])
      const minValue = Math.min(...values)
      const maxValue = Math.max(...values)
      const range = maxValue - minValue || 1
      const yScale = chartHeight / range

      // Draw grid (only for first metric to avoid overlap)
      if (metricIndex === 0) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 1

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + (chartHeight / 5) * i
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(padding.left + chartWidth, y)
          ctx.stroke()
        }

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
          const x = padding.left + (chartWidth / 10) * i
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, padding.top + chartHeight)
          ctx.stroke()
        }
      }

      // Draw line
      ctx.strokeStyle = currentMetric.color
      ctx.lineWidth = 2
      ctx.beginPath()

      dataPoints.forEach((point, index) => {
        const x = padding.left + index * xScale
        const y = padding.top + chartHeight - (point[currentMetric.key] - minValue) * yScale

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      ctx.fillStyle = currentMetric.color
      dataPoints.forEach((point, index) => {
        const x = padding.left + index * xScale
        const y = padding.top + chartHeight - (point[currentMetric.key] - minValue) * yScale

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Draw labels (only for single metric)
      if (!overlay) {
        ctx.fillStyle = "#f1f5f9"
        ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
          const value = minValue + (range / 5) * (5 - i)
          const y = padding.top + (chartHeight / 5) * i
          ctx.fillText(value.toFixed(1), 5, y + 4)
        }

        // Title and Unit on same line with bold and improved styling
        ctx.font =
          "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        ctx.fillStyle = currentMetric.color
        ctx.fillText(currentMetric.label, padding.left, 14)

        if (currentMetric.unit) {
          const labelWidth = ctx.measureText(currentMetric.label).width
          ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          ctx.fillStyle = darkMode ? "rgba(241, 245, 249, 1)" : "#334155" // white for dark mode, dark slate gray for light mode
          ctx.shadowColor = darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.3)" // subtle dark shadow for light mode
          ctx.shadowBlur = 2
          ctx.fillText(currentMetric.unit, padding.left + labelWidth + 10, 14) // same baseline, small gap
          ctx.shadowBlur = 0
        }
      }
    })

    // Legend for overlay mode
    if (overlay && metricsToRender.length > 1) {
      const legendY = 15
      metricsToRender.forEach((m, index) => {
        ctx.fillStyle = m.color
        ctx.fillRect(padding.left + index * 120, legendY - 10, 10, 10)
        ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        ctx.fillText(m.label, padding.left + index * 120 + 15, legendY)
      })
    }
  }, [data, metric, metrics, overlay])

  const handleMouseMove = (e) => {
    if (isMobile) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const containerRect = canvas.parentElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right

    if (x >= padding.left && x <= padding.left + chartWidth && data.length > 0) {
      const dataIndex = Math.round((x - padding.left) / (chartWidth / Math.max(data.slice(-50).length - 1, 1)))
      const dataPoint = data.slice(-50)[dataIndex]

      if (dataPoint) {
        const metricsToShow = overlay ? metrics : [metric]
        const content = metricsToShow
          .map((m) => {
            const value = dataPoint[m.category] ? dataPoint[m.category][m.key] : 0
            const displayValue = typeof value === "boolean" ? (value ? "ON" : "OFF") : value.toFixed(2)
            return `${m.label}: ${displayValue} ${m.unit || ""}`
          })
          .join("\n")

        // Calculate tooltip position relative to container and clamp within viewport
        let tooltipX = e.clientX - containerRect.left
        let tooltipY = e.clientY - containerRect.top - 10

        // Clamp tooltipX within container width
        tooltipX = Math.min(Math.max(tooltipX, 0), containerRect.width)
        // Clamp tooltipY within container height
        tooltipY = Math.min(Math.max(tooltipY, 0), containerRect.height)

        setTooltip({
          show: true,
          x: tooltipX,
          y: tooltipY,
          content,
        })
      }
    } else {
      setTooltip({ show: false, x: 0, y: 0, content: "" })
    }
  }

  const handleTouchStart = (e) => {
    if (!isMobile) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right

    if (x >= padding.left && x <= padding.left + chartWidth && data.length > 0) {
      const dataIndex = Math.round((x - padding.left) / (chartWidth / Math.max(data.slice(-50).length - 1, 1)))
      const dataPoint = data.slice(-50)[dataIndex]

      if (dataPoint) {
        const metricsToShow = overlay ? metrics : [metric]
        const content = metricsToShow
          .map((m) => {
            const value = dataPoint[m.category] ? dataPoint[m.category][m.key] : 0
            const displayValue = typeof value === "boolean" ? (value ? "ON" : "OFF") : value.toFixed(2)
            return `${m.label}: ${displayValue} ${m.unit || ""}`
          })
          .join("\n")

        setTooltip({
          show: true,
          x: touch.clientX,
          y: touch.clientY - 100,
          content,
        })

        setTimeout(() => {
          setTooltip({ show: false, x: 0, y: 0, content: "" })
        }, 3000)
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
  }, [height])

  return (
    <div className="chart-container">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: height + "px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, content: "" })}
        onTouchStart={handleTouchStart}
      />

      {tooltip.show && (
      <div
        className="tooltip"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          position: "absolute",
          zIndex: 1000,
        }}
      >
        {tooltip.content.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      )}

      <style jsx>{`
        .chart-container {
          position: relative;
          width: 100%;
          height: ${height}px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        canvas {
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }

        .tooltip {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          pointer-events: none;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          transform: translate(-50%, -100%);
          margin-top: -10px;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          canvas {
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  )
})

export default Chart
