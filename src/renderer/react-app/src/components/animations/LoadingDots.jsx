import { motion } from 'framer-motion';

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: '50%',
  },
  end: {
    y: '150%',
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: 'easeInOut',
};

export const LoadingDots = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex space-x-2 ${className}`}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      {[1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="w-2 h-2 bg-current rounded-full"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
      ))}
    </motion.div>
  );
};