import { useState, useEffect, useRef } from "react";

/**
 * Parses numeric value, prefix, suffix, and decimals from either a number or formatted string.
 * Examples:
 *   800 -> { num: 800, prefix: "", suffix: "", decimals: 0 }
 *   "69%" -> { num: 69, prefix: "", suffix: "%", decimals: 0 }
 *   "₹30,204" -> { num: 30204, prefix: "₹", suffix: "", decimals: 0 }
 *   "₹29,976 / mo" -> { num: 29976, prefix: "₹", suffix: " / mo", decimals: 0 }
 *   "+18%" -> { num: 18, prefix: "+", suffix: "%", decimals: 0 }
 *   "4.5%" -> { num: 4.5, prefix: "", suffix: "%", decimals: 1 }
 *   "—" -> null
 */
export function parseCountUpValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") {
    if (isNaN(val)) return null;
    return {
      num: val,
      prefix: "",
      suffix: "",
      decimals: Number.isInteger(val) ? 0 : (String(val).split(".")[1]?.length || 2)
    };
  }
  const str = String(val).trim();
  if (!str || str === "—" || str === "-" || str === "N/A" || str.toLowerCase() === "null") {
    return null;
  }

  // Matches optional prefix (like ₹, $, +), the number (with optional commas and decimals), and trailing suffix (like %, / mo)
  const match = str.match(/^([^\d\-+]*)([\-+]?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  let prefix = match[1] || "";
  let rawNum = match[2];
  const suffix = match[3] || "";

  if (rawNum.startsWith("+")) {
    prefix = prefix + "+";
    rawNum = rawNum.slice(1);
  }

  const cleanNumStr = rawNum.replace(/,/g, "");
  const num = parseFloat(cleanNumStr);
  if (isNaN(num)) return null;

  const decMatch = rawNum.match(/\.(\d+)/);
  const decimals = decMatch ? decMatch[1].length : 0;

  return { num, prefix, suffix, decimals };
}

/**
 * Formats a number using the Indian numbering system (lakhs/crores comma grouping)
 * while preserving requested decimal places.
 */
export function formatNumberWithIndianSeparators(num, decimals = 0) {
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * React hook to animate a numerical value from 0 (or previous value) to target value.
 * Uses requestAnimationFrame with an easeOut cubic curve over ~1.6-1.8 seconds.
 */
export function useCountUp(value, options = {}) {
  const {
    duration = 1750,
    prefix: customPrefix,
    suffix: customSuffix,
    decimals: customDecimals
  } = options;

  const parsed = parseCountUpValue(value);
  const prevTargetRef = useRef(null);
  const currentNumRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  const getFormattedString = (n, p) => {
    const dec = customDecimals !== undefined ? customDecimals : (p ? p.decimals : 0);
    const pref = customPrefix !== undefined ? customPrefix : (p ? p.prefix : "");
    const suff = customSuffix !== undefined ? customSuffix : (p ? p.suffix : "");
    return `${pref}${formatNumberWithIndianSeparators(n, dec)}${suff}`;
  };

  const [displayStr, setDisplayStr] = useState(() => {
    if (!parsed) return value ?? "—";

    // Respect prefers-reduced-motion accessibility setting
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentNumRef.current = parsed.num;
      hasAnimatedRef.current = true;
      return getFormattedString(parsed.num, parsed);
    }

    // Initial render displays formatted zero (e.g. "0", "0%", "₹0")
    return getFormattedString(0, parsed);
  });

  useEffect(() => {
    if (!parsed) {
      setDisplayStr(value ?? "—");
      return;
    }

    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentNumRef.current = parsed.num;
      setDisplayStr(getFormattedString(parsed.num, parsed));
      return;
    }

    // Determine start and end points
    const startVal = hasAnimatedRef.current ? currentNumRef.current : 0;
    const endVal = parsed.num;
    prevTargetRef.current = endVal;
    hasAnimatedRef.current = true;

    // If already at target value (e.g. was 0 and target is 0)
    if (startVal === endVal) {
      setDisplayStr(getFormattedString(endVal, parsed));
      return;
    }

    let animationFrameId;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;
      currentNumRef.current = current;

      if (progress < 1) {
        setDisplayStr(getFormattedString(current, parsed));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        currentNumRef.current = endVal;
        // Lock to exact final value
        setDisplayStr(getFormattedString(endVal, parsed));
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, customPrefix, customSuffix, customDecimals]);

  return displayStr;
}

/**
 * Reusable CountUp component.
 * Usage:
 *   <CountUp value={800} />
 *   <CountUp value="69%" />
 *   <CountUp value="₹30,204" />
 *   <CountUp value={69} suffix="%" />
 *   <CountUp value={30204} prefix="₹" />
 */
export default function CountUp({
  value,
  children,
  duration = 1750,
  prefix,
  suffix,
  decimals,
  className,
  style,
  as: Component = "span"
}) {
  const actualValue = value !== undefined ? value : children;
  const animatedText = useCountUp(actualValue, {
    duration,
    prefix,
    suffix,
    decimals
  });

  return (
    <Component className={className} style={style}>
      {animatedText}
    </Component>
  );
}
