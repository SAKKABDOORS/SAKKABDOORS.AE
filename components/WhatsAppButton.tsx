"use client";

import { motion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function WhatsAppButton({ label }: { label: string }) {
  const href = buildWhatsAppLink("مرحباً، أرغب بالاستفسار عن الأبواب المتوفرة لديكم.");

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg"
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.6 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="flex h-5 w-5 items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-white" aria-hidden="true">
          <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.31.66 4.463 1.803 6.29L4 29l7.897-1.76A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.98 17.02c-.29.82-1.44 1.5-2.36 1.7-.63.13-1.45.24-4.22-.91-3.54-1.47-5.82-5.06-6-5.3-.17-.24-1.44-1.92-1.44-3.66 0-1.74.9-2.6 1.23-2.95.29-.32.63-.4.84-.4.21 0 .42 0 .6.01.19.01.45-.07.7.54.29.7.98 2.45 1.06 2.63.09.18.14.39.03.63-.11.24-.17.39-.34.6-.17.2-.36.46-.51.62-.17.18-.35.37-.15.72.19.34.86 1.42 1.85 2.3 1.27 1.14 2.34 1.49 2.68 1.66.34.17.55.14.75-.08.2-.23.85-1 1.08-1.34.23-.34.46-.28.77-.17.32.12 2 .95 2.34 1.12.34.17.57.25.65.4.08.14.08.83-.21 1.65Z" />
        </svg>
      </motion.span>
      {label}
    </motion.a>
  );
}
