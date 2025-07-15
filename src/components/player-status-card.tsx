"use client";

import { useGameState } from "@/hooks/use-game-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, ShieldAlert } from "lucide-react";

export function PlayerStatusCard() {
  const { state } = useGameState();

  // --- All the calculations now live safely inside this component ---
  const missedItems = state.missedChecklistItems || [];
  const bonusPoints = state.bonusPoints ?? 0;
  const characterPreparedness = state.character?.preparedness ?? 0;

  const preparednessPenalty = missedItems.length;
  const finalAdjustment = bonusPoints - preparednessPenalty;
  const finalPreparedness = characterPreparedness - preparednessPenalty;

  // Don't render the card if the character isn't locked in yet.
  if (!state.characterLocked) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <User /> Your Character
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Skill: {state.character?.skill ?? 0}</label>
          <Progress value={(state.character?.skill ?? 0) * 10} max={100} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Preparedness: {finalPreparedness}</label>
            {preparednessPenalty > 0 && (
              <span className="text-sm font-bold text-destructive">(-{preparednessPenalty})</span>
            )}
          </div>
          <Progress value={finalPreparedness * 10} max={100} className="h-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Luck: {state.character?.luck ?? 0}</label>
          <Progress value={(state.character?.luck ?? 0) * 10} max={100} className="h-2" />
        </div>
        
        {state.checklistComplete && finalAdjustment !== 0 && (
          <Alert variant={finalAdjustment < 0 ? "destructive" : "default"}>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Preparedness Adjustment</AlertTitle>
            <AlertDescription>
              You missed {preparednessPenalty} required item(s) but remembered {bonusPoints} bonus item(s).
              Your Preparedness has been adjusted by <strong className={finalAdjustment < 0 ? 'text-destructive' : 'text-green-600'}>{finalAdjustment > 0 ? `+${finalAdjustment}` : finalAdjustment}</strong> for this phase.
            </AlertDescription>
          </Alert>
        )}
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/character">View Full Sheet</Link>
        </Button>
      </CardContent>
    </Card>
  );
}