import { useState, useEffect } from 'react'
import ThemeToggle from './components/ThemeToggle'
import ModeSelector from './components/ModeSelector'
import OptionManager from './components/OptionManager'
import MobileOptionManager from './components/MobileOptionManager'
import DiceButton from './components/DiceButton'
import ResultModal from './components/ResultModal'
import HistoryPanel from './components/HistoryPanel'
import ConfirmModal from './components/ConfirmModal'

function App() {
  // 应用程序的核心状态
  const [theme, setTheme] = useState('light') // 当前主题 ('light' 或 'dark')
  const [mode, setMode] = useState('preference') // 当前模式 ('fair', 'preference', 'fate')
  const [options, setOptions] = useState([
    { id: 1, name: '这个网页太棒了', emoji: '🥰', weight: 100 },
    { id: 2, name: '这个网页好差劲', emoji: '🙄', weight: 0 }
  ])
  const [showModal, setShowModal] = useState(false) // 是否显示结果模态框
  const [result, setResult] = useState(null) // 掷骰子的结果
  const [isAnimating, setIsAnimating] = useState(false) // 是否正在播放动画
  const [history, setHistory] = useState([]) // 决策历史记录
  const [decisionSets, setDecisionSets] = useState([]) // 决策集（选项配置）
  const [preferenceWeights, setPreferenceWeights] = useState({}) // 保存偏好模式的权重
  const [fateWeights, setFateWeights] = useState({}) // 保存命运模式的权重

  // 计算总权重并标准化显示权重
  const totalWeight = options.reduce((sum, opt) => sum + (opt.weight || 1), 0)
  const normalizedOptions = options.map(opt => ({
    ...opt,
    displayWeight: mode === 'fair' ? 
      Math.round((1 / options.length) * 100) : 
      mode === 'fate' ? 
        Math.round((opt.weight / totalWeight) * 100) : 
        opt.weight
  }))

  /**
   * 处理模式变更
   * 保存当前权重并根据新模式设置新权重
   */
  const handleModeChange = (newMode) => {
    // 如果是从偏好模式切换到其他模式，保存当前权重
    if (mode === 'preference') {
      const weights = {}
      options.forEach(opt => {
        weights[opt.id] = opt.weight
      })
      setPreferenceWeights(weights)
    }
    
    // 根据新模式设置权重
    let newOptions = [...options]
    
    if (newMode === 'fair') {
      // 公平模式：等权重，总和100%
      const equalWeight = 100 / options.length
      newOptions = options.map(opt => ({
        ...opt,
        weight: equalWeight
      }))
    } else if (newMode === 'fate') {
      // 命运模式：如果之前已生成过权重，使用已保存的权重；否则生成新的随机权重
      let randomWeights = generateRandomWeights(options.length)
      let newFateWeights = {}
      
      // 检查是否之前已经为命运模式生成过权重
      if (Object.keys(fateWeights).length > 0) {
        // 如果fateWeights中存在对应选项的权重，使用它们
        newOptions = options.map(opt => {
          if (fateWeights[opt.id] !== undefined) {
            newFateWeights[opt.id] = fateWeights[opt.id]
            return { ...opt, weight: fateWeights[opt.id] }
          } else {
            // 否则生成新的随机权重
            const randomWeight = Math.floor(Math.random() * 100) + 1
            newFateWeights[opt.id] = randomWeight
            return { ...opt, weight: randomWeight }
          }
        })
      } else {
        // 首次进入命运模式，生成随机权重
        randomWeights = generateRandomWeights(options.length)
        newFateWeights = {}
        
        newOptions = options.map((opt, index) => {
          const weight = randomWeights[index]
          newFateWeights[opt.id] = weight
          return { ...opt, weight }
        })
      }
      
      setFateWeights(newFateWeights)
    } else if (newMode === 'preference') {
      // 偏好模式：恢复保存的用户权重，如果没有则使用当前值
      newOptions = options.map(opt => ({
        ...opt,
        weight: preferenceWeights[opt.id] !== undefined ? preferenceWeights[opt.id] : opt.weight
      }))
    }
    
    setOptions(newOptions)
    setMode(newMode)
  }

  // 生成随机权重的辅助函数
  const generateRandomWeights = (count) => {
    // 生成count个随机数
    const randoms = Array.from({ length: count }, () => Math.random() + 0.1) // +0.1避免0
    const sum = randoms.reduce((a, b) => a + b, 0)
    // 归一化到总和100
    return randoms.map(r => Math.round((r / sum) * 100))
  }

  /**
   * 更新选项权重
   * @param {number} id - 选项ID
   * @param {number} weight - 新权重值
   */
  const updateWeight = (id, weight) => {
    const newWeight = Math.min(100, Math.max(1, weight))
    
    // 更新选项权重
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, weight: newWeight } : opt
    ))
    
    // 如果当前是偏好模式，同时更新偏好模式权重记录
    if (mode === 'preference') {
      setPreferenceWeights({
        ...preferenceWeights,
        [id]: newWeight
      })
    }
  }

  /**
   * 重新生成命运模式权重
   */
  const regenerateFateWeights = () => {
    const randomWeights = generateRandomWeights(options.length)
    const newFateWeights = {}
    
    const newOptions = options.map((opt, index) => {
      const weight = randomWeights[index]
      newFateWeights[opt.id] = weight
      return { ...opt, weight }
    })
    
    setFateWeights(newFateWeights)
    setOptions(newOptions)
  }

  /**
   * 执行掷骰子逻辑
   * 根据当前模式计算结果并显示
   */
  const rollTheDice = () => {
    if (isAnimating || options.length === 0) return
    setIsAnimating(true)
    
    setTimeout(() => {
      let selected
      let weights = []
      
      if (mode === 'fair') {
        const equalWeight = 100 / options.length
        weights = options.map(() => equalWeight)
        const randomIndex = Math.floor(Math.random() * options.length)
        selected = options[randomIndex]
      } else if (mode === 'preference') {
        weights = options.map(opt => opt.weight)
        const total = weights.reduce((a, b) => a + b, 0)
        let random = Math.random() * total
        for (let i = 0; i < options.length; i++) {
          random -= weights[i]
          if (random <= 0) {
            selected = options[i]
            break
          }
        }
      } else {
        // 命运模式：使用当前的权重
        weights = options.map(opt => opt.weight)
        const total = weights.reduce((a, b) => a + b, 0)
        let random = Math.random() * total
        for (let i = 0; i < options.length; i++) {
          random -= weights[i]
          if (random <= 0) {
            selected = options[i]
            break
          }
        }
      }

      setResult({
        ...selected,
        weights: mode === 'fair' ? 
          Array(options.length).fill(100 / options.length) : 
          weights,
        message: `已选择：${selected.emoji} ${selected.name}`
      })
      setShowModal(true)
      setIsAnimating(false)

      // 更新决策集合
      const decisionHash = options.map(o => `${o.name}-${o.weight}`).join('|')
      const existingSet = decisionSets.find(ds => ds.hash === decisionHash)
      
      if (existingSet) {
        const updatedSets = decisionSets.map(ds => 
          ds.hash === decisionHash ? 
          { ...ds, useCount: ds.useCount + 1, lastUsed: Date.now() } : ds
        )
        setDecisionSets(updatedSets)
        localStorage.setItem('decisionSets', JSON.stringify(updatedSets))
      } else {
        const newSet = {
          id: Date.now(),
          hash: decisionHash,
          options: [...options],
          mode,
          useCount: 1,
          lastUsed: Date.now(),
          isFavorite: false
        }
        const updatedSets = [newSet, ...decisionSets]
        setDecisionSets(updatedSets)
        localStorage.setItem('decisionSets', JSON.stringify(updatedSets))
      }

      // 添加历史记录
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        mode,
        options: [...options],
        result: selected,
        decisionHash
      }
      const updatedHistory = [newRecord, ...history.slice(0, 49)]
      setHistory(updatedHistory)
      localStorage.setItem('decisionHistory', JSON.stringify(updatedHistory))
    }, 1000)
  }

  // 初始化加载数据
  useEffect(() => {
    const savedHistory = localStorage.getItem('decisionHistory')
    const savedSets = localStorage.getItem('decisionSets')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedSets) setDecisionSets(JSON.parse(savedSets))
  }, [])

  // 清除本地数据相关状态
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const confirmClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // 检测屏幕尺寸以确定是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-gradient-light text-gray-800' : 'bg-gradient-dark text-gray-100'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex flex-row w-full justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">这是一个可以调整概率的随机选择器</h1>
            <div className="ml-4">
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            {/* <p className="text-gray-600 dark:text-gray-400 mt-2">选择困难症的救星</p> */}
          </div>
        </header>

        <main>
          {/* 主操作区 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            
            {/* 左侧区域 - 选项管理器 */}
            <div className="lg:w-2/3">
              <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-sm ${theme === 'light' ? 'bg-white/80' : 'bg-gray-900/80 border border-gray-800'}`}>
                {/* 左侧容器不再设置固定高度，由内部内容自然撑开 */}
                {isMobile ? (
                  <MobileOptionManager 
                    options={options} 
                    setOptions={setOptions} 
                    mode={mode}
                    theme={theme}
                    normalizedOptions={normalizedOptions}
                    updateWeight={updateWeight}
                  />
                ) : (
                  <OptionManager 
                    options={options} 
                    setOptions={setOptions} 
                    mode={mode}
                    theme={theme}
                    normalizedOptions={normalizedOptions}
                    updateWeight={updateWeight}
                  />
                )}
              </div>
            </div>

            {/* 右侧区域 */}
            <div className="lg:w-1/3 flex flex-col gap-6">
              
              {/* 模式选择器 - 修改为水平布局 */}
              <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-sm ${theme === 'light' ? 'bg-white/80' : 'bg-gray-900/80 border border-gray-800'}`}>
                <ModeSelector 
                  mode={mode} 
                  setMode={handleModeChange} 
                  onRegenerateFate={regenerateFateWeights}
                />
              </div>
              
              {/* 掷骰子按钮区域 */}
              <div className={`rounded-2xl p-8 shadow-xl backdrop-blur-sm flex items-center justify-center min-h-[300px] ${theme === 'light' ? 'bg-gradient-to-br from-blue-50/80 to-cyan-50/80' : 'bg-gray-900/80 border border-gray-800'}`}>
                <div className="text-center w-full">
                  <DiceButton 
                    theme={theme} 
                    onRoll={rollTheDice} 
                    isAnimating={isAnimating}
                    mode={mode}
                  />
                  <p className="mt-6 text-lg opacity-90">
                    {theme === 'light' ? '准备好了吗？' : '我准备好了我准备好了~'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 历史记录面板 - 保持不变 */}
          <HistoryPanel 
            history={history}
            decisionSets={decisionSets}
            theme={theme}
            setOptions={setOptions}
            setMode={setMode}
          />

          {/* 数据安全声明 - 保持不变 */}
          <footer className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-medium">所有数据仅存在你的设备上</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">你的隐私，我们全力保护</p>
                </div>
              </div>
              <button 
                onClick={handleClearData}
                className={`px-6 py-3 font-semibold rounded-xl transition shadow-lg hover:shadow-xl ${theme === 'light' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white' 
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'}`}
              >
                清除所有本地数据
              </button>
            </div>
          </footer>
        </main>    

        {showModal && result && (
          <ResultModal 
            result={result} 
            onClose={() => setShowModal(false)}
            onRollAgain={() => {
              setShowModal(false)
              rollTheDice()
            }}
            theme={theme}
            mode={mode}
          />
        )}
        
        {/* 清除数据确认弹窗 */}
        <ConfirmModal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={confirmClearData}
          title="清除所有数据"
          message="确定要清除所有本地数据吗？此操作不可撤销。"
          theme={theme}
        />
      </div>
    </div>
  )
}

export default App