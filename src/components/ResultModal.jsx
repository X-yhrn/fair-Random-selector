import { useEffect, useState } from 'react'

/**
 * 结果模态框组件
 * 显示掷骰子的结果，并提供再次操作的选项
 */
export default function ResultModal({ result, onClose, onRollAgain, theme, mode }) {
  const [isAnimating, setIsAnimating] = useState(false)

  // 阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  /**
   * 处理再次掷骰子
   * 触发动画效果后调用父组件的回调
   */
  const handleRollAgain = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      onRollAgain()
    }, 1000)
  }

  /**
   * 处理接受结果
   * 保存结果到历史记录并关闭模态框
   * @param {string} actionType - 操作类型
   */
  const handleAccept = (actionType) => {
    // 保存到历史记录
    const history = JSON.parse(localStorage.getItem('decisionHistory') || '[]')
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      result,
      action: actionType,
      saved: true
    }
    localStorage.setItem('decisionHistory', JSON.stringify([newRecord, ...history]))
    onClose()
  }

  /**
   * 根据当前模式返回描述文本
   * @returns {string} 模式描述
   */
  const getModeDescription = () => {
    switch(mode) {
      case 'fair': return '公平模式：所有选项概率相等'
      case 'preference': return '偏好模式：根据设定权重决定概率'
      case 'fate': return '命运模式：随机分配权重'
      default: return ''
    }
  }

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* 弹窗内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${theme === 'light'
          ? 'bg-gradient-to-b from-white to-blue-50'
          : 'bg-gradient-to-b from-gray-900 to-gray-800'
        }`}>
          {/* 装饰性顶部条 */}
          <div className={`h-2 ${theme === 'light'
            ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
          }`}></div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-2rem)] p-6 sm:p-8">
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition z-10"
            >
              ✕
            </button>

            {/* 结果展示 */}
            <div className="text-center mb-8 pt-4">
              <div className="text-7xl sm:text-9xl mb-4 sm:mb-6 animate-float-in">
                {result.emoji}
              </div>
              <h3 className={`text-xl sm:text-4xl font-bold mb-3 sm:mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{result.name}</h3>
              <div className={`inline-block px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${theme === 'light'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-blue-900/50 text-blue-300'
              }`}>
                {result.message}
              </div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                {getModeDescription()}
              </p>
            </div>

            {/* 权重分布 (如果是偏好或命运模式) */}
            {result.weights && (
              <div className={`mb-8 rounded-2xl ${theme === 'light'
                ? 'bg-blue-50 border border-blue-100'
                : 'bg-gray-800/50 border border-gray-700'
              }`}>
                <h4 className={`font-bold mb-3 px-4 pt-4 sm:px-6 sm:pt-6 sm:text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>本次概率分布</h4>
                <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="space-y-3">
                    {result.weights.map((weight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 text-center text-sm sm:text-base ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>#{index + 1}</div>
                        <div className="flex-1">
                          <div className="h-2.5 sm:h-3 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                            <div 
                              className={`h-full ${theme === 'light'
                                ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                              }`}
                              style={{ width: `${weight}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className={`w-12 sm:w-16 text-right font-mono text-sm sm:text-base ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{weight.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3 sm:gap-4">
              <button
                onClick={handleRollAgain}
                disabled={isAnimating}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold text-base sm:text-lg transition-all ${isAnimating ? 'animate-pulse' : ''} ${theme === 'light'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2">🎲</span>
                再来一次
              </button>
              
              <button
                onClick={() => handleAccept('answer')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold text-base sm:text-lg transition ${theme === 'light'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                  : 'bg-gradient-to-r from-blue-700 to-cyan-800 hover:from-blue-600 hover:to-cyan-700 text-white'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2">✅</span>
                我已经有答案了
              </button>
              
              <button
                onClick={() => handleAccept('fate')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold text-base sm:text-lg transition ${theme === 'light'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gradient-to-r from-purple-700 to-pink-800 hover:from-purple-600 hover:to-pink-700 text-white'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2">🔯</span>
                接受命运
              </button>
            </div>

            {/* 底部提示 */}
            <p className={`text-center text-xs sm:text-sm pb-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              结果已自动保存到历史记录
            </p>
          </div>
        </div>
      </div>

      {/* 全屏动画 (当点击"再来一次"时) */}
      {isAnimating && (
        <div className={`fixed inset-0 z-40 flex items-center justify-center ${theme === 'light'
          ? 'bg-gradient-to-br from-blue-100/80 to-cyan-100/80'
          : 'bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-blue-900/80'
        } backdrop-blur-sm animate-mist`}>
          <div className="text-8xl animate-spin-slow">
            {theme === 'light' ? '🎲' : '🃏'}
          </div>
        </div>
      )}
    </>
  )
}