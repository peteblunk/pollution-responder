
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useGameState } from "@/hooks/use-game-state";
import { DiceRoller } from "@/components/dice-roller";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, LifeBuoy, Ship, User, Wind, ClipboardCheck, Phone, CheckSquare, Edit3, ShieldAlert, ArrowRight, BellRing, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const requiredItemsIds = ['ppe', 'equipment', 'clothing', 'sample-kit', 'paperwork', 'other', 'calls', 'jurisdiction'];

export default function DashboardPage() {
  const { state, eventLog, logEvent } = useGameState();
  const [showBriefing, setShowBriefing] = useState(false);

  const missedRequiredItemsCount = (state?.missedChecklistItems || []).filter(id => requiredItemsIds.includes(id)).length;
  const preparednessPenalty = missedRequiredItemsCount;
  const finalPreparedness = state.character.preparedness - preparednessPenalty;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Play a simple alert sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2); // Beep for 0.2s
      } catch (e) {
        console.error("Could not play audio alert", e);
      }
      
      setShowBriefing(true);
      logEvent("Initial incident report received.");
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [logEvent]);

  if (!showBriefing) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Card className="max-w-md">
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">On Standby</CardTitle>
                      <CardDescription>Awaiting dispatch from the Command Center.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-10">
                      <Loader2 className="w-16 h-16 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Your shift has just begun...</p>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><BellRing className="text-destructive animate-pulse"/> Phase 0: Office Briefing & Departure Prep</CardTitle>
            <CardDescription>
              1000 Hours - The call just came in: 'Potential diesel fuel leak from a vessel moored at Pier 3 at a Marina in Smuggler’s Cove on the Kitsap Peninsula.'
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Wind className="h-4 w-4" />
              <AlertTitle>Initial Report</AlertTitle>
              <AlertDescription>
                You're the first responders. The Command Center is waiting for your initial report.
              </AlertDescription>
            </Alert>
            <p className="mt-4 text-base">
              Before you even step out the door, you need to be prepared. What's your quick checklist of things you need to confirm or do before you leave the office?
            </p>
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-headline text-lg flex items-center gap-2 mb-3"><ClipboardCheck/> Pre-Departure Checklist</h4>
                <p className="text-sm mb-4">
                    You take a moment to consider potential pre-departure hazards and plan your loadout. Use the whiteboard to make a checklist of everything you will need. You have four minutes.
                </p>
                <Button asChild>
                    <Link href="/whiteboard"><Edit3 className="mr-2"/> Open Whiteboard</Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pre-Departure Actions & Rolls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                    <div>
                        <h4 className="font-medium flex items-center gap-2"><Phone/>Duty Sup Check-in</h4>
                        <p className="text-sm text-muted-foreground">Report your departure and initial intentions.</p>
                    </div>
                    <Button onClick={() => logEvent("Successfully checked in with Duty Supervisor.")}>Check In</Button>
                </div>
                 <div className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                    <div>
                        <h4 className="font-medium flex items-center gap-2"><CheckSquare/>Sample Kit Check</h4>
                        <p className="text-sm text-muted-foreground">Confirm your sample kit is fully stocked.</p>
                    </div>
                    <DiceRoller sides={12} onRoll={(roll) => logEvent(`Rolled a ${roll} on Sample Kit check (2d6, using d12 for simplicity).`)}>Roll Preparedness</DiceRoller>
                </div>
                 <div className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                    <div>
                        <h4 className="font-medium flex items-center gap-2"><Ship/>Drive to Ferry</h4>
                        <p className="text-sm text-muted-foreground">Time to head out. Let's hope you don't forget anything.</p>
                    </div>
                    <DiceRoller sides={12} onRoll={(roll) => logEvent(`Rolled a ${roll} for departure (Luck/Preparedness).`)}>Roll for Departure</DiceRoller>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Event Log</CardTitle>
                <CardDescription>A log of your decisions and their outcomes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {eventLog.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events yet. Make your first move!</p>
                    ) : (
                        [...eventLog].reverse().map((log, index) => (
                            <div key={index} className="text-sm">{log}</div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><User /> Your Character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Skill: {state.character.skill}</label>
              <Progress value={state.character.skill * 10} max={100} className="h-2"/>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Preparedness: {finalPreparedness}</label>
                {preparednessPenalty > 0 && (
                  <span className="text-sm font-bold text-destructive">(-{preparednessPenalty})</span>
                )}
              </div>
              <Progress value={finalPreparedness * 10} max={100} className="h-2"/>
            </div>
            <div>
              <label className="text-sm font-medium">Luck: {state.character.luck}</label>
              <Progress value={state.character.luck * 10} max={100} className="h-2"/>
            </div>
            {preparednessPenalty > 0 && (
              <Alert variant="destructive" className="border-destructive/50 text-destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Preparedness Penalty!</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  You missed {missedRequiredItemsCount} required item(s) on your checklist, resulting in a -{preparednessPenalty} penalty to your Preparedness for this phase.
                </AlertDescription>
              </Alert>
            )}
             <Button asChild variant="outline" className="w-full">
                <Link href="/character">View Full Sheet</Link>
             </Button>
          </CardContent>
        </Card>
        <Card className="bg-uscg-blue text-white">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 border-b border-white/20 pb-2"><LifeBuoy /> Mission Objectives</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-50">
            <ul className="space-y-2 list-disc list-inside">
              <li>Contain the spill.</li>
              <li>Protect the marshland.</li>
              <li>Document the incident (ICS-201).</li>
              <li>Identify the responsible party.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
