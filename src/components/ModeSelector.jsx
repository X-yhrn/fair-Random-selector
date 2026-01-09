export default function ModeSelector({ mode, setMode, onRegenerateFate }) {
  const modes = [
    { id: 'fair', emoji: '🎲', name: '公平模式', desc: '所有选项等概率' },
    { id: 'preference', emoji: '🎯', name: '偏好模式', desc: '自定义权重决定概率' },
    { id: 'fate', emoji: '🌀', name: '命运模式', desc: '系统随机分配权重' }
  ]

  const modeDescriptions = {
    fair: '所有选项拥有完全相同的选中概率，绝对的公平。',
    preference: '通过调整滑块，让每个选项拥有你想要的概率。',
    fate: '让系统随机决定权重，体验不可预测的命运。'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">选择模式</h2>
      {/* <p className="text-gray-600 dark:text-gray-400 mb-6">今天心情怎么样？</p> */}
      
      {/* 按行排列的模式选择器 */}
      <div className="flex flex-row gap-3 mb-6">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-xl border-2 transition-all relative ${mode === m.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600 shadow-md scale-[1.02]'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <span className="text-2xl mb-2">{m.emoji}</span>
            <div className="text-center">
              <div className={`font-bold text-sm md:text-base ${mode === m.id 
                ? (mode === 'fair' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : mode === 'preference' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-blue-600 dark:text-blue-400') 
                : 'text-gray-700 dark:text-gray-300'}`}>
                {m.name}
              </div>
              <div className={`text-xs ${mode === m.id 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'} mt-1 hidden md:block`}>
                {m.desc}
              </div>
            </div>
            {/* 命运模式下添加重新生成按钮 */}
            {mode === 'fate' && m.id === 'fate' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRegenerateFate && onRegenerateFate()
                }}
                className="absolute top-1 right-1 text-xs px-2 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
              >
                重
              </button>
            )}
          </button>
        ))}
      </div>
      
      {/* 当前模式说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{modes.find(m => m.id === mode)?.emoji}</span>
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200">{modes.find(m => m.id === mode)?.name}</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{modeDescriptions[mode]}</p>
          </div>
        </div>
      </div>
    </div>
  )
}