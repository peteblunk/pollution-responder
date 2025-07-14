"use client";

import { phase0 } from '@/scenario/phase0'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameState } from "@/hooks/use-game-state";
import { DiceRoller } from "@/components/dice-roller";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LifeBuoy, Ship, User, Wind, Phone, CheckSquare, ShieldAlert, BellRing, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { PreDepartureChecklist } from "@/components/pre-departure-checklist";

// ✅ Single, correct function definition
export default function DashboardPage() {
  // ✅ All hooks and variables are declared once at the top of the component
  const { state, eventLog, logEvent, acknowledgeBriefing } = useGameState();
  const [showBriefing, setShowBriefing] = useState(false);
  
  const requiredItemsIds = ['ppe', 'equipment', 'clothing', 'sample-kit', 'paperwork', 'other', 'calls', 'jurisdiction'];
  const missedRequiredItemsCount = (state?.missedChecklistItems || []).filter(id => requiredItemsIds.includes(id)).length;
  const preparednessPenalty = missedRequiredItemsCount;
  const finalPreparedness = state.character.preparedness - preparednessPenalty;

  useEffect(() => {
    if (state.characterLocked && !state.briefingAcknowledged && !showBriefing) {
      const timer = setTimeout(() => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
          console.error("Could not play audio alert", e);
        }
        
        setShowBriefing(true);
        logEvent("Initial incident report received.");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.characterLocked, state.briefingAcknowledged, showBriefing, logEvent]);

  if (!state.characterLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Character Not Created</CardTitle>
            <CardDescription>Please create and save your character before starting the scenario.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/character">Create Character</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Main layout when character is locked
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {!state.briefingAcknowledged ? (
          !showBriefing ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">On Standby</CardTitle>
                  <CardDescription>Awaiting dispatch from the Command Center.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Your shift has just begun...</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BellRing className="text-destructive animate-pulse" /> {phase0.initialReport.title}</CardTitle>
                <CardDescription>{phase0.initialReport.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <Wind className="h-4 w-4" />
                  <AlertTitle>Initial Briefing</AlertTitle>
                  <AlertDescription>{phase0.initialReport.alert}</AlertDescription>
                </Alert>
                <div className="mt-4 text-center">
                  <Button onClick={() => { acknowledgeBriefing(); logEvent("Briefing acknowledged. Preparing for departure.")}}>
                    Message Received
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <>
            {!state.checklistComplete ? (
              <PreDepartureChecklist />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><BellRing className="text-destructive"/> Phase 0: Office Briefing & Departure Prep</CardTitle>
                    <CardDescription>
                      {phase0.initialReport.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckSquare className="h-4 w-4"/>
                      <AlertTitle>Checklist Complete</AlertTitle>
                      <AlertDescription>You&apos;ve finalized your preparations. Time to see if you&apos;re ready for the road.</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Pre-Departure Actions & Rolls</CardTitle>
                  </CardHeader>
                      <CardContent className="space-y-4">
                        {/* We map over the actions from our scenario file */}
                        {phase0.postChecklistActions.map((action) => (
                          <div key={action.id} className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">{action.title}</h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>

                            {/* Conditionally render a Button or a DiceRoller based on the action type */}
                            {action.type === 'BUTTON' && (
                              <Button onClick={() => logEvent(action.logMessage)}>
                                {action.buttonText}
                              </Button>
                            )}

                            {action.type === 'DICE_ROLL' && (
                              <DiceRoller
                                sides={action.sides}
                                onRoll={(roll) => logEvent(action.logMessage.replace('{roll}', roll.toString()))}
                              >
                                {action.buttonText}
                              </DiceRoller>
                            )}
                          </div>
                        ))}
                      </CardContent>
                </Card>
              </>
            )}
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
          </>
        )}
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
            {state.checklistComplete && preparednessPenalty > 0 && (
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