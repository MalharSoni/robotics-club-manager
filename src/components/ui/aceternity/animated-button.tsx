"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ShimmerButton = ({
  children,
  className,
  shimmerColor = "#06b6d4",
  shimmerSize = "0.05em",
  borderRadius = "0.5rem",
  shimmerDuration = "3s",
  background = "rgba(0, 0, 0, 0.8)",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  [key: string]: any;
}) => {
  return (
    <button
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        } as React.CSSProperties
      }
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 hover:scale-105 active:scale-95",
        "before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(var(--spread),transparent,var(--shimmer-color),transparent)]",
        "before:translate-x-[-200%] before:animate-[shimmer_var(--speed)_infinite]",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>
    </button>
  );
};

export const GlowButton = ({
  children,
  className,
  glowColor = "rgba(6, 182, 212, 0.5)",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  [key: string]: any;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-6 py-3 rounded-lg font-medium text-white overflow-hidden",
        "bg-gradient-to-r from-cyan-500 to-purple-500",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400 before:to-purple-400 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${glowColor}`,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export const AnimatedButton = ({
  children,
  className,
  variant = "shimmer",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "shimmer" | "glow";
  [key: string]: any;
}) => {
  if (variant === "glow") {
    return (
      <GlowButton className={className} {...props}>
        {children}
      </GlowButton>
    );
  }

  return (
    <ShimmerButton className={className} {...props}>
      {children}
    </ShimmerButton>
  );
};
