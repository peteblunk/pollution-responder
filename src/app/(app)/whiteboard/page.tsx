import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";
import { FileQuestion } from "lucide-react";

export default function WhiteboardPage() {
  return (
    <div className="h-full flex flex-col gap-4">
       <Alert className="border-accent bg-accent/10">
        <FileQuestion className="h-4 w-4 text-accent-foreground" />
        <AlertTitle className="font-headline text-accent-foreground">Your Task</AlertTitle>
        <AlertDescription className="text-accent-foreground/80">
            What <strong>Items</strong> are you taking and what <strong>Actions</strong> are you taking before you depart? Use the whiteboard below to create your checklist.
        </AlertDescription>
       </Alert>
       <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Pre-Departure Checklist</CardTitle>
            <CardDescription>Use the tools to create your checklist. You have 4 minutes.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow min-h-0">
            <WhiteboardCanvas />
        </CardContent>
       </Card>
    </div>
  );
}
