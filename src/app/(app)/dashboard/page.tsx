"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useGameState } from "@/hooks/use-game-state";
import { DiceRoller } from "@/components/dice-roller";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, LifeBuoy, Ship, User, Wind } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { state, eventLog } = useGameState();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Current Scenario: The Spill at Pier 7</CardTitle>
            <CardDescription>
              08:00 - A report comes in of a significant diesel spill from the M/V Coastal Navigator during bunkering operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Wind className="h-4 w-4" />
              <AlertTitle>Weather Conditions</AlertTitle>
              <AlertDescription>
                Clear skies, wind 15 knots from NW, 1-2 ft seas. Tide is outgoing.
              </AlertDescription>
            </Alert>
            <p className="mt-4 text-base">
              You are the first responder on scene. The vessel's crew has deployed a small boom, but it's clearly insufficient. The air is thick with fumes, and a growing rainbow sheen is spreading rapidly towards a sensitive marshland.
            </p>
            <p className="mt-2 text-base font-bold">What is your first action?</p>
          </CardContent>
          <CardFooter className="gap-4">
            <DiceRoller onRoll={(result) => console.log('Action roll:', result)}>
              Establish Command Post
            </DiceRoller>
            <DiceRoller onRoll={(result) => console.log('Action roll:', result)}>
              Assess Spill Size
            </DiceRoller>
            <Button variant="destructive">
              Order Evacuation
            </Button>
          </CardFooter>
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
                        eventLog.map((log, index) => (
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
              <label className="text-sm font-medium">Skill</label>
              <Progress value={state.character.skill} className="h-2"/>
            </div>
            <div>
              <label className="text-sm font-medium">Preparedness</label>
              <Progress value={state.character.preparedness} className="h-2"/>
            </div>
            <div>
              <label className="text-sm font-medium">Luck</label>
              <Progress value={state.character.luck} className="h-2"/>
            </div>
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
