import React from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right';
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  direction = 'right' 
}) => {
  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'right' ? '100%' : '-100%',
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: direction === 'right' ? '-30%' : '30%',
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
