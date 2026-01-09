import { useState, useEffect } from 'react'

// 假设 ConfirmModal 已经存在于同目录下
import ConfirmModal from './ConfirmModal'

export default function HistoryPanel({ history, decisionSets, theme, setOptions, setMode }) {
  const [activeTab, setActiveTab] = useState('recent')
  const [favorites, setFavorites] = useState([])
  const [editedTitles, setEditedTitles] = useState({})
  
  // 1. 修改点：为三个标签页分别管理展开状态
  const [tabExpandedState, setTabExpandedState] = useState({
    recent: false,
    favorite: false,
    frequent: false
  })

  // 新增：用于管理各种确认弹窗的状态
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [setToDelete, setSetToDelete] = useState(null)
  const [reuseConfirm, setReuseConfirm] = useState(null)
  const [reuseSetConfirm, setReuseSetConfirm] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 辅助函数：更新某个标签页的展开状态
  const setTabExpanded = (tab, isExpanded) => {
    setTabExpandedState(prev => ({ ...prev, [tab]: isExpanded }))
  }

  // 获取当前激活标签页的展开状态
  const isCurrentTabExpanded = tabExpandedState[activeTab]

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteDecisions')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const toggleFavorite = (id) => {
    let newFavorites
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id)
    } else {
      newFavorites = [...favorites, id]
    }
    setFavorites(newFavorites)
    localStorage.setItem('favoriteDecisions', JSON.stringify(newFavorites))
  }

  // 处理删除记录
  const handleDeleteRecord = () => {
    if (!recordToDelete) return
    
    const newHistory = history.filter(record => record.id !== recordToDelete)
    localStorage.setItem('decisionHistory', JSON.stringify(newHistory))
    setRecordToDelete(null)
    window.location.reload()
  }

  // 处理删除决策集
  const handleDeleteSet = () => {
    if (!setToDelete) return
    
    const newSets = decisionSets.filter(set => set.hash !== setToDelete)
    const newHistory = history.filter(record => record.decisionHash !== setToDelete)
    localStorage.setItem('decisionSets', JSON.stringify(newSets))
    localStorage.setItem('decisionHistory', JSON.stringify(newHistory))
    setSetToDelete(null)
    window.location.reload()
  }

  // 处理复用决策
  const handleReuseDecision = () => {
    if (!reuseConfirm) return
    
    setOptions(reuseConfirm.options)
    setMode(reuseConfirm.mode)
    setReuseConfirm(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 处理复用决策集
  const handleReuseDecisionSet = () => {
    if (!reuseSetConfirm) return
    
    setOptions(reuseSetConfirm.options)
    setMode(reuseSetConfirm.mode)
    setReuseSetConfirm(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 确认删除记录
  const confirmDeleteRecord = (id) => {
    setRecordToDelete(id)
  }

  // 确认删除决策集
  const confirmDeleteSet = (hash) => {
    setSetToDelete(hash)
  }

  // 确认复用决策
  const confirmReuseDecision = (record) => {
    setReuseConfirm(record)
  }

  // 确认复用决策集
  const confirmReuseDecisionSet = (decisionSet) => {
    setReuseSetConfirm(decisionSet)
  }

  // 确认清空历史
  const confirmClearHistory = () => {
    setShowClearConfirm(true)
  }

  // 处理清空全部历史
  const handleClearAll = () => {
    localStorage.removeItem('decisionHistory')
    localStorage.removeItem('decisionSets')
    localStorage.removeItem('favoriteDecisions')
    setShowClearConfirm(false)
    window.location.reload()
  }

  const getModeEmoji = (mode) => {
    switch(mode) {
      case 'fair': return '🎲'
      case 'preference': return '🎯'
      case 'fate': return '🌀'
      default: return '📝'
    }
  }

  const getModeName = (mode) => {
    switch(mode) {
      case 'fair': return '公平'
      case 'preference': return '偏好'
      case 'fate': return '命运'
      default: return '未知'
    }
  }

  const handleTitleEdit = (id, newTitle) => {
    setEditedTitles({...editedTitles, [id]: newTitle})
  }

  const saveTitleEdit = (id) => {
    const updatedHistory = history.map(record => 
      record.id === id 
        ? {...record, customTitle: editedTitles[id]}
        : record
    )
    localStorage.setItem('decisionHistory', JSON.stringify(updatedHistory))
    delete editedTitles[id]
    setEditedTitles({...editedTitles})
  }

  // 按标签筛选记录
  const getFilteredRecords = () => {
    let filtered = [...history]
    
    if (activeTab === 'favorite') {
      filtered = filtered.filter(record => favorites.includes(record.id))
    } else if (activeTab === 'frequent') {
      // 从decisionSets获取常用决策
      const frequentSets = [...decisionSets]
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 10)
      return frequentSets
    }
    
    // 最近使用：按时间倒序
    filtered.sort((a, b) => b.id - a.id)
    return filtered
  }

  const getDisplayItems = () => {
    if (activeTab === 'frequent') {
      return getFilteredRecords()
    }
    return getFilteredRecords()
  }

  const formatDate = (timestamp) => {
    return timestamp
  }

  const formatCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  // 渲染单条记录的函数
  const renderRecordItem = (item, isDecisionSet = false) => {
    const isFavorite = favorites.includes(item.id)
    const customTitle = editedTitles[item.id] !== undefined 
      ? editedTitles[item.id] 
      : (item.customTitle || (isDecisionSet ? `决策配置 #${item.id.toString().slice(-4)}` : `${item.result?.name} 的决策`))

    return (
      <div
        key={isDecisionSet ? item.hash : item.id}
        className={`p-5 rounded-2xl border transition-all hover:shadow-lg mb-4 last:mb-0 ${theme === 'light'
          ? 'bg-gradient-to-r from-white to-gray-50 border-gray-300 hover:border-blue-400'
          : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-gray-700 hover:border-blue-700'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {editedTitles[item.id] !== undefined ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => handleTitleEdit(item.id, e.target.value)}
                    className="px-3 py-1 border rounded dark:bg-gray-800"
                  />
                  <button
                    onClick={() => saveTitleEdit(item.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <h4 
                  className="text-lg font-bold truncate cursor-pointer hover:text-blue-500 transition"
                  onClick={() => handleTitleEdit(item.id, customTitle)}
                  title="点击编辑标题"
                >
                  {customTitle}
                </h4>
              )}
              
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm whitespace-nowrap ${theme === 'light'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-blue-900/50 text-blue-300'
              }`}>
                <span>{getModeEmoji(isDecisionSet ? item.mode : item.mode)}</span>
                <span>{getModeName(isDecisionSet ? item.mode : item.mode)}模式</span>
              </span>
              
              {isDecisionSet && (
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${theme === 'light'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-purple-900/50 text-purple-300'
                }`}>
                  <span>🔥</span>
                  <span>使用 {formatCount(item.useCount)} 次</span>
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {!isDecisionSet && (
                <span>时间: {formatDate(item.timestamp)}</span>
              )}
              <span>选项数: {item.options?.length || 1}</span>
              {isDecisionSet && (
                <span>最后使用: {new Date(item.lastUsed).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* 结果摘要 */}
        <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${theme === 'light'
          ? 'bg-blue-50 border border-blue-100'
          : 'bg-gray-800/50 border border-gray-700'
        }`}>
          <span className="text-3xl">
            {isDecisionSet ? item.options?.[0]?.emoji : item.result?.emoji}
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {isDecisionSet ? '示例结果' : '上次结果'}: {isDecisionSet ? item.options?.[0]?.name : item.result?.name}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {item.options?.slice(0, 3).map((opt, idx) => (
                <span key={idx} className={`px-2 py-1 rounded text-xs ${theme === 'light'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-700 text-gray-300'
                }`}>
                  {opt.emoji} {opt.name}
                </span>
              ))}
              {item.options?.length > 3 && (
                <span className={`px-2 py-1 rounded text-xs ${theme === 'light'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-700 text-gray-300'
                }`}>
                  +{item.options.length - 3} 更多
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => isDecisionSet ? confirmReuseDecisionSet(item) : confirmReuseDecision(item)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            <span>▶️</span>
            <span>复用此决策</span>
          </button>
          
          {!isDecisionSet && (
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isFavorite
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : theme === 'light'
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>{isFavorite ? '★' : '⭐'}</span>
              <span>{isFavorite ? '取消收藏' : '加入收藏'}</span>
            </button>
          )}
          
          <button
            onClick={() => isDecisionSet ? confirmDeleteSet(item.hash) : confirmDeleteRecord(item.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            <span>🗑</span>
            <span>删除</span>
          </button>
        </div>
      </div>
    )
  }

  // 获取当前标签页的项目
  const displayItems = getDisplayItems()
  const isFrequentTab = activeTab === 'frequent'
  
  // 2. 修改点：统一的渲染逻辑
  // 根据当前标签页的展开状态，决定渲染“滚动容器”还是“平铺列表”
  const renderListContent = () => {
    // 如果当前标签页是“展开”状态，则平铺渲染所有项目
    if (isCurrentTabExpanded) {
      return (
        <div className="space-y-4">
          {displayItems.map(item => renderRecordItem(item, isFrequentTab))}
        </div>
      )
    }
    
    // 否则，渲染固定高度的滚动容器
    return (
      <>
        <div className={`rounded-xl overflow-hidden border mb-4 ${theme === 'light' 
          ? 'border-gray-300' 
          : 'border-gray-700'
        }`}>
          <div 
            className="overflow-y-auto scroll-container" 
            style={{ maxHeight: '400px' }} // 容器高度，可调整
          >
            <div className="p-4">
              {displayItems.map(item => renderRecordItem(item, isFrequentTab))}
            </div>
          </div>
          
          {/* 3. 修改点：底部操作栏 - 提示当前在滚动模式，并可切换到平铺 */}
          {displayItems.length > 0 && (
            <div className={`p-4 border-t flex justify-between items-center ${theme === 'light'
              ? 'bg-gray-100 border-gray-300'
              : 'bg-gray-900 border-gray-700'
            }`}>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                滚动查看全部 {displayItems.length} 条记录
              </span>
              <button
                onClick={() => setTabExpanded(activeTab, true)}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-1"
              >
                平铺展开 <span className="text-xs">▼</span>
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <section className={`rounded-3xl p-6 shadow-xl ${theme === 'light' 
      ? 'bg-white/90 backdrop-blur-sm border border-gray-200' 
      : 'bg-gray-900/80 backdrop-blur-sm border border-gray-800'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">历史记录</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {activeTab === 'recent' ? '最近的决策记录' : 
             activeTab === 'favorite' ? '你收藏的决策' : 
             '最常用的决策配置'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {[
            {id: 'recent', emoji: '🕓', name: '最近'},
            {id: 'favorite', emoji: '⭐', name: '收藏'},
            {id: 'frequent', emoji: '📌', name: '常用'}
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition ${activeTab === tab.id
                ? theme === 'light'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-blue-700 text-white shadow'
                : theme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 历史记录列表区域 */}
      {displayItems.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${theme === 'light'
          ? 'bg-gray-50 border-2 border-dashed border-gray-300'
          : 'bg-gray-800/50 border-2 border-dashed border-gray-700'
        }`}>
          <div className="text-5xl mb-4">
            {activeTab === 'recent' ? '📋' : 
             activeTab === 'favorite' ? '⭐' : '📊'}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {activeTab === 'recent' ? '暂无历史记录' : 
             activeTab === 'favorite' ? '暂无收藏记录' : '暂无常用决策'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'recent' ? '开始使用骰子做决定吧！' : 
             activeTab === 'favorite' ? '将重要的决策加入收藏吧！' : '频繁使用的决策会出现在这里'}
          </p>
        </div>
      ) : (
        <div>
          {/* 4. 修改点：使用统一的渲染函数 */}
          {renderListContent()}

          {/* 5. 修改点：当处于平铺展开状态时，显示收起按钮 */}
          {isCurrentTabExpanded && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setTabExpanded(activeTab, false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition font-medium flex items-center gap-2 mx-auto"
              >
                <span>收起列表</span>
                <span className="text-xs">▲</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 统计信息 */}
      {(history.length > 0 || decisionSets.length > 0) && (
        <div className={`mt-6 pt-6 border-t ${theme === 'light' 
          ? 'border-gray-300' 
          : 'border-gray-700'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-3 rounded-xl ${theme === 'light'
              ? 'bg-blue-50 border border-blue-100'
              : 'bg-blue-900/20 border border-blue-800'
            }`}>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {history.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">总记录数</div>
            </div>
            
            <div className={`text-center p-3 rounded-xl ${theme === 'light'
              ? 'bg-yellow-50 border border-yellow-100'
              : 'bg-yellow-900/20 border border-yellow-800'
            }`}>
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {favorites.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">收藏数</div>
            </div>
            
            <div className={`text-center p-3 rounded-xl ${theme === 'light'
              ? 'bg-purple-50 border border-purple-100'
              : 'bg-purple-900/20 border border-purple-800'
            }`}>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {decisionSets.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">决策配置</div>
            </div>
            
            <div className={`text-center p-3 rounded-xl ${theme === 'light'
              ? 'bg-red-50 border border-red-100'
              : 'bg-red-900/20 border border-red-800'
            }`}>
              <button
                onClick={confirmClearHistory}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition text-sm"
              >
                <div className="font-bold">清除全部</div>
                <div className="text-xs">一键清空</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认删除记录弹窗 */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
        title="删除记录"
        message="确定要删除这条记录吗？"
        theme={theme}
      />

      {/* 确认删除决策集弹窗 */}
      <ConfirmModal
        isOpen={!!setToDelete}
        onClose={() => setSetToDelete(null)}
        onConfirm={handleDeleteSet}
        title="删除决策集"
        message="确定要删除这个决策及其所有记录吗？"
        theme={theme}
      />

      {/* 确认复用记录弹窗 */}
      <ConfirmModal
        isOpen={!!reuseConfirm}
        onClose={() => setReuseConfirm(null)}
        onConfirm={handleReuseDecision}
        title="复用选项"
        message="要复用这次的选项和权重吗？"
        theme={theme}
      />

      {/* 确认复用决策集弹窗 */}
      <ConfirmModal
        isOpen={!!reuseSetConfirm}
        onClose={() => setReuseSetConfirm(null)}
        onConfirm={handleReuseDecisionSet}
        title="复用决策"
        message={`要复用这个决策吗？它已被使用 ${reuseSetConfirm?.useCount} 次`}
        theme={theme}
      />

      {/* 确认清空历史记录弹窗 */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="清空历史记录"
        message="确定要清除所有历史记录吗？此操作不可撤销。"
        theme={theme}
      />
    </section>
  )
}