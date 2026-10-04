"use client";

import { animate, motion, MotionConfig, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

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

/** Counts up from 0 when it scrolls into view. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-US")}
    </span>
  );
}

/** Word-by-word headline; the last word is green with a hand-drawn underline. */
export function HeroHeadline({ text, accent, className }: { text: string; accent: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={`${text} ${accent}`}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: "0.4em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.05 + i * 0.045 }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
      <motion.span
        aria-hidden
        className="relative inline-block text-green"
        initial={{ opacity: 0, y: "0.4em", scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 + words.length * 0.045 }}
      >
        {accent}
        <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-[0.12em] left-0 h-[0.28em] w-[94%] overflow-visible" aria-hidden>
          <motion.path
            d="M3 14 C 50 4, 120 4, 197 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.45 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 + words.length * 0.045 }}
          />
        </svg>
      </motion.span>
    </h1>
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
