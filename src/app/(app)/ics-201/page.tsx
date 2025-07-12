"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import type { ICS201 } from "@/lib/game-state";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function ICS201Page() {
    const { state, updateICS201 } = useGameState();
    const [form, setForm] = useState<ICS201>(state.ics201);
    const { toast } = useToast();

    useEffect(() => {
        setForm(state.ics201);
    }, [state.ics201]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        updateICS201(form);
        toast({
            title: "ICS-201 Saved",
            description: "The incident briefing has been updated.",
        });
    };

    return (
        <Card className="max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">ICS 201: Incident Briefing</CardTitle>
                <CardDescription>This form provides the Incident Commander with essential information. It is pre-populated based on game events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="incidentName">1. Incident Name</Label>
                        <Input id="incidentName" name="incidentName" value={form.incidentName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">2. Date Prepared</Label>
                        <Input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">3. Time Prepared</Label>
                        <Input id="time" name="time" type="time" value={form.time} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="operationalPeriod">4. Operational Period</Label>
                        <Input id="operationalPeriod" name="operationalPeriod" value={form.operationalPeriod} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="situationSummary">5. Current Situation Summary</Label>
                    <Textarea id="situationSummary" name="situationSummary" rows={5} value={form.situationSummary} onChange={handleChange} placeholder="Describe the current situation, including threats, size, and spread..." />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="objectives">6. Current Objectives</Label>
                    <Textarea id="objectives" name="objectives" rows={4} value={form.objectives} onChange={handleChange} placeholder="List the primary objectives for the current operational period..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="resourcesSummary">7. Current Organization & Resources Summary</Label>
                        <Textarea id="resourcesSummary" name="resourcesSummary" rows={6} value={form.resourcesSummary} onChange={handleChange} placeholder="List on-scene and ordered resources..." />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="actionsSummary">8. Summary of Current Actions</Label>
                        <Textarea id="actionsSummary" name="actionsSummary" rows={6} value={form.actionsSummary} onChange={handleChange} placeholder="Describe actions taken so far..."/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="preparedBy">9. Prepared By (Name and Position)</Label>
                        <Input id="preparedBy" name="preparedBy" value={form.preparedBy} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="approvedBy">10. Approved By (Incident Commander)</Label>
                        <Input id="approvedBy" name="approvedBy" value={form.approvedBy} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                     <Button onClick={handleSave}><Save className="mr-2"/>Save Form</Button>
                </div>
            </CardContent>
        </Card>
    );
}
