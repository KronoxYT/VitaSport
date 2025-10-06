import { motion } from 'framer-motion';

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1],
    },
  }),
};

export const Card = ({ children, index = 0, className = '' }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};