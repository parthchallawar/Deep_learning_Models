import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Move, Download } from 'lucide-react';

const ConfusionMatrix = ({
  matrix = [],
  classNames = [],
  expId
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const numClasses = classNames.length;
  
  // Find maximum value in the matrix for color scale normalization
  const maxVal = Math.max(...matrix.flatMap(row => row), 1);

  // Render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matrix.length === 0) return;
    const ctx = canvas.getContext('2d');
    
    // Set high-DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear Canvas
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    // Matrix drawing parameters
    const size = Math.min(width, height) - 80;
    const cellSize = (size / numClasses) * zoom;
    const startX = 60 + pan.x;
    const startY = 20 + pan.y;

    ctx.save();
    
    // Draw cells
    for (let r = 0; r < numClasses; r++) {
      for (let c = 0; c < numClasses; c++) {
        const val = matrix[r]?.[c] || 0;
        const cellX = startX + c * cellSize;
        const cellY = startY + r * cellSize;

        // Skip drawing if outside canvas viewport bounds
        if (cellX + cellSize < 0 || cellX > width || cellY + cellSize < 0 || cellY > height) {
          continue;
        }

        // Color interpolation: dark navy (#0a0e1a) to bright purple (#7c3aed)
        const ratio = val / maxVal;
        ctx.fillStyle = `rgba(124, 58, 237, ${ratio * 0.9 + 0.1})`;
        
        // Highlights diagonal (correct predictions) with a subtle border
        if (r === c) {
          ctx.fillStyle = `rgba(6, 182, 212, ${ratio * 0.85 + 0.15})`;
        }

        // Highlight searched class
        if (searchTerm && (classNames[r].toLowerCase().includes(searchTerm.toLowerCase()) || 
                          classNames[c].toLowerCase().includes(searchTerm.toLowerCase()))) {
          ctx.fillStyle = `rgba(236, 72, 153, ${ratio * 0.8 + 0.2})`;
        }

        ctx.fillRect(cellX, cellY, cellSize - 0.5, cellSize - 0.5);
      }
    }

    // Draw axis abbreviations labels if zoom is high enough
    if (cellSize > 10) {
      ctx.fillStyle = '#64748b';
      ctx.font = '7px monospace';
      
      for (let i = 0; i < numClasses; i++) {
        const cellX = startX + i * cellSize;
        const cellY = startY + i * cellSize;

        // X axis labels (Abbreviated)
        if (cellX + cellSize > 0 && cellX < width) {
          ctx.save();
          ctx.translate(cellX + cellSize / 2, startY - 5);
          ctx.rotate(-Math.PI / 4);
          ctx.fillText(classNames[i].substring(0, 5), 0, 0);
          ctx.restore();
        }

        // Y axis labels
        if (cellY + cellSize > 0 && cellY < height) {
          ctx.fillText(classNames[i].substring(0, 5), startX - 35, cellY + cellSize / 2 + 2);
        }
      }
    }

    ctx.restore();
  }, [matrix, zoom, pan, numClasses, classNames, maxVal, searchTerm]);

  // Handle Mouse Events (Zoom/Pan/Hover)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate canvas-space mouse coordinates
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Grid coordinates
    const size = Math.min(rect.width, rect.height) - 80;
    const cellSize = (size / numClasses) * zoom;
    const startX = 60 + pan.x;
    const startY = 20 + pan.y;

    const c = Math.floor((mouseX - startX) / cellSize);
    const r = Math.floor((mouseY - startY) / cellSize);

    if (c >= 0 && c < numClasses && r >= 0 && r < numClasses) {
      const val = matrix[r]?.[c] || 0;
      setHoveredCell({
        actual: classNames[r],
        predicted: classNames[c],
        count: val
      });
      setTooltipPos({ x: mouseX + 15, y: mouseY + 15 });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.8));
  
  const resetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSearchTerm('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [['Actual Class', ...classNames]];
    for (let r = 0; r < numClasses; r++) {
      csvRows.push([classNames[r], ...matrix[r]]);
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${expId}_confusion_matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-border-card gap-4">
        <div>
          <h3 className="font-black text-sm text-text-primary">Interactive Confusion Heatmap</h3>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Category Misclassification Registry ({numClasses}x{numClasses} matrix)
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-bg-primary border border-border-card rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-purple font-semibold max-w-[140px]"
          />
          <button
            onClick={zoomIn}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-purple/30 hover:bg-accent-purple/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-purple/30 hover:bg-accent-purple/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoomPan}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-cyan/30 hover:bg-accent-cyan/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Reset Pan/Zoom"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-green/30 hover:bg-accent-green/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Heatmap Area */}
      <div 
        ref={containerRef}
        className="w-full h-[400px] border border-border-card/60 bg-bg-primary rounded-xl overflow-hidden relative cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div 
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
            className="absolute z-30 pointer-events-none bg-bg-card border border-border-card shadow-xl rounded-xl p-3 text-[11px] font-mono leading-relaxed max-w-[240px] animate-in fade-in duration-100"
          >
            <div className="flex justify-between items-center gap-4 text-accent-cyan border-b border-border-card pb-1 mb-1 font-bold">
              <span>CONFUSION REGISTER</span>
              <span className="bg-accent-purple/20 text-accent-purple px-1.5 rounded-md">
                N={hoveredCell.count}
              </span>
            </div>
            <p className="text-text-muted">
              ACTUAL: <span className="text-text-primary font-bold">{hoveredCell.actual}</span>
            </p>
            <p className="text-text-muted">
              PREDICTED: <span className="text-accent-pink font-bold">{hoveredCell.predicted}</span>
            </p>
          </div>
        )}

        {/* Dynamic Zoom/Pan Status Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 border border-border-card rounded-md px-2 py-1 text-[9px] font-mono text-text-muted select-none">
          ZOOM: {zoom.toFixed(1)}x | PAN: {Math.round(pan.x)}, {Math.round(pan.y)}
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;
