"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface SlotNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function SlotNumber({ 
  value, 
  suffix = "", 
  prefix = "",
  decimals = 0,
  className = "" 
}: SlotNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    animateToValue(value);
  }, [value]);

  const animateToValue = (target: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const start = displayValue;
    const diff = target - start;
    const duration = 1500;
    const steps = 60;
    const increment = diff / steps;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3); 
      
      setDisplayValue(start + diff * eased);

      if (current >= steps) {
        setDisplayValue(target);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, duration / steps);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    
    intervalRef.current = setInterval(() => {
      setDisplayValue(Math.random() * value * 1.5);
    }, 50);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    animateToValue(targetRef.current);
  };

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.round(num).toLocaleString();
  };

  return (
    <motion.span
      className={`inline-block tabular-nums cursor-default ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </motion.span>
  );
}
