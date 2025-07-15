"use client";
interface RollResultState {
  success: boolean;
  message: string;
  roll: number;
  statValue: number;
  total: number;
  target: number;
}
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
  const { state, dispatch, eventLog, logEvent, acknowledgeBriefing } = useGameState();
  const [showBriefing, setShowBriefing] = useState(false);
  const [rollResult, setRollResult] = useState<RollResultState | null>(null);
  // ...

// 1. Safely get values from the game state, providing default fallbacks.
const missedItems = state.missedChecklistItems || [];
const bonusPoints = state.bonusPoints ?? 0;
// Uses optional chaining `?.` AND a fallback, making it very safe.
const characterPreparedness = state.character?.preparedness ?? 0; 

// 2. Now, perform calculations using only our safe variables.
const preparednessPenalty = missedItems.length;
const finalAdjustment = bonusPoints - preparednessPenalty;
const finalPreparedness = characterPreparedness - preparednessPenalty;

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
    <div className="grid gap-6 lg:grid-cols-2">
      {/* This is the main content column */}
      <div className="col-span-2 space-y-6">
        {/* First, check if the initial briefing has been acknowledged */}
        {!state.briefingAcknowledged ? (
          // If not, show the standby/initial report screens
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
          // If briefing IS acknowledged, then we start the checklist/prompt/actions logic
          <>
            {!state.checklistComplete ? (
              // 1. If checklist is not complete, show it.
              <PreDepartureChecklist />
            ) : state.promptQueue.length > 0 ? (
              // 2. ELSE IF there are prompts, show the active prompt.
              (() => {
                const activePromptId = state.promptQueue[0];
                const prompt = phase0.itemPrompts[activePromptId];
                if (!prompt) return <p>Error: Unknown prompt ID '{activePromptId}'</p>;

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>{prompt.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{prompt.text}</p>
                          {rollResult ? (
                            // If there's a result, show it and a "Continue" button
                            <div>
                          <Alert variant={rollResult.success ? 'default' : 'destructive'}>
                            <AlertTitle className="font-bold text-lg">
                              {rollResult.success ? "Success!" : "Failure"}
                            </AlertTitle>
                            <AlertDescription className="space-y-2">
                              {/* This is the calculation breakdown */}
                              <div className="p-2 bg-muted/50 rounded-md text-center font-mono text-lg">
                                <span>{rollResult.roll}</span>
                                <span className="text-muted-foreground mx-1">(Roll)</span>
                                <span>+</span>
                                <span className="mx-1">{rollResult.statValue}</span>
                                <span className="text-muted-foreground">(Prep)</span>
                                <span>=</span>
                                <span className="font-bold text-xl ml-2">{rollResult.total}</span>
                              </div>
                              <p>Your total of <strong>{rollResult.total}</strong> was {rollResult.success ? 'greater than or equal to' : 'less than'} the target of <strong>{rollResult.target}</strong>.</p>
                              {/* This is the story outcome message */}
                              <p className="pt-2 border-t">{rollResult.message}</p>
                            </AlertDescription>
                          </Alert>
                              <Button
                                className="mt-4 w-full"
                                onClick={() => {
                                  setRollResult(null); // Clear the result
                                  dispatch({ type: 'SHIFT_PROMPT_QUEUE' }); // NOW move to the next prompt
                                }}
                              >
                                Continue
                              </Button>
                            </div>
                          ) : (
                            <DiceRoller
                              key={activePromptId}
                              sides={12}
                            onRoll={(roll) => {
                              const targetNumber = 10; // The Difficulty Class (DC) to beat
                              const statValue = state.character?.preparedness ?? 0;
                              const total = roll + statValue;
                              const success = total >= targetNumber;
                              const outcome = success ? prompt.outcomes.success : prompt.outcomes.failure;

                              // Log the simple message to the event log as before
                              logEvent(outcome.logMessage);

                              if (outcome.timeCost > 0) {
                                dispatch({ type: 'ADD_TIME', payload: outcome.timeCost });
                              }

                              // Save the FULL breakdown of the roll into our state
                              setRollResult({
                                success,
                                message: outcome.logMessage,
                                roll,
                                statValue,
                                total,
                                target: targetNumber,
                              });
                            }}
                            >
                              {prompt.buttonText} (vs. Preparedness)
                            </DiceRoller>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()

            ) : (
              // 3. ONLY IF all prompts are done, show the final actions.
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><BellRing className="text-destructive"/> Phase 0: Office Briefing & Departure Prep</CardTitle>
                    <CardDescription>{phase0.initialReport.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckSquare className="h-4 w-4"/>
                      <AlertTitle>All Preparations Complete</AlertTitle>
                      <AlertDescription>You've resolved all outstanding items. Time for final actions.</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Pre-Departure Actions & Rolls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {phase0.postChecklistActions.map((action) => (
                      <div key={action.id} className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        {action.type === 'BUTTON' && ( <Button onClick={() => logEvent(action.logMessage)}>{action.buttonText}</Button> )}
                        {action.type === 'DICE_ROLL' && ( <DiceRoller sides={action.sides} onRoll={(roll) => logEvent(action.logMessage.replace('{roll}', roll.toString()))}>{action.buttonText}</DiceRoller> )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
            {/* This is the Event Log, it shows up after the briefing is acknowledged */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Event Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* ... event log content ... */}
                </CardContent>
            </Card>
          </>
        )}
      </div>

      
    </div>
  );
}