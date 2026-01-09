export default function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${theme === 'light' 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
        : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white hover:from-indigo-800 hover:via-purple-800'
      }`}
      aria-label={`切换到${theme === 'light' ? '夜晚抽卡' : '白天扔骰子'}模式`}
    >
      {theme === 'light' ? (
        <>
          <div className="relative">
            <span className="text-3xl group-hover:rotate-12 transition-transform">☀️</span>
            <div className="absolute -top-1 -right-1 text-xs bg-white text-orange-600 px-2 py-1 rounded-full font-bold">
              明亮
            </div>
          </div>
          <div className="text-left">
            <div className="text-lg">切换到深色模式</div>
            {/* <div className="text-sm opacity-90">体验抽卡乐趣</div> */}
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <span className="text-3xl group-hover:rotate-12 transition-transform">🌙</span>
            <div className="absolute -top-1 -right-1 text-xs bg-white text-blue-600 px-2 py-1 rounded-full font-bold">
              深色
            </div>
          </div>
          <div className="text-left">
            <div className="text-lg">切换到明亮模式</div>
            {/* <div className="text-sm opacity-90">体验扔骰乐趣</div> */}
          </div>
        </>
      )}
    </button>
  )
}