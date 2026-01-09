import { useState } from 'react'

export default function WeightSlider({ value, onChange, disabled = false, showPercentage = false, showInput = true }) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value)
    onChange(val)
    setInputValue(val.toString())
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    
    if (val === '') return
    
    const numVal = parseInt(val)
    if (!isNaN(numVal)) {
      const clampedVal = Math.min(100, Math.max(0, numVal))
      onChange(clampedVal)
    }
  }

  const handleBlur = () => {
    if (inputValue === '' || isNaN(parseInt(inputValue))) {
      setInputValue(value.toString())
    }
  }

  const increment = () => {
    const newVal = Math.min(100, value + 1)
    onChange(newVal)
    setInputValue(newVal.toString())
  }

  const decrement = () => {
    const newVal = Math.max(0, value - 1)
    onChange(newVal)
    setInputValue(newVal.toString())
  }

  return (
    <div className="flex items-center space-x-4 w-full">
      <button
        onClick={decrement}
        disabled={disabled || value <= 0}
        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <span className="text-lg font-bold">−</span>
      </button>
      
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:dark:bg-blue-400 [&::-webkit-slider-thumb]:cursor-grab"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
      
      {showInput && (
        <div className="relative w-20">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-center font-mono"
          />
          {showPercentage && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          )}
        </div>
      )}
      
      <button
        onClick={increment}
        disabled={disabled || value >= 100}
        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <span className="text-lg font-bold">+</span>
      </button>
    </div>
  )
}