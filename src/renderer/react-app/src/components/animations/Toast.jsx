import { motion } from 'framer-motion';

const toastVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

export const Toast = ({ 
  message, 
  type = 'success', 
  onClose,
}) => {
  const types = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={toastVariants}
      className={`
        fixed bottom-4 right-4 z-50
        px-4 py-3 rounded-lg border
        ${types[type]}
      `}
    >
      <div className="flex items-center">
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
};