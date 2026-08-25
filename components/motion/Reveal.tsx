"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Generic scroll-reveal wrapper. Wraps server-rendered children (they stay
 * server components — only this thin wrapper is a client component), and
 * fades/slides them in once they enter the viewport.
 *
 * Usage: <Reveal delay={0.1}><ProductCard ... /></Reveal>
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
