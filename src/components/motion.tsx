"use client";

import { motion, MotionConfig, type Variants } from "motion/react";

/** House easing: quick out, soft landing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Honors the OS "reduce motion" setting for every animation below. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 16, className, as = "div" }: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" }) {
  const C = motion[as];
  return (
    <C className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE, delay }}>
      {children}
    </C>
  );
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };

/** Children marked with <StaggerItem> enter one after another. */
export function Stagger({ children, className, onMount = false }: { children: React.ReactNode; className?: string; onMount?: boolean }) {
  return (
    <motion.div
      className={className}
      variants={group}
      initial="hidden"
      {...(onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-40px" } })}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, lift = false }: { children: React.ReactNode; className?: string; lift?: boolean }) {
  return (
    <motion.div className={className} variants={item} {...(lift ? { whileHover: { y: -3 }, transition: { type: "spring", stiffness: 400, damping: 28 } } : {})}>
      {children}
    </motion.div>
  );
}

/** Fades the page body in on every navigation (used by the app template). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
      {children}
    </motion.div>
  );
}
