import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";

export default function WhiteboardPage() {
  return (
    <div className="h-full flex flex-col">
       <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Collaborative Whiteboard</CardTitle>
            <CardDescription>Visualize your strategy. Sketch hazard zones, vessel diagrams, or ACP components.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <WhiteboardCanvas />
        </CardContent>
       </Card>
    </div>
  );
}
