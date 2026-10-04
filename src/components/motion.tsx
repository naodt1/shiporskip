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

/** Word-by-word headline, one block per line; `accent` ends the last line in green with a hand-drawn ember underline. */
export function HeroHeadline({ lines, accent, className }: { lines: string[]; accent: string; className?: string }) {
  let k = 0;
  const step = 0.07;
  const words = lines.join(" ").split(" ").length;
  return (
    <h1 className={className} aria-label={`${lines.join(" ")} ${accent}`}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block whitespace-nowrap">
          {line.split(" ").map((w) => {
            const d = 0.05 + k++ * step;
            return (
              <motion.span key={k} className="inline-block" initial={{ opacity: 0, y: "0.4em", filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, ease: EASE, delay: d }}>
                {w}&nbsp;
              </motion.span>
            );
          })}
          {li === lines.length - 1 && (
            <motion.span
              className="relative inline-block text-green"
              initial={{ opacity: 0, y: "0.4em", scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 + words * step }}
            >
              {accent}
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-[0.1em] left-0 h-[0.22em] w-[92%] overflow-visible text-orange" aria-hidden>
                <motion.path
                  d="M3 14 C 50 4, 120 4, 197 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.5 + words * step }}
                />
              </svg>
            </motion.span>
          )}
        </span>
      ))}
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
