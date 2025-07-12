"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Character } from "@/lib/game-state";
import { Input } from "@/components/ui/input";
import { Zap, Shield, Dices, Save } from "lucide-react";

export default function CharacterPage() {
  const { state, updateCharacter } = useGameState();
  const [character, setCharacter] = useState<Character>(state.character);
  const { toast } = useToast();

  useEffect(() => {
    setCharacter(state.character);
  }, [state.character]);
  
  const totalPoints = character.skill + character.preparedness + character.luck;
  const maxPoints = 150;

  const handleSave = () => {
    if (totalPoints > maxPoints) {
      toast({
        variant: "destructive",
        title: "Too many points!",
        description: `You can only allocate a total of ${maxPoints} points.`,
      });
      return;
    }
    updateCharacter(character);
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
            Define your character's abilities. Your stats influence dice rolls and scenario outcomes. You have a total of {maxPoints} points to distribute.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={character.name} onChange={(e) => setCharacter(c => ({...c, name: e.target.value}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="rank">Rank / Title</Label>
                    <Input id="rank" value={character.rank} onChange={(e) => setCharacter(c => ({...c, rank: e.target.value}))} />
                </div>
            </div>

          <div className="space-y-2">
            <Label htmlFor="skill" className="flex items-center gap-2 text-lg font-headline"><Zap className="text-primary"/> Skill ({character.skill})</Label>
            <p className="text-sm text-muted-foreground">Represents your training, knowledge, and technical proficiency in handling equipment and procedures.</p>
            <Slider
              id="skill"
              min={0}
              max={100}
              value={[character.skill]}
              onValueChange={(value) => setCharacter(c => ({...c, skill: value[0]}))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preparedness" className="flex items-center gap-2 text-lg font-headline"><Shield className="text-primary"/> Preparedness ({character.preparedness})</Label>
            <p className="text-sm text-muted-foreground">Reflects your readiness, including gear maintenance, physical condition, and prior planning.</p>
            <Slider
              id="preparedness"
              min={0}
              max={100}
              value={[character.preparedness]}
              onValueChange={(value) => setCharacter(c => ({...c, preparedness: value[0]}))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="luck" className="flex items-center gap-2 text-lg font-headline"><Dices className="text-primary"/> Luck ({character.luck})</Label>
            <p className="text-sm text-muted-foreground">The element of chance. Good luck might turn a bad roll into a success, while bad luck can do the opposite.</p>
            <Slider
              id="luck"
              min={0}
              max={100}
              value={[character.luck]}
              onValueChange={(value) => setCharacter(c => ({...c, luck: value[0]}))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className={`font-bold text-lg ${totalPoints > maxPoints ? 'text-destructive' : ''}`}>
            Total Points: {totalPoints} / {maxPoints}
          </div>
          <Button onClick={handleSave} disabled={totalPoints > maxPoints}>
            <Save className="mr-2"/> Save Character
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
