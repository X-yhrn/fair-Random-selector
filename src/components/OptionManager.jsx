import { useState, useEffect } from 'react'
import WeightSlider from './WeightSlider'
import ConfirmModal from './ConfirmModal'

export default function OptionManager({ options, setOptions, mode, theme, normalizedOptions, updateWeight }) {
  const [newOption, setNewOption] = useState({ name: '', emoji: '📝' })
  const [isEmojiPanelOpen, setIsEmojiPanelOpen] = useState(false)
  const [customEmojiInput, setCustomEmojiInput] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  
  // Emoji库 - 从localStorage加载或使用默认
  const [emojiList, setEmojiList] = useState(() => {
    const saved = localStorage.getItem('emojiList')
    return saved ? JSON.parse(saved) : [
      '🍕', '🍔', '🥗', '☕', '🎮', '📚', '🎵', '🎬', '🚗', '🏠',
      '✈️', '🎨', '🎤', '🎹', '💧', '🌱', '🌸', '🍂', '❄️', '🌙'
    ]
  })

  // 拖拽相关状态
  const [draggedEmoji, setDraggedEmoji] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // 保存Emoji列表到localStorage
  useEffect(() => {
    localStorage.setItem('emojiList', JSON.stringify(emojiList))
  }, [emojiList])

  const addOption = () => {
    if (!newOption.name.trim()) {
      setAlertMessage('请输入选项名称')
      setShowAlert(true)
      return
    }
    
    const defaultWeight = mode === 'preference' ? 50 : 
                         mode === 'fate' ? Math.floor(Math.random() * 100) + 1 : 1
    
    const newOpt = {
      id: Date.now(),
      name: newOption.name,
      emoji: newOption.emoji,
      weight: defaultWeight
    }
    
    setOptions([...options, newOpt])
    setNewOption({ name: '', emoji: '📝' })
  }

  const removeOption = (id) => {
    setOptions(options.filter(opt => opt.id !== id))
  }

  const updateEmoji = (id, emoji) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, emoji } : opt
    ))
  }

  const updateName = (id, name) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, name } : opt
    ))
  }

  // 添加自定义Emoji
  const addCustomEmoji = () => {
    if (!customEmojiInput.trim()) return
    
    const emoji = customEmojiInput.trim()
    // 避免重复
    if (!emojiList.includes(emoji)) {
      const updatedEmojis = [emoji, ...emojiList]
      setEmojiList(updatedEmojis)
    }
    
    setNewOption({...newOption, emoji})
    setCustomEmojiInput('')
  }

  // 移除Emoji
  const removeEmoji = (index, e) => {
    e.stopPropagation()
    const updatedEmojis = [...emojiList]
    updatedEmojis.splice(index, 1)
    setEmojiList(updatedEmojis)
  }

  // 拖拽开始
  const handleDragStart = (index, e) => {
    setDraggedEmoji(emojiList[index])
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedEmoji(null)
    setDragOverIndex(null)
  }

  // 拖拽经过
  const handleDragOver = (index, e) => {
    e.preventDefault()
    setDragOverIndex(index)
    e.dataTransfer.dropEffect = 'move'
  }

  // 拖拽离开
  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  // 放置
  const handleDrop = (dropIndex, e) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex !== dropIndex && !isNaN(dragIndex)) {
      const newEmojiList = [...emojiList]
      const [draggedItem] = newEmojiList.splice(dragIndex, 1)
      newEmojiList.splice(dropIndex, 0, draggedItem)
      setEmojiList(newEmojiList)
    }
    
    setDraggedEmoji(null)
    setDragOverIndex(null)
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1'
    }
  }

  // 计算总权重
  const getTotalWeight = () => {
    return options.reduce((sum, opt) => sum + (opt.weight || 1), 0)
  }

  // 渲染单个选项项
  const renderOptionItem = (opt, index) => {
    const displayWeight = normalizedOptions[index]?.displayWeight || opt.weight
    
    return (
      <div
        key={opt.id}
        className={`p-4 rounded-xl border mb-3 last:mb-0 ${theme === 'light'
          ? 'bg-white border-gray-200 hover:border-blue-300'
          : 'bg-gray-900/80 backdrop-blur-sm border border-gray-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          {/* 左侧：Emoji和名称 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative group">
              <span className="text-3xl">{opt.emoji}</span>
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className={`flex flex-wrap gap-1 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} p-2 rounded-lg shadow-lg border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                  {emojiList.slice(0, 6).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => updateEmoji(opt.id, emoji)}
                      className={`text-lg p-1 hover:${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsEmojiPanelOpen(true)}
                    className={`text-sm px-2 py-1 text-blue-500 ${theme === 'light' ? 'hover:bg-blue-100' : 'hover:bg-blue-900'} rounded`}
                  >
                    更多
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateName(opt.id, e.target.value)}
                className={`w-full text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 ${theme === 'light' ? '' : 'text-white'}`}
                placeholder="选项名称"
              />
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm ${theme === 'light'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-blue-900/50 text-blue-300'
                }`}>
                  权重: {displayWeight}%
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：权重调节和删除 */}
          <div className="lg:w-2/3">
            <div className="mb-3">
              <WeightSlider
                value={opt.weight}
                onChange={(newWeight) => updateWeight(opt.id, newWeight)}
                disabled={mode !== 'preference'}
                showPercentage={true}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                权重值: {opt.weight} / 100
              </div>
              <button
                onClick={() => removeOption(opt.id)}
                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">管理选项</h2>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            当前选项数: <span className="font-bold text-blue-600 dark:text-blue-400">{options.length}</span>
            {mode !== 'preference' && (
              <span className="ml-4">
                总权重: <span className="font-bold">{getTotalWeight()}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 添加新选项区域 */}
      <div className={`mb-8 p-6 rounded-2xl ${theme === 'light' 
        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100' 
        : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700'
      }`}>
        
        {/* Emoji选择器 */}
        <div className="mb-6 relative"> {/* 添加relative定位 */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">选择表情符号</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                可拖拽排序
              </span>
              <button
                type="button"
                onClick={() => setIsEmojiPanelOpen(!isEmojiPanelOpen)}
                className={`px-3 py-1 rounded-lg text-sm transition ${isEmojiPanelOpen
                  ? theme === 'light'
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-blue-700 text-white shadow'
                  : theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isEmojiPanelOpen ? '收起' : '展开'}
              </button>
            </div>
          </div>

          {/* 始终显示单行滚动表情 */}
          <div className="mb-4">
            <div className="relative">
              {/* 水平滚动容器 */}
              <div 
                className="flex overflow-x-auto pb-2 scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 40px), transparent 100%)'
                }}
              >
                <div className="flex gap-2 flex-nowrap min-w-min px-4">
                  {emojiList.map((emoji, index) => (
                    <button
                      key={`visible-${index}`}
                      type="button"
                      onClick={() => setNewOption({...newOption, emoji})}
                      className={`flex-shrink-0 text-2xl p-2 rounded-lg transition-all relative group ${newOption.emoji === emoji
                        ? 'bg-blue-500 text-white scale-110 shadow-lg'
                        : theme === 'light'
                          ? 'bg-white hover:bg-gray-100 border border-gray-200'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      } ${dragOverIndex === index ? 'ring-2 ring-blue-400' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(index, e)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(index, e)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(index, e)}
                    >
                      {emoji}
                      <button
                        onClick={(e) => removeEmoji(index, e)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 滚动提示 */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className={`text-xs px-2 py-1 rounded-l ${theme === 'light'
                  ? 'bg-gray-800/10 text-gray-600'
                  : 'bg-white/10 text-gray-300'
                }`}>
                  滚动 →
                </div>
              </div>
            </div>
          </div>

          {/* 展开的表情面板 - 现在是覆盖在下方的弹出框 */}
          {isEmojiPanelOpen && (
            <div className={`absolute z-10 w-full p-4 rounded-xl shadow-2xl ${theme === 'light'
              ? 'bg-white border border-gray-300'
              : 'bg-gray-800 border border-gray-700'
            }`}>
              {/* 自定义Emoji输入 */}
              <div className={`mb-4 p-3 rounded-lg ${theme === 'light'
                ? 'bg-gray-100 border border-gray-300'
                : 'bg-gray-900/50 border border-gray-700'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">✨</span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">添加自定义表情</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      输入任意emoji字符，它将添加到列表最前面
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmojiInput}
                    onChange={(e) => setCustomEmojiInput(e.target.value)}
                    placeholder="粘贴或输入emoji字符..."
                    className={`flex-1 px-4 py-2 border rounded-lg ${theme === 'light' ? 'dark:bg-gray-800' : 'bg-gray-700 border-gray-600 text-white'}`}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomEmoji()}
                  />
                  <button
                    onClick={addCustomEmoji}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 完整的Emoji库 */}
              <div 
                className={`grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-80 overflow-y-auto p-4 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
              >
                {emojiList.map((emoji, index) => (
                  <button
                    key={`all-${index}`}
                    type="button"
                    onClick={() => {
                      setNewOption({...newOption, emoji})
                      setIsEmojiPanelOpen(false) // 选择后关闭面板
                    }}
                    className={`text-2xl p-2 rounded-lg transition-all relative ${newOption.emoji === emoji
                      ? 'bg-blue-500 text-white scale-110 shadow-lg'
                      : theme === 'light'
                        ? 'bg-white hover:bg-gray-100 border border-gray-200'
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    } ${dragOverIndex === index ? 'ring-2 ring-blue-400 scale-105' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    {emoji}
                    <button
                      onClick={(e) => removeEmoji(index, e)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                      </button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 选项输入区域 */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className={`text-4xl p-3 rounded-xl ${theme === 'light'
                ? 'bg-white border border-gray-300'
                : 'bg-gray-800 border border-gray-700'
              }`}>
                {newOption.emoji}
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  当前选中: <span className="font-bold">{newOption.emoji}</span>
                </label>
                <input
                  type="text"
                  placeholder="输入选项描述..."
                  value={newOption.name}
                  onChange={(e) => setNewOption({...newOption, name: e.target.value})}
                  className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${theme === 'light' ? 'bg-white' : 'bg-gray-800 text-white'}`}
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={addOption}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            添加选项
          </button>
        </div>
      </div>

      {/* 选项列表 */}
      {options.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${theme === 'light'
          ? 'bg-gray-50 border-2 border-dashed border-gray-300'
          : 'bg-gray-900/50 border-2 border-dashed border-gray-700'
        }`}>
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">暂无选项</h3>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>请先添加至少一个选项</p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden border ${theme === 'light' 
          ? 'border-gray-300' 
          : 'border-gray-700'
        }`}>
          <div className="max-h-96 overflow-y-auto"> {/* 添加滚动容器 */}
            <div className="p-4">
              {options.map((opt, index) => renderOptionItem(opt, index))}
            </div>
          </div>
        </div>
      )}
      
      {/* 警告弹窗 */}
      <ConfirmModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
        title="警告"
        message={alertMessage}
        confirmText="确定"
        theme={theme}
      />
    </div>
  )
}