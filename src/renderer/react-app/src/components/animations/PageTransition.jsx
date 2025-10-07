import { motion, AnimatePresence } from 'framer-motion';

const pageTransitionVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1],
    },
  },
};

export const PageTransition = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageTransitionVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};