export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.85 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: -100, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: 100, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { y: 30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export const slideDown = {
  hidden: { y: -30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { y: -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export const listAnimationY = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.3,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export const listAnimationX = {
  hidden: { opacity: 0, x: 20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.3,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};
