
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { Character, CharacterCreationState } from "@/lib/game-state";
import { Input } from "@/components/ui/input";
import { Zap, Shield, Dices, Save, Award, GraduationCap, Ship, Anchor, CheckCircle, Wand2, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

const rollD6 = () => Math.floor(Math.random() * 6) + 1;
const randomBool = () => Math.random() < 0.5;
const randomInt = (max: number) => Math.floor(Math.random() * (max + 1));

export default function CharacterPage() {
  const { state, updateCharacter, updateCharacterCreationState, lockCharacter } = useGameState();
  const [character, setCharacter] = useState<Character>(state.character);
  const [creationState, setCreationState] = useState<CharacterCreationState>(state.characterCreation);
  const [unitName, setUnitName] = useState(state.character.unitName || '');
  const isLocked = state.characterLocked;
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setCharacter(state.character);
    setCreationState(state.characterCreation);
    setUnitName(state.character.unitName || '');
  }, [state.character, state.characterCreation]);
  
  const handleRoll = (field: 'skillRoll' | 'preparednessRoll') => {
      if (isLocked) return;
      setCreationState(s => ({...s, [field]: rollD6()}));
  }

  const handleNumericChange = (field: keyof CharacterCreationState, value: string) => {
    if (isLocked) return;
    const numValue = parseInt(value, 10);
    setCreationState(s => ({...s, [field]: isNaN(numValue) ? 0 : numValue}));
  }

  const handleRadioChange = (field: keyof CharacterCreationState, value: string) => {
    if (isLocked) return;
    setCreationState(s => ({...s, [field]: value as any, skillRoll: 0, preparednessRoll: 0}));
  }
  
  const handleCheckboxChange = (field: keyof CharacterCreationState, checked: boolean) => {
    if (isLocked) return;
    setCreationState(s => ({...s, [field]: checked}));
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

  const generateRandomCharacter = useCallback(() => {
    if (isLocked) return;
    const randomCreationState: CharacterCreationState = {
      qualification: randomBool() ? 'qualified' : 'unqualified',
      skillRoll: rollD6(),
      hasMarineSafetyPin: randomBool(),
      isMSTHonorGrad: Math.random() < 0.2,
      isOcsGrad: Math.random() < 0.1,
      readiness: randomBool() ? 'allGreen' : 'notAllGreen',
      preparednessRoll: rollD6(),
      readinessMetricsNotGreen: randomInt(3),
      involuntaryDeployments: randomInt(2),
      lettersOfCommendation: randomInt(3),
      achievementMedals: randomInt(2),
      isRepoY: Math.random() < 0.1,
      hasChallengeCoin: randomBool(),
    };

    setCharacter({
        name: "Random Responder",
        rank: "MST2",
        skill: 0,
        preparedness: 0,
        luck: 0,
        unitName: "Sector Hiatusport"
    });
    setUnitName("Sector Hiatusport");
    setCreationState(randomCreationState);

    toast({
        title: "Random Responder Generated!",
        description: "Review your new character's stats or save to continue."
    });
  }, [isLocked, toast]);
  
  const handleSave = () => {
    if (isLocked) return;
    const finalCharacter: Character = {
      name: character.name,
      unitName: unitName,
      rank: character.rank,
      skill,
      preparedness,
      luck,
    };
    updateCharacter(finalCharacter);
    updateCharacterCreationState(creationState);
    lockCharacter();
    toast({
      title: "Character Saved & Locked",
      description: "Your stats have been finalized. Time to start the scenario!",
    });
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">Responder Stat Sheet</CardTitle>
              <CardDescription>
                {isLocked
                  ? "Your character sheet is locked. View your stats below."
                  : "Answer the questions to generate your stats or create a random one."}
              </CardDescription>
            </div>
            {!isLocked && (
              <Button variant="outline" onClick={generateRandomCharacter}>
                <Wand2 className="mr-2"/> Generate Random Responder
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
            {isLocked && (
              <Alert variant="default" className="border-primary/50 text-primary-foreground bg-primary/90">
                <Lock className="h-4 w-4 !text-primary-foreground" />
                <AlertTitle>Character Locked</AlertTitle>
                <AlertDescription className="!text-primary-foreground/80">
                  Your character has been finalized. To create a new character, please logout and start over.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={character.name} onChange={(e) => setCharacter(c => ({...c, name: e.target.value}))} disabled={isLocked} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rank">Designation / Rank</Label>
                    <Input id="rank" value={character.rank} onChange={(e) => setCharacter(c => ({...c, rank: e.target.value}))} disabled={isLocked} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="unitName">Unit Name</Label>
                    <Input id="unitName" value={unitName} onChange={(e) => setUnitName(e.target.value)} disabled={isLocked}/>
                </div>
            </div>

            <Separator />

            {/* SKILL SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Zap className="text-primary"/> Skill (Operational Proficiency)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <Label>Pollution Responder Qualification</Label>
                <RadioGroup value={creationState.qualification} onValueChange={(v) => handleRadioChange('qualification', v)} disabled={isLocked}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="qualified" id="q-qual" /><Label htmlFor="q-qual">Qualified Pollution Responder</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="unqualified" id="q-unqual" /><Label htmlFor="q-unqual">Unqualified Pollution Responder</Label></div>
                </RadioGroup>
                <div className="flex items-center gap-4">
                  <Button onClick={() => handleRoll('skillRoll')} disabled={isLocked}>Roll 1d6</Button>
                  {creationState.skillRoll > 0 && <p>Base: {creationState.qualification === 'qualified' ? '3 + ' : ''}{creationState.skillRoll} = <strong>{creationState.qualification === 'qualified' ? 3 + creationState.skillRoll : creationState.skillRoll}</strong></p>}
                </div>
                <Label>Adjustments</Label>
                <div className="space-y-2 pl-2">
                  <div className="flex items-center space-x-2"><Checkbox id="pin" checked={creationState.hasMarineSafetyPin} onCheckedChange={c => handleCheckboxChange('hasMarineSafetyPin', !!c)} disabled={isLocked} /><Label htmlFor="pin" className="font-normal flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> Marine Safety Pin (+1)</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="honor" checked={creationState.isMSTHonorGrad} onCheckedChange={c => handleCheckboxChange('isMSTHonorGrad', !!c)} disabled={isLocked} /><Label htmlFor="honor" className="font-normal flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground"/> MST "A" School Honor Graduate (+1)</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="ocs" checked={creationState.isOcsGrad} onCheckedChange={c => handleCheckboxChange('isOcsGrad', !!c)} disabled={isLocked} /><Label htmlFor="ocs" className="font-normal flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground"/> OCS Grad (-1 Skill, +1 Preparedness)</Label></div>
                </div>
              </div>
            </div>

            {/* PREPAREDNESS SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Shield className="text-primary"/> Preparedness (Foresight & Readiness)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <Label>Readiness Status</Label>
                <RadioGroup value={creationState.readiness} onValueChange={(v) => handleRadioChange('readiness', v)} disabled={isLocked}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="allGreen" id="r-green" /><Label htmlFor="r-green">All Readiness Metrics "Green"</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="notAllGreen" id="r-notgreen" /><Label htmlFor="r-notgreen">Not All Metrics "Green"</Label></div>
                </RadioGroup>
                {creationState.readiness === 'notAllGreen' && (
                    <div className="pl-6 space-y-2">
                         <Label htmlFor="readiness-metrics">How many metrics are not "Green"? (-1 each)</Label>
                         <Input id="readiness-metrics" type="number" min="0" className="w-24" value={creationState.readinessMetricsNotGreen} onChange={(e) => handleNumericChange('readinessMetricsNotGreen', e.target.value)} disabled={isLocked} />
                    </div>
                )}
                <div className="flex items-center gap-4">
                  <Button onClick={() => handleRoll('preparednessRoll')} disabled={isLocked}>Roll 1d6</Button>
                  {creationState.preparednessRoll > 0 && <p>Base: {creationState.readiness === 'allGreen' ? '2 + ' : ''}{creationState.preparednessRoll} = <strong>{creationState.readiness === 'allGreen' ? 2 + creationState.preparednessRoll : creationState.preparednessRoll}</strong></p>}
                </div>
              </div>
            </div>

            {/* LUCK SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-headline"><Dices className="text-primary"/> Luck (Serendipity & Fortune)</h3>
              <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="deployments" className="flex items-center gap-2"><Ship className="w-4 h-4 text-muted-foreground"/> Involuntary Deployments (+1 each)</Label><Input id="deployments" type="number" min="0" value={creationState.involuntaryDeployments} onChange={(e) => handleNumericChange('involuntaryDeployments', e.target.value)} disabled={isLocked}/></div>
                  <div className="space-y-2"><Label htmlFor="loc" className="flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> Letters of Commendation (+1 each)</Label><Input id="loc" type="number" min="0" value={creationState.lettersOfCommendation} onChange={(e) => handleNumericChange('lettersOfCommendation', e.target.value)} disabled={isLocked} /></div>
                  <div className="space-y-2"><Label htmlFor="cgam" className="flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> CG Achievement Medals (+2 each)</Label><Input id="cgam" type="number" min="0" value={creationState.achievementMedals} onChange={(e) => handleNumericChange('achievementMedals', e.target.value)} disabled={isLocked} /></div>
                </div>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2"><Checkbox id="repoy" checked={creationState.isRepoY} onCheckedChange={c => handleCheckboxChange('isRepoY', !!c)} disabled={isLocked} /><Label htmlFor="repoy" className="font-normal flex items-center gap-2"><Anchor className="w-4 h-4 text-muted-foreground"/> Sector Puget Sound REPOY (+2)</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="coin" checked={creationState.hasChallengeCoin} onCheckedChange={c => handleCheckboxChange('hasChallengeCoin', !!c)} disabled={isLocked} /><Label htmlFor="coin" className="font-normal flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground"/> Holder of Sector Puget Sound Reserve Team 2 Challenge Coin (+1)</Label></div>
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
          {!isLocked && (
            <Button onClick={handleSave}>
              <Save className="mr-2"/> Save and Continue to Dashboard <ArrowRight/>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
