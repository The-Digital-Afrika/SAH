"use client";

import { useEffect, useRef, useState } from "react";

type ReadMoreTextProps = {
  children: string;
  className?: string;
};

export default function ReadMoreText({ children, className }: ReadMoreTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const text = textRef.current;

    if (!text) return;

    const measure = () => {
      const styles = window.getComputedStyle(text);
      const lineHeight = Number.parseFloat(styles.lineHeight);
      const twoLineHeight = lineHeight * 2;

      setCanExpand(text.scrollHeight > twoLineHeight + 1);
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [children]);

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={`magazine-description__text${
          canExpand && !expanded ? " magazine-description__text--collapsed" : ""
        }`}
      >
        {children}
      </p>
      {canExpand ? (
        <button
          className="magazine-description__toggle"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}
