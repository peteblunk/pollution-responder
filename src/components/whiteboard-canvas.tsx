
"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { Button } from './ui/button';
import { Eraser, Pencil, Trash2, Palette, CaseUpper, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useGameState } from '@/hooks/use-game-state';
import { ScrollArea } from './ui/scroll-area';

const colors = [
  "#000000", // Black
  "#DA291C", // USCG Red
  "#005DAA", // USCG Blue
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
];

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const { state, updateWhiteboardState } = useGameState();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text'>('pencil');
  
  const [isTyping, setIsTyping] = useState(false);
  const [textYOffset, setTextYOffset] = useState(40);
  const [canvasHeight, setCanvasHeight] = useState(800);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      updateWhiteboardState(dataUrl);
    }
  }, [updateWhiteboardState]);

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
      saveState();

      if (andClose) {
        setIsTyping(false);
        setTool('pencil');
      }
  }, [canvasHeight, color, textYOffset, wrapText, saveState]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    
    const setCanvasDimensionsAndDrawInitial = () => {
        if (!canvas || !canvas.parentElement || !isMounted) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement!.getBoundingClientRect();
        
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

        if (state.whiteboardState) {
          const img = new Image();
          img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
          };
          img.src = state.whiteboardState;
        }
    };
    
    setCanvasDimensionsAndDrawInitial();
    const resizeObserver = new ResizeObserver(setCanvasDimensionsAndDrawInitial);
    resizeObserver.observe(canvas.parentElement!);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
    }
  }, [canvasHeight, color, lineWidth, state.whiteboardState]);
  
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
    if (tool === 'text' || isTyping) return;
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
    saveState();
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
          saveState();
      }
  }

  return (
    <div className='h-full w-full flex flex-col gap-2'>
        <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
            <Button variant={tool === 'pencil' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('pencil')} title="Pencil">
                <Pencil />
            </Button>
            <Button variant={tool === 'text' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('text')} title="Text">
                <CaseUpper />
            </Button>
            <Button variant={tool === 'eraser' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolChange('eraser')} title="Eraser">
                <Eraser />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title="Colors"><Palette /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1">
                        {colors.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full border-2", color === c ? 'border-primary' : 'border-transparent')} style={{backgroundColor: c}}/>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
            <div className="flex-grow"></div>
            <Button variant="destructive" size="icon" onClick={clearCanvas} title="Clear All">
                <Trash2 />
            </Button>
        </div>
        <div className="flex-grow w-full min-h-0 rounded-md border overflow-hidden relative bg-card p-2">
            <ScrollArea className="w-full h-full bg-white relative col-span-1 rounded-md">
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

            {isTyping && (
                <div className="absolute inset-x-2 top-2 md:left-1/2 md:-translate-x-1/2 flex flex-col gap-2 bg-background/90 p-4 rounded-lg border z-10 w-auto max-w-sm md:w-1/3">
                    <Label htmlFor="text-input" className='font-headline'>Enter text to add to the whiteboard.</Label>
                    <Textarea 
                        ref={textareaRef}
                        id="text-input"
                        className="flex-grow bg-white/80"
                        placeholder='- My brilliant idea...'
                    />
                    <div className='flex justify-end gap-2'>
                        <Button variant="ghost" onClick={() => { setIsTyping(false); setTool('pencil');}}>Cancel</Button>
                        <Button onClick={() => drawTextFromArea()}>Add Text</Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
