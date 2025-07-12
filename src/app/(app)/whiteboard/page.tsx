import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";

export default function WhiteboardPage() {
  return (
    <div className="h-full flex flex-col">
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
