
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import type { Character, CharacterCreationState } from "@/lib/game-state";
import { Input } from "@/components/ui/input";
import { Zap, Shield, Dices, Save, Award, GraduationCap, Ship, Anchor, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export default function CharacterPage() {
  const { state, updateCharacter, updateCharacterCreationState } = useGameState();
  const [character, setCharacter] = useState<Character>(state.character);
  const [creationState, setCreationState] = useState<CharacterCreationState>(state.characterCreation);
  
  const { toast } = useToast();

  useEffect(() => {
    setCharacter(state.character);
    setCreationState(state.characterCreation);
  }, [state.character, state.characterCreation]);
  
  const handleRoll = (field: 'skillRoll' | 'preparednessRoll') => {
      setCreationState(s => ({...s, [field]: rollD6()}));
  }

  const handleNumericChange = (field: keyof CharacterCreationState, value: string) => {
    const numValue = parseInt(value, 10);
    setCreationState(s => ({...s, [field]: isNaN(numValue) ? 0 : numValue}));
  }

  const { skill, preparedness, luck } = useMemo(() => {
    let skill = 0;
    if (creationState.qualification === 'qualified') {
        skill += 3 + (creationState.skillRoll || 0);
    } else {
        skill += (creationState.skillRoll || 0);
    }
    if (creationState.hasMarineSafetyPin) skill += 1;
    if (creationState.isMSTHonorGrad) skill += 1;
    if (creationState.isOcsGrad) skill -= 1;

    let preparedness = 0;
    if (creationState.readiness === 'allGreen') {
        preparedness += 2 + (creationState.preparednessRoll || 0);
    } else {
        preparedness += (creationState.preparednessRoll || 0);
    }
    preparedness -= (creationState.readinessMetricsNotGreen || 0);
    if (creationState.isOcsGrad) preparedness += 1;

    let luck = 0;
    luck += creationState.involuntaryDeployments;
    luck += creationState.lettersOfCommendation;
    luck += creationState.achievementMedals * 2;
    if (creationState.isRepoY) luck += 2;
    if (creationState.hasChallengeCoin) luck += 1;

    return { skill, preparedness, luck };

  }, [creationState]);
  
  const handleSave = () => {
    const finalCharacter: Character = {
      name: character.name,
      rank: character.rank,
      skill,
      preparedness,
      luck,
    };
    updateCharacter(finalCharacter);
    updateCharacterCreationState(creationState);
    toast({
      title: "Character Saved",
      description: "Your stats have been updated successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Responder Stat Sheet</CardTitle>
          <CardDescription>
            Answer the following questions to generate your character's stats based on your real-world experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={character.name} onChange={(e) => setCharacter(c => ({...c, name: e.target.value}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="rank">Designation / Rank</Label>
                    <Input id="rank" value={character.rank} onChange={(e) => setCharacter(c => ({...c, rank: e.target.value}))} />
                </div>
            </div>

            <Separator />

            {/* SKILL SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Zap className="text-primary"/> Skill (Operational Proficiency)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <Label>Pollution Responder Qualification</Label>
                <RadioGroup value={creationState.qualification} onValueChange={(v) => setCreationState(s => ({...s, qualification: v as any, skillRoll: 0}))}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="qualified" id="q-qual" /><Label htmlFor="q-qual">Qualified Pollution Responder</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="unqualified" id="q-unqual" /><Label htmlFor="q-unqual">Unqualified Pollution Responder</Label></div>
                </RadioGroup>
                <div className="flex items-center gap-4">
                  <Button onClick={() => handleRoll('skillRoll')}>Roll 1d6</Button>
                  {creationState.skillRoll > 0 && <p>Base: {creationState.qualification === 'qualified' ? '3 + ' : ''}{creationState.skillRoll} = <strong>{creationState.qualification === 'qualified' ? 3 + creationState.skillRoll : creationState.skillRoll}</strong></p>}
                </div>
                <Label>Adjustments</Label>
                <div className="space-y-2 pl-2">
                  <div className="flex items-center space-x-2"><Checkbox id="pin" checked={creationState.hasMarineSafetyPin} onCheckedChange={c => setCreationState(s => ({...s, hasMarineSafetyPin: !!c}))} /><Label htmlFor="pin" className="font-normal flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> Marine Safety Pin (+1)</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="honor" checked={creationState.isMSTHonorGrad} onCheckedChange={c => setCreationState(s => ({...s, isMSTHonorGrad: !!c}))} /><Label htmlFor="honor" className="font-normal flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground"/> MST "A" School Honor Graduate (+1)</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="ocs" checked={creationState.isOcsGrad} onCheckedChange={c => setCreationState(s => ({...s, isOcsGrad: !!c}))} /><Label htmlFor="ocs" className="font-normal flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground"/> OCS Grad (-1 Skill, +1 Preparedness)</Label></div>
                </div>
              </div>
            </div>

            {/* PREPAREDNESS SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Shield className="text-primary"/> Preparedness (Foresight & Readiness)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <Label>Readiness Status</Label>
                <RadioGroup value={creationState.readiness} onValueChange={(v) => setCreationState(s => ({...s, readiness: v as any, preparednessRoll: 0, readinessMetricsNotGreen: 0}))}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="allGreen" id="r-green" /><Label htmlFor="r-green">All Readiness Metrics "Green"</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="notAllGreen" id="r-notgreen" /><Label htmlFor="r-notgreen">Not All Metrics "Green"</Label></div>
                </RadioGroup>
                {creationState.readiness === 'notAllGreen' && (
                    <div className="pl-6 space-y-2">
                         <Label htmlFor="readiness-metrics">How many metrics are not "Green"? (-1 each)</Label>
                         <Input id="readiness-metrics" type="number" min="0" className="w-24" value={creationState.readinessMetricsNotGreen} onChange={(e) => handleNumericChange('readinessMetricsNotGreen', e.target.value)} />
                    </div>
                )}
                <div className="flex items-center gap-4">
                  <Button onClick={() => handleRoll('preparednessRoll')}>Roll 1d6</Button>
                  {creationState.preparednessRoll > 0 && <p>Base: {creationState.readiness === 'allGreen' ? '2 + ' : ''}{creationState.preparednessRoll} = <strong>{creationState.readiness === 'allGreen' ? 2 + creationState.preparednessRoll : creationState.preparednessRoll}</strong></p>}
                </div>
              </div>
            </div>

            {/* LUCK SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Dices className="text-primary"/> Luck (Serendipity & Fortune)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="deployments" className="flex items-center gap-2"><Ship className="w-4 h-4 text-muted-foreground"/> Involuntary Deployments (+1 each)</Label><Input id="deployments" type="number" min="0" value={creationState.involuntaryDeployments} onChange={(e) => handleNumericChange('involuntaryDeployments', e.target.value)}/></div>
                  <div className="space-y-2"><Label htmlFor="loc" className="flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> Letters of Commendation (+1 each)</Label><Input id="loc" type="number" min="0" value={creationState.lettersOfCommendation} onChange={(e) => handleNumericChange('lettersOfCommendation', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="cgam" className="flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> CG Achievement Medals (+2 each)</Label><Input id="cgam" type="number" min="0" value={creationState.achievementMedals} onChange={(e) => handleNumericChange('achievementMedals', e.target.value)} /></div>
                </div>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2"><Checkbox id="repoy" checked={creationState.isRepoY} onCheckedChange={c => setCreationState(s => ({...s, isRepoY: !!c}))} /><Label htmlFor="repoy" className="font-normal flex items-center gap-2"><Anchor className="w-4 h-4 text-muted-foreground"/> Sector Puget Sound REPOY (+2)</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="coin" checked={creationState.hasChallengeCoin} onCheckedChange={c => setCreationState(s => ({...s, hasChallengeCoin: !!c}))} /><Label htmlFor="coin" className="font-normal flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground"/> Holder of Sector Puget Sound Reserve Team 2 Challenge Coin (+1)</Label></div>
                </div>
              </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-6 font-bold text-lg">
            <span>Skill: {skill}</span>
            <span>Preparedness: {preparedness}</span>
            <span>Luck: {luck}</span>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2"/> Save Character
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
