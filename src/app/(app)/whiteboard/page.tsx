
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";

export default function WhiteboardPage() {
  return (
    <div className="h-full flex flex-col gap-4">
       <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Responder Whiteboard</CardTitle>
            <CardDescription>A persistent scratchpad for your notes and thoughts throughout the exercise.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow min-h-0">
            <WhiteboardCanvas />
        </CardContent>
       </Card>
    </div>
  );
}
