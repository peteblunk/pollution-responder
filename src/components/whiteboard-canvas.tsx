
"use client";

import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Eraser, Pencil, Trash2, Palette, CaseUpper, ShieldQuestion, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Link from 'next/link';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

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
]

const bonusItems = [
    { id: 'sunscreen', label: 'Sun Screen' },
    { id: 'camera', label: 'Camera' },
    { id: 'misle', label: 'Look up MISLE History' },
    { id: 'calls', label: 'Call Duty Sup / Contact' },
    { id: 'jurisdiction', label: 'Confirm Jurisdiction / Consult ACP' },
]

export function WhiteboardCanvas() {
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
  
  const [missedItems, setMissedItems] = useState<string[]>([]);
  
  const drawTextFromArea = (andClose = true) => {
      const textarea = textareaRef.current;
      if (!contextRef.current || !textarea || !textarea.value) {
          if(andClose) {
            setIsTyping(false);
            setTool('pencil');
          }
          return;
      };
      
      contextRef.current.fillStyle = color;
      contextRef.current.font = '16px "PT Sans"';
      const lines = textarea.value.split('\n');
      let currentY = textYOffset;
      lines.forEach((line) => {
        contextRef.current?.fillText(line, 20, currentY);
        currentY += 20; // Move to the next line
      });
      setTextYOffset(currentY + 20); // Add extra space for the next text block
      
      textarea.value = '';

      if (andClose) {
        setIsTyping(false);
        setTool('pencil');
      }
  }

  const endSession = () => {
    if (timerActive && isTyping && textareaRef.current?.value) {
        drawTextFromArea(false);
    }
    setTimerActive(false);
    setIsTyping(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size based on parent, not fixed values
    const setCanvasDimensions = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.font = '16px "PT Sans"';
        contextRef.current = context;
        // Redraw content if needed, but for now we clear
    }
    
    setCanvasDimensions();
    // Maybe handle resize later if needed

    // Timer logic
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);
  
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
          setTextYOffset(40); // Reset text position
      }
  }

  const onMissedItemChange = (itemId: string, checked: boolean) => {
      setMissedItems(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  }
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
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
            <div className={cn("w-full h-full bg-white relative", !timerActive && 'opacity-60 pointer-events-none')}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    className="w-full h-full"
                />
            </div>

            {isTyping && timerActive && (
                <div className="absolute inset-2 flex flex-col gap-2 bg-background/90 p-4 rounded-lg border z-10">
                    <Label htmlFor="text-input" className='font-headline'>Enter your checklist text below. Click "Add Text to Whiteboard" when finished.</Label>
                    <Textarea 
                        ref={textareaRef}
                        id="text-input"
                        className="flex-grow bg-white/80"
                        placeholder='- PPE (gloves, hard hat...)'
                    />
                    <div className='flex justify-end gap-2'>
                        <Button variant="ghost" onClick={() => { setIsTyping(false); setTool('pencil');}}>Cancel</Button>
                        <Button onClick={() => drawTextFromArea()}>Add Text to Whiteboard</Button>
                    </div>
                </div>
            )}
            
            {!timerActive && (
               <Card className="w-full shadow-lg flex flex-col h-full max-h-[calc(100vh-200px)]">
                   <CardHeader>
                       <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldQuestion/> Self-Assessment</CardTitle>
                       <CardDescription>Review your list. For each item or action you missed, check the box.</CardDescription>
                   </CardHeader>
                   <CardContent className="flex-grow overflow-hidden">
                       <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                               <div>
                                    <h4 className="font-bold mb-2">Required Items & Actions</h4>
                                    <div className="space-y-2">
                                    {requiredItems.map(item => (
                                        <div key={item.id} className="flex items-center space-x-2">
                                            <Checkbox id={item.id} onCheckedChange={(checked) => onMissedItemChange(item.id, !!checked)} />
                                            <Label htmlFor={item.id} className="font-normal text-sm">{item.label}</Label>
                                        </div>
                                    ))}
                                    </div>
                               </div>
                               <Separator />
                               <div>
                                    <h4 className="font-bold mb-2">Bonus Items & Actions</h4>
                                    <div className="space-y-2">
                                    {bonusItems.map(item => (
                                        <div key={item.id} className="flex items-center space-x-2">
                                            <Checkbox id={item.id} onCheckedChange={(checked) => onMissedItemChange(item.id, !!checked)} />
                                            <Label htmlFor={item.id} className="font-normal text-sm">{item.label}</Label>
                                        </div>
                                    ))}
                                    </div>
                               </div>
                           </div>
                       </ScrollArea>
                   </CardContent>
                   <CardFooter className='flex flex-col gap-4 pt-4 border-t'>
                        <Alert variant="destructive">
                           <AlertTitle className="font-headline">Honor, Respect, Devotion to Duty</AlertTitle>
                           <AlertDescription>
                               The effectiveness of this training relies on your honest self-assessment. Be truthful about what you missed.
                           </AlertDescription>
                       </Alert>
                       <Button className="w-full" asChild>
                           <Link href="/dashboard">Return to Dashboard ({missedItems.length} missed)</Link>
                       </Button>
                   </CardFooter>
               </Card>
            )}
        </div>
    </div>
  );
}
