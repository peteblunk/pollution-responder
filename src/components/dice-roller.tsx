"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiceRollerProps extends ButtonProps {
  onRoll: (result: number) => void;
  sides?: number;
}

export function DiceRoller({ children, onRoll, sides = 20, className, ...props }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleRoll = () => {
    setIsRolling(true);
    setResult(null);
    setTimeout(() => {
      const rollResult = Math.floor(Math.random() * sides) + 1;
      setResult(rollResult);
      onRoll(rollResult);
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleRoll} disabled={isRolling} className={cn("gap-2", className)} {...props}>
        <Dices className={cn("w-4 h-4", isRolling && "animate-spin")} />
        {children}
      </Button>
      {result !== null && (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Roll:</span>
            <span className="font-bold text-lg text-primary">{result}</span>
        </div>
      )}
    </div>
  );
}
