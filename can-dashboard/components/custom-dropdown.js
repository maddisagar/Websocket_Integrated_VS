"use client"

import { useState, useRef, useEffect } from "react"

export default function CustomDropdown({ options, value, onChange, label, darkMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={`custom-dropdown ${darkMode ? "dark" : "light"}`} ref={dropdownRef}>
      <label className="dropdown-label">{label}</label>
      <button className="dropdown-toggle" onClick={toggleOpen} aria-haspopup="listbox" aria-expanded={isOpen}>
        {options.find((opt) => opt.value === value)?.label || "Select..."}
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu" role="listbox" tabIndex={-1}>
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              className={`dropdown-option ${option.value === value ? "selected" : ""}`}
              onClick={() => handleOptionClick(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleOptionClick(option.value)
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .custom-dropdown {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-family: inherit;
          width: 100%;
          max-width: 300px;
          position: relative;
          user-select: none;
        }

        .dropdown-label {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          color: var(--label-color);
        }

        .dropdown-toggle {
          background: var(--bg-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          appearance: none;
        }

        .dropdown-toggle:focus {
          outline: none;
          border-color: var(--focus-border-color);
          box-shadow: 0 0 0 3px var(--focus-shadow-color);
        }

        .arrow {
          margin-left: 0.5rem;
          font-size: 0.7rem;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-top: 0.25rem;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .dropdown-option {
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-color);
        }

        .dropdown-option:hover,
        .dropdown-option:focus {
          background: var(--hover-bg-color);
          outline: none;
        }

        .dropdown-option.selected {
          background: var(--selected-bg-color);
          font-weight: 700;
        }

        /* Light mode variables */
        .light {
          --bg-color: #f0f9ff;
          --text-color: #0f172a;
          --border-color: #16a34a;
          --focus-border-color: #16a34a;
          --focus-shadow-color: rgba(22, 163, 74, 0.4);
          --hover-bg-color: #d1fae5;
          --selected-bg-color: #a7f3d0;
          --label-color: #166534;
        }

        /* Dark mode variables */
        .dark {
          --bg-color: #0f172a;
          --text-color: #22c55e;
          --border-color: rgba(34, 197, 94, 0.7);
          --focus-border-color: #16a34a;
          --focus-shadow-color: rgba(34, 197, 94, 0.4);
          --hover-bg-color: rgba(34, 197, 94, 0.2);
          --selected-bg-color: rgba(34, 197, 94, 0.4);
          --label-color: #22c55e;
        }
      `}</style>
    </div>
  )
}
