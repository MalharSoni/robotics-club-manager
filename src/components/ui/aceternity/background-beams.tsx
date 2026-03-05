"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden pointer-events-none",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {paths.map((_, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`gradient-${index}`}
              initial={{
                x1: "0%",
                x2: "0%",
                y1: "0%",
                y2: "0%",
              }}
              animate={{
                x1: ["0%", "100%"],
                x2: ["0%", "95%"],
                y1: ["0%", "100%"],
                y2: ["0%", `${93 + Math.random() * 8}%`],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                ease: "linear",
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <stop stopColor="#06b6d4" stopOpacity="0"></stop>
              <stop stopColor="#06b6d4"></stop>
              <stop offset="32.5%" stopColor="#a855f7"></stop>
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0"></stop>
            </motion.linearGradient>
          ))}

          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(352 368) rotate(-90) scale(352 696)">
            <stop offset="0.0666667" stopColor="var(--neutral-300)" stopOpacity="0.6"></stop>
            <stop offset="0.243243" stopColor="var(--neutral-300)" stopOpacity="0.4"></stop>
            <stop offset="0.43594" stopColor="var(--neutral-300)" stopOpacity="0.2"></stop>
            <stop offset="0.644844" stopColor="var(--neutral-300)" stopOpacity="0"></stop>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
