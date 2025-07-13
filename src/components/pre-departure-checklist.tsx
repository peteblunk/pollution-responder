
"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Eraser, Pencil, Trash2, Palette, CaseUpper, ShieldQuestion, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useGameState } from '@/hooks/use-game-state';
import { ClipboardCheck } from 'lucide-react';

const colors = [
  "#000000", // Black
  "#DA291C", // USCG Red
  "#005DAA", // USCG Blue
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
];

const requiredItems = [
    { id: 'ppe', label: 'PPE (hard hat, gloves, eye pro, safety boots, PFD)' },
    { id: 'equipment', label: 'Equipment (4-gas meter, rad pager)' },
    { id: 'clothing', label: 'Warm clothing / Foul weather gear' },
    { id: 'sample-kit', label: 'Sample Kit (checked)' },
    { id: 'paperwork', label: 'Paperwork (NOFI, forms, notebook, etc.)' },
    { id: 'other', label: 'Snack, water, ferry pass' },
    { id: 'calls', label: 'Call Duty Sup / Contact' },
    { id: 'jurisdiction', label: 'Confirm Jurisdiction / Consult ACP' },
]

const bonusItems = [
    { id: 'sunscreen', label: 'Sun Screen' },
    { id: 'camera', label: 'Camera' },
    { id: 'misle', label: 'Look up MISLE History' },
]

type AssessmentStep = 'honor' | 'checklist';

export function PreDepartureChecklist() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text'>('pencil');
  
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [timerActive, setTimerActive] = useState(true);

  const [isTyping, setIsTyping] = useState(false);
  const [textYOffset, setTextYOffset] = useState(40);
  
  const [rememberedItems, setRememberedItems] = useState<string[]>([]);
  const [assessmentStep, setAssessmentStep] = useState<AssessmentStep>('honor');
  const { updateMissedChecklistItems, completeChecklist } = useGameState();
  const [canvasHeight, setCanvasHeight] = useState(400);

  const wrapText = useCallback((context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, shouldDraw: boolean) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        if (shouldDraw) context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (shouldDraw) context.fillText(line, x, currentY);
    return currentY + lineHeight;
  }, []);
  
  const drawTextFromArea = useCallback(async (andClose = true) => {
      const textarea = textareaRef.current;
      const canvas = canvasRef.current;
      if (!contextRef.current || !textarea || !textarea.value || !canvas) {
          if(andClose) {
            setIsTyping(false);
            setTool('pencil');
          }
          return;
      };
      
      const dpr = window.devicePixelRatio || 1;
      const maxWidth = (canvas.width / dpr) - 40;
      const lineHeight = 32;
      const x = 20;

      contextRef.current.fillStyle = color;
      contextRef.current.font = 'bold 28px sans-serif';

      const lines = textarea.value.split('\n');

      const calculateNeededHeight = () => {
        let neededHeight = textYOffset;
        lines.forEach((line) => {
          neededHeight = wrapText(contextRef.current!, line, x, neededHeight, maxWidth, lineHeight, false);
        });
        return neededHeight;
      }

      let neededHeight = calculateNeededHeight();

      if (neededHeight > canvasHeight) {
          setCanvasHeight(neededHeight + 100);
          await new Promise(resolve => setTimeout(resolve, 0));
      }

      let currentY = textYOffset;
      lines.forEach((line) => {
        currentY = wrapText(contextRef.current!, line, x, currentY, maxWidth, lineHeight, true);
      });
      
      setTextYOffset(currentY);
      
      textarea.value = '';

      if (andClose) {
        setIsTyping(false);
        setTool('pencil');
      }
  }, [canvasHeight, color, textYOffset, wrapText]);

  const endSession = useCallback(() => {
    if (timerActive) {
      if (isTyping && textareaRef.current?.value) {
          drawTextFromArea(false);
      }
      setTimerActive(false);
      setIsTyping(false);
    }
  }, [timerActive, isTyping, drawTextFromArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    
    const setCanvasDimensions = () => {
        if (!canvas || !canvas.parentElement || !isMounted) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement!.getBoundingClientRect();
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          tempCtx.drawImage(canvas, 0, 0);
        }

        canvas.width = rect.width * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${canvasHeight}px`;

        const context = canvas.getContext('2d');
        if(!context) return;
        
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.fillStyle = color;
        contextRef.current = context;
        
        if (tempCtx) {
            context.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
        }
    };
    
    setCanvasDimensions();
    const resizeObserver = new ResizeObserver(setCanvasDimensions);
    resizeObserver.observe(canvas.parentElement!);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
    }
  }, [canvasHeight, color, lineWidth]);
  
  useEffect(() => {
    if (timerActive) {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [timerActive, endSession]);
  
  useEffect(() => {
      if (contextRef.current) {
          contextRef.current.strokeStyle = color;
          contextRef.current.lineWidth = lineWidth;
          if (tool === 'eraser') {
            contextRef.current.globalCompositeOperation = 'destination-out';
            contextRef.current.lineWidth = 20;
          } else {
            contextRef.current.globalCompositeOperation = 'source-over';
          }
      }
  }, [color, lineWidth, tool]);

  const handleToolChange = (newTool: 'pencil' | 'eraser' | 'text') => {
      if (!timerActive) return;
      setTool(newTool);
      if (newTool === 'text') {
        setIsTyping(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
      } else {
        if(isTyping && textareaRef.current?.value){
            drawTextFromArea(false);
        }
        setIsTyping(false);
      }
      if (newTool === 'pencil') {
        setLineWidth(3);
        setColor("#000000");
      }
  }

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!timerActive || tool === 'text' || isTyping) return;
    const { offsetX, offsetY } = event.nativeEvent;
    
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || tool === 'text') return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
          const dpr = window.devicePixelRatio || 1;
          context.clearRect(0, 0, canvas.width/dpr, canvas.height/dpr);
          setTextYOffset(40);
      }
  }

  const onRememberedItemChange = (itemId: string, checked: boolean) => {
      setRememberedItems(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  }
  
  const handleFinalizeChecklist = () => {
    const missedRequired = requiredItems.filter(item => !rememberedItems.includes(item.id));
    const allMissed = missedRequired.map(i => i.id);
    updateMissedChecklistItems(allMissed);
    completeChecklist();
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const missedCount = requiredItems.length - rememberedItems.filter(id => requiredItems.some(req => req.id === id)).length;

  return (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><ClipboardCheck/> Pre-Departure Checklist</CardTitle>
            <CardDescription>
                You take a moment to consider potential pre-departure hazards and plan your loadout. Use the whiteboard to make a checklist of everything you will need. You have four minutes.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow min-h-0">
            <div className='h-full w-full flex flex-col gap-2'>
                {timerActive && (
                    <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
                        <Button variant={tool === 'pencil' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('pencil')}>
                            <Pencil />
                        </Button>
                        <Button variant={tool === 'text' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('text')}>
                            <CaseUpper />
                        </Button>
                        <Button variant={tool === 'eraser' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('eraser')}>
                            <Eraser />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon"><Palette /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="flex gap-1">
                                    {colors.map(c => (
                                        <button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border-2", color === c ? 'border-primary' : 'border-transparent')} style={{backgroundColor: c}}/>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button variant="destructive" size="icon" onClick={clearCanvas}>
                            <Trash2 />
                        </Button>
                        <div className="flex-grow text-center font-bold text-lg font-mono" >
                           <span className={cn(timeLeft <= 30 && 'text-destructive')}>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
                        </div>
                        <Button onClick={endSession}>
                            <Check className="mr-2"/> I'm Ready
                        </Button>
                    </div>
                )}
                <div className="flex-grow w-full min-h-0 rounded-md border overflow-hidden relative grid grid-cols-1 md:grid-cols-2 md:gap-4 bg-card p-2">
                    <ScrollArea className={cn("w-full h-full bg-white relative col-span-1 rounded-md", !timerActive && 'opacity-60 pointer-events-none')}>
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseUp={finishDrawing}
                            onMouseMove={draw}
                            onMouseLeave={finishDrawing}
                            className="w-full"
                            style={{ minHeight: `${canvasHeight}px` }}
                        />
                    </ScrollArea>

                    {isTyping && timerActive && (
                        <div className="absolute inset-x-2 top-2 md:left-1/2 md:-translate-x-1/2 flex flex-col gap-2 bg-background/90 p-4 rounded-lg border z-10 w-auto max-w-sm md:w-1/3">
                            <Label htmlFor="text-input" className='font-headline'>Enter your checklist text below.</Label>
                            <Textarea 
                                ref={textareaRef}
                                id="text-input"
                                className="flex-grow bg-white/80"
                                placeholder='- PPE (gloves, hard hat...)'
                            />
                            <div className='flex justify-end gap-2'>
                                <Button variant="ghost" onClick={() => { setIsTyping(false); setTool('pencil');}}>Cancel</Button>
                                <Button onClick={() => drawTextFromArea()}>Add Text</Button>
                            </div>
                        </div>
                    )}
                    
                    {!timerActive && (
                       <div className="w-full shadow-lg flex flex-col h-full max-h-[calc(100vh-200px)] col-span-1">
                           {assessmentStep === 'honor' && (
                               <Card className="m-auto">
                                   <CardHeader>
                                       <CardTitle className="font-headline text-2xl text-center">Time's Up!</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                       <Alert variant="destructive" className="border-uscg-red">
                                           <AlertTitle className="font-headline text-lg text-uscg-red">
                                               <strong className="font-bold">Honor</strong>, Respect, Devotion to Duty
                                           </AlertTitle>
                                           <AlertDescription className="text-uscg-red/80">
                                               The effectiveness of this training relies on your honest self-assessment. Be truthful about what you remembered as we review your list.
                                           </AlertDescription>
                                       </Alert>
                                   </CardContent>
                                   <CardFooter>
                                       <Button className="w-full" onClick={() => setAssessmentStep('checklist')}>
                                           Let's Check
                                       </Button>
                                   </CardFooter>
                               </Card>
                           )}

                           {assessmentStep === 'checklist' && (
                               <Card className="flex flex-col h-full">
                                   <CardHeader>
                                       <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldQuestion/> Self-Assessment</CardTitle>
                                       <CardDescription>Review your list on the left. Check the box for each item you included.</CardDescription>
                                   </CardHeader>
                                   <CardContent className="flex-grow overflow-hidden">
                                       <ScrollArea className="h-full pr-4">
                                            <div className="space-y-4">
                                                <div className='p-2 rounded-md bg-muted/50 text-center mb-4'>
                                                    <p className='text-muted-foreground'>
                                                        <strong className='font-bold text-uscg-red'>Honor</strong>, Respect, Devotion to Duty
                                                    </p>
                                                </div>
                                                <h4 className="font-bold mb-2">Required Items & Actions</h4>
                                                <div className="space-y-2">
                                                {requiredItems.map(item => (
                                                    <div key={item.id} className="flex items-center space-x-2">
                                                        <Checkbox id={item.id} onCheckedChange={(checked) => onRememberedItemChange(item.id, !!checked)} />
                                                        <Label htmlFor={item.id} className="font-normal text-sm">{item.label}</Label>
                                                    </div>
                                                ))}
                                                </div>
                                                <Separator />
                                                <h4 className="font-bold mb-2">Bonus Items & Actions</h4>
                                                <div className="space-y-2">
                                                {bonusItems.map(item => (
                                                    <div key={item.id} className="flex items-center space-x-2">
                                                        <Checkbox id={item.id} onCheckedChange={(checked) => onRememberedItemChange(item.id, !!checked)} />
                                                        <Label htmlFor={item.id} className="font-normal text-sm">{item.label}</Label>
                                                    </div>
                                                ))}
                                                </div>
                                            </div>
                                       </ScrollArea>
                                   </CardContent>
                                   <CardFooter className='pt-4 border-t'>
                                       <Button className="w-full" onClick={handleFinalizeChecklist}>
                                           Finalize Checklist ({missedCount > 0 ? `${missedCount} missed` : "All clear!"})
                                       </Button>
                                   </CardFooter>
                               </Card>
                           )}
                       </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
