"use client";

import { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Eraser, Pencil, Trash2, Palette, Redo, Undo, CaseUpper, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Link from 'next/link';

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
  const textInputRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text'>('pencil');
  
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [timerActive, setTimerActive] = useState(true);

  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: ''});
  
  const [missedItems, setMissedItems] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.font = '16px "PT Sans"';
    contextRef.current = context;

    // Timer logic
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                setTimerActive(false);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
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

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!timerActive) return;
    const { offsetX, offsetY } = event.nativeEvent;
    if (tool === 'text') {
        if (textInput.value) { // place existing text
            drawText();
        }
        setTextInput({ visible: true, x: offsetX, y: offsetY, value: ''});
        setTimeout(() => textInputRef.current?.focus(), 0);
        return;
    }

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
  
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          drawText();
      } else if (e.key === 'Escape') {
          setTextInput({ ...textInput, visible: false, value: '' });
      }
  }

  const drawText = () => {
      if (!contextRef.current || !textInput.value) return;
      contextRef.current.fillStyle = color;
      contextRef.current.font = '16px "PT Sans"';
      contextRef.current.fillText(textInput.value, textInput.x, textInput.y);
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
  }

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
      }
  }

  const onMissedItemChange = (itemId: string, checked: boolean) => {
      setMissedItems(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  }
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className='h-full w-full flex flex-col gap-2'>
        <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
            <Button variant={tool === 'pencil' ? "secondary" : "ghost"} size="icon" onClick={() => { setTool('pencil'); setLineWidth(3); setColor("#000000"); }} disabled={!timerActive}>
                <Pencil />
            </Button>
            <Button variant={tool === 'text' ? "secondary" : "ghost"} size="icon" onClick={() => setTool('text')} disabled={!timerActive}>
                <CaseUpper />
            </Button>
            <Button variant={tool === 'eraser' ? "secondary" : "ghost"} size="icon" onClick={() => setTool('eraser')} disabled={!timerActive}>
                <Eraser />
            </Button>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!timerActive}><Palette /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1">
                        {colors.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border-2", color === c ? 'border-primary' : 'border-transparent')} style={{backgroundColor: c}}/>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
            <div className="flex-grow text-center font-bold text-lg font-mono" >
                {timerActive ? (
                   <span className={cn(timeLeft <= 30 && 'text-destructive')}>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
                ) : (
                    <span className="text-primary">Time's Up!</span>
                )}
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" disabled><Undo/></Button>
                <Button variant="ghost" size="icon" disabled><Redo/></Button>
                <Button variant="destructive" size="icon" onClick={clearCanvas} disabled={!timerActive}>
                    <Trash2 />
                </Button>
            </div>
        </div>
        <div className="flex-grow w-full min-h-0 rounded-md border overflow-hidden relative">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onMouseLeave={finishDrawing}
                className={cn("w-full h-full bg-white", !timerActive && 'opacity-30 ')}
            />
            {textInput.visible && (
                <input
                    ref={textInputRef}
                    type="text"
                    value={textInput.value}
                    onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                    onKeyDown={handleTextKeyDown}
                    onBlur={drawText}
                    style={{
                        position: 'absolute',
                        left: `${textInput.x}px`,
                        top: `${textInput.y - 20}px`,
                        background: 'transparent',
                        border: '1px solid #ccc',
                        color: color,
                        fontSize: '16px',
                        fontFamily: '"PT Sans"',
                    }}
                />
            )}
             {!timerActive && (
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                   <Card className="w-full max-w-md shadow-2xl">
                       <CardHeader>
                           <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldQuestion/> Self-Assessment</CardTitle>
                           <CardDescription>Time to review your list. For each item or action you missed, check the box.</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-4">
                           <div>
                                <h4 className="font-bold mb-2">Required Items</h4>
                                <div className="space-y-2">
                                {requiredItems.map(item => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <Checkbox id={item.id} onCheckedChange={(checked) => onMissedItemChange(item.id, !!checked)} />
                                        <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                                    </div>
                                ))}
                                </div>
                           </div>
                           <Separator />
                           <div>
                                <h4 className="font-bold mb-2">Bonus Items</h4>
                                <div className="space-y-2">
                                {bonusItems.map(item => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <Checkbox id={item.id} onCheckedChange={(checked) => onMissedItemChange(item.id, !!checked)} />
                                        <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                                    </div>
                                ))}
                                </div>
                           </div>
                           <Separator />
                           <Alert variant="destructive">
                               <AlertTitle className="font-headline">Honor, Respect, Devotion to Duty</AlertTitle>
                               <AlertDescription>
                                   The effectiveness of this training relies on your honest self-assessment. Be truthful about what you missed.
                               </AlertDescription>
                           </Alert>
                           <Button className="w-full" asChild>
                               <Link href="/dashboard">Return to Dashboard ({missedItems.length} missed)</Link>
                           </Button>
                       </CardContent>
                   </Card>
                </div>
            )}
        </div>
    </div>
  );
}
