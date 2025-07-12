"use client";

import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Eraser, Pencil, Trash2, Palette, Redo, Undo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const colors = [
  "#000000", // Black
  "#DA291C", // USCG Red
  "#005DAA", // USCG Blue
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
];

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // For HiDPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;
  }, []);
  
  useEffect(() => {
      if (contextRef.current) {
          contextRef.current.strokeStyle = color;
          contextRef.current.lineWidth = lineWidth;
      }
  }, [color, lineWidth]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };
  
  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
      }
  }

  return (
    <div className='h-full w-full flex flex-col gap-2'>
        <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
            <Button variant={lineWidth === 3 ? "secondary" : "ghost"} size="icon" onClick={() => { setColor("#000000"); setLineWidth(3); }}>
                <Pencil />
            </Button>
            <Button variant={lineWidth === 20 ? "secondary" : "ghost"} size="icon" onClick={() => { setColor("#FFFFFF"); setLineWidth(20); }}>
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
            <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="icon" disabled><Undo/></Button>
                <Button variant="ghost" size="icon" disabled><Redo/></Button>
                <Button variant="destructive" size="icon" onClick={clearCanvas}>
                    <Trash2 />
                </Button>
            </div>
        </div>
        <div className="flex-grow w-full h-full rounded-md border overflow-hidden">
            <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            className="w-full h-full bg-white"
            />
        </div>
    </div>
  );
}
