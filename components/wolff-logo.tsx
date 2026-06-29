import Image from "next/image";
import { cn } from "@/lib/utils";

export function WolffLogo({
  className,
  width = 160,
  height = 116,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/wolff-logo.png"
      alt="WOLFF Medicina del Deporte"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
