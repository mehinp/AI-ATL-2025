import { useEffect, useRef, useState } from "react";

type FlashDirection = "" | "flash-up" | "flash-down";

export function usePriceFlash(value: number | string | null | undefined, duration = 800) {
  const [flashClass, setFlashClass] = useState<FlashDirection>("");
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const numeric =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : null;

    if (!Number.isFinite(numeric ?? NaN)) {
      return;
    }

    if (previous.current === null) {
      previous.current = numeric!;
      return;
    }

    if (numeric === previous.current) {
      return;
    }

    const nextClass: FlashDirection = numeric! > previous.current ? "flash-up" : "flash-down";
    previous.current = numeric!;
    setFlashClass(nextClass);

    const timeout = setTimeout(() => setFlashClass(""), duration);
    return () => clearTimeout(timeout);
  }, [value, duration]);

  return flashClass;
}
