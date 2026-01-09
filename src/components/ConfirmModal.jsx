import { useEffect } from 'react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "确定", 
  cancelText = "取消",
  theme 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* 弹窗内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`relative max-w-md w-full rounded-3xl shadow-2xl overflow-hidden ${theme === 'light'
          ? 'bg-gradient-to-b from-white to-blue-50'
          : 'bg-gradient-to-b from-gray-900 to-gray-800'
        }`}>
          {/* 装饰性顶部条 */}
          <div className={`h-2 ${theme === 'light'
            ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'
          }`}></div>
          
          <div className="p-6">
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-xl p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition z-10"
            >
              ✕
            </button>

            {/* 内容 */}
            <div className="text-center py-4">
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3 rounded-xl font-bold transition ${theme === 'light'
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {cancelText}
                </button>
                
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 rounded-xl font-bold transition ${theme === 'light'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}