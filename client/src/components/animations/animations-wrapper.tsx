"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  listAnimationY,
  listAnimationX,
  slideDown,
  slideInLeft,
  slideInRight,
  slideUp,
} from "./animation-variants";

const animationVariants = {
  fadeIn,
  slideInLeft,
  slideInRight,
  slideUp,
  slideDown,
  listAnimationY,
  listAnimationX,
};

interface AnimationsWrapperProps {
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  isList?: boolean;
  scrollTrigger?: boolean;
  className?: string;
}

export default function AnimationsWrapper({
  children,
  variant = "fadeIn",
  isList = false,
  scrollTrigger = false,
  className,
}: AnimationsWrapperProps) {
  const animation = animationVariants[variant];

  return (
    <AnimatePresence mode="wait">
      {isList ? (
        <>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <motion.li
                  key={index}
                  variants={animation}
                  animate={!scrollTrigger && "visible"}
                  initial="hidden"
                  whileInView={scrollTrigger ? "visible" : undefined}
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                  className={`list-none ${className}`}
                >
                  {child}
                </motion.li>
              ))
            : children}
        </>
      ) : (
        <motion.div
          initial="hidden"
          animate={!scrollTrigger && "visible"}
          exit="exit"
          variants={animation}
          transition={{ duration: 1 }}
          whileInView={scrollTrigger ? "visible" : undefined}
          viewport={{ once: true, amount: 0.7 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
