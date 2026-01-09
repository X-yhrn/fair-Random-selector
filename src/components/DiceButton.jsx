import { useState, useEffect } from 'react'

export default function DiceButton({ theme, onRoll, isAnimating, mode }) {
  const [cards, setCards] = useState([])
  
  // 夜晚模式：生成飞散的卡牌
  useEffect(() => {
    if (theme === 'dark' && isAnimating) {
      const newCards = []
      for (let i = 0; i < 12; i++) {
        newCards.push({
          id: i,
          tx: (Math.random() - 0.5) * 200,
          ty: (Math.random() - 0.5) * 200,
          r: (Math.random() - 0.5) * 360,
          delay: i * 0.05
        })
      }
      setCards(newCards)
    } else {
      setCards([])
    }
  }, [theme, isAnimating])

  return (
    <div className="relative">
      {/* 全屏动画遮罩 */}
      {isAnimating && (
        <div className={`fixed inset-0 z-40 flex items-center justify-center ${theme === 'light' 
          ? 'bg-gradient-to-br from-blue-100/80 to-cyan-100/80' 
          : 'bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-blue-900/80'
        } backdrop-blur-sm animate-mist`}>
          {/* 夜晚模式：卡牌飞散动画 */}
          {theme === 'dark' && cards.map(card => (
            <div
              key={card.id}
              className="absolute text-5xl"
              style={{
                '--tx': `${card.tx}px`,
                '--ty': `${card.ty}px`,
                '--r': `${card.r}deg`,
                animationDelay: `${card.delay}s`
              }}
            >
              <div className={`${isAnimating ? 'animate-card-explode' : ''}`}>
                🃏
              </div>
            </div>
          ))}
          
          {/* 中心动画元素 */}
          <div className="relative z-50">
            <div className={`text-8xl ${isAnimating ? (
              theme === 'light' ? 'animate-spin-slow' : 'animate-card-flip'
            ) : ''}`}>
              {theme === 'light' ? '🎲' : '🃏'}
            </div>
            
            <div className="mt-8 text-center">
              <div className="text-2xl font-bold mb-2">
                {theme === 'light' ? '骰子旋转中...' : '卡牌揭示中...'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {theme === 'light' ? '命运正在投掷' : '命运正在洗牌'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 主按钮 */}
      <button
        onClick={onRoll}
        disabled={isAnimating}
        className={`relative px-16 py-12 text-3xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${theme === 'light'
          ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600'
          : 'bg-gradient-to-br from-purple-800 via-indigo-800 to-blue-800 text-white hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl">
            {theme === 'light' ? '🎲' : '🃏'}
          </div>
          <div>
            <div className="text-4xl font-bold">
              {theme === 'light' ? '扔骰子' : '抽卡'}
            </div>
            <div className="text-lg opacity-90 mt-2">
              {mode === 'fair' ? '绝对公平' : mode === 'preference' ? '偏心内定' : '交给命运'}
            </div>
          </div>
        </div>
        
        {/* 按钮光泽效果 */}
        <div className={`absolute inset-0 rounded-2xl overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-full h-1/2 ${theme === 'light'
            ? 'bg-gradient-to-b from-white/30 to-transparent'
            : 'bg-gradient-to-b from-white/10 to-transparent'
          }`}></div>
        </div>
      </button>
      
      {/* 按钮外发光 */}
      <div className={`absolute -inset-4 rounded-3xl blur-xl opacity-50 -z-10 ${theme === 'light'
        ? 'bg-gradient-to-br from-blue-400 to-cyan-300'
        : 'bg-gradient-to-br from-purple-600 to-blue-500'
      }`}></div>
    </div>
  )
}