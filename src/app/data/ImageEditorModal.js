"use client";

import { useState, useEffect, useRef } from "react";

export default function ImageEditorModal({ file, onSave, onClose }) {
  const [imageSrc, setImageSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [scale, setScale] = useState(1.0); // 0.3 to 1.5
  const [bgFill, setBgFill] = useState("transparent"); // 'transparent' | 'white'
  
  // Crop state as percentages of image dimensions (0.0 to 1.0)
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [isCropActive, setIsCropActive] = useState(true);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  // Dragging state
  const dragStartRef = useRef(null);
  const activeHandleRef = useRef(null); // null | "nw" | "ne" | "sw" | "se" | "move"

  useEffect(() => {
    if (file) {
      if (typeof file === "string") {
        setImageSrc(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result);
        reader.readAsDataURL(file);
      }
    }
  }, [file]);

  // Redraw canvas whenever imageSrc, rotation, crop, scale, bgFill, or crop mode changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, rotation, crop, isCropActive, scale, bgFill]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Determine dimensions based on rotation
    const is90or270 = rotation === 90 || rotation === 270;
    const canvasWidth = is90or270 ? img.height : img.width;
    const canvasHeight = is90or270 ? img.width : img.height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill background color
    if (bgFill === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    // Apply rotation and scale transformations
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Scale draw size to expand/add margin around image
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw crop overlays if cropping is active
    if (isCropActive) {
      drawCropOverlay(ctx, canvasWidth, canvasHeight);
    }
  };

  const drawCropOverlay = (ctx, cw, ch) => {
    const cx = crop.x * cw;
    const cy = crop.y * ch;
    const cw_p = crop.w * cw;
    const ch_p = crop.h * ch;

    // Draw semi-transparent background outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    
    // Top box
    ctx.fillRect(0, 0, cw, cy);
    // Bottom box
    ctx.fillRect(0, cy + ch_p, cw, ch - (cy + ch_p));
    // Left box
    ctx.fillRect(0, cy, cx, ch_p);
    // Right box
    ctx.fillRect(cx + cw_p, cy, cw - (cx + cw_p), ch_p);

    // Draw crop border
    ctx.strokeStyle = "#fbbf24"; // amber-400
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw_p, ch_p);

    // Draw corner handles
    ctx.fillStyle = "#fbbf24";
    const handleSize = cw < 800 ? 10 : 20; // scale handle size based on resolution
    
    ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize); // NW
    ctx.fillRect(cx + cw_p - handleSize / 2, cy - handleSize / 2, handleSize, handleSize); // NE
    ctx.fillRect(cx - handleSize / 2, cy + ch_p - handleSize / 2, handleSize, handleSize); // SW
    ctx.fillRect(cx + cw_p - handleSize / 2, cy + ch_p - handleSize / 2, handleSize, handleSize); // SE
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRemoveBackground = () => {
    if (!canvasRef.current) return;
    setAiProcessing(true);

    // Simulate AI scan and compute threshold removal client-side
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Sample corner pixels to detect the background color (usually white/light gray or chroma color)
      const corners = [
        getPixelColor(data, 0, 0, width),
        getPixelColor(data, width - 1, 0, width),
        getPixelColor(data, 0, height - 1, width),
        getPixelColor(data, width - 1, height - 1, width)
      ];

      // Use average corner color as background target
      const bgR = corners.reduce((acc, c) => acc + c.r, 0) / 4;
      const bgG = corners.reduce((acc, c) => acc + c.g, 0) / 4;
      const bgB = corners.reduce((acc, c) => acc + c.b, 0) / 4;

      // Scan every pixel and set transparent if close to detected bg color
      // Also match generic white/light-gray backgrounds commonly found in product photos
      const threshold = 35; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        const diffFromBg = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );

        // Also check if pixel is extremely white/light gray
        const isWhiteBg = r > 230 && g > 230 && b > 230;

        if (diffFromBg < threshold || isWhiteBg) {
          // Semi-transparent feathering/smoothing on boundaries
          if (diffFromBg > threshold - 10) {
            data[i+3] = ((diffFromBg - (threshold - 10)) / 10) * 255;
          } else {
            data[i+3] = 0; // complete transparent
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Save modified canvas as the new image source
      setImageSrc(canvas.toDataURL());
      setRotation(0); // Reset rotation since changes are baked into new imageSrc
      setAiProcessing(false);
    }, 1500);
  };

  const getPixelColor = (data, x, y, width) => {
    const idx = (y * width + x) * 4;
    return { r: data[idx], g: data[idx+1], b: data[idx+2] };
  };

  // Canvas interaction logic (mouse/touch events)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Handle both touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handleMouseDown = (e) => {
    if (!isCropActive) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = crop.x * canvas.width;
    const cy = crop.y * canvas.height;
    const cw_p = crop.w * canvas.width;
    const ch_p = crop.h * canvas.height;
    const tolerance = canvas.width < 800 ? 15 : 30; // touch/click tolerance

    // Check corner hits
    if (Math.hypot(coords.x - cx, coords.y - cy) < tolerance) {
      activeHandleRef.current = "nw";
    } else if (Math.hypot(coords.x - (cx + cw_p), coords.y - cy) < tolerance) {
      activeHandleRef.current = "ne";
    } else if (Math.hypot(coords.x - cx, coords.y - (cy + ch_p)) < tolerance) {
      activeHandleRef.current = "sw";
    } else if (Math.hypot(coords.x - (cx + cw_p), coords.y - (cy + ch_p)) < tolerance) {
      activeHandleRef.current = "se";
    } else if (coords.x > cx && coords.x < cx + cw_p && coords.y > cy && coords.y < cy + ch_p) {
      activeHandleRef.current = "move";
      dragStartRef.current = { x: coords.x - cx, y: coords.y - cy };
    }
  };

  const handleMouseMove = (e) => {
    if (!isCropActive || !activeHandleRef.current) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = activeHandleRef.current;
    const cw = canvas.width;
    const ch = canvas.height;

    let newCrop = { ...crop };
    const minSize = 0.1; // 10% min crop width/height

    if (handle === "move" && dragStartRef.current) {
      let nx = (coords.x - dragStartRef.current.x) / cw;
      let ny = (coords.y - dragStartRef.current.y) / ch;

      // Keep inside bounds
      nx = Math.max(0, Math.min(nx, 1 - crop.w));
      ny = Math.max(0, Math.min(ny, 1 - crop.h));
      newCrop.x = nx;
      newCrop.y = ny;
    } else {
      const cx = crop.x * cw;
      const cy = crop.y * ch;
      const cw_p = crop.w * cw;
      const ch_p = crop.h * ch;

      let mx = coords.x / cw;
      let my = coords.y / ch;

      if (handle === "nw") {
        const nx = Math.max(0, Math.min(mx, crop.x + crop.w - minSize));
        const ny = Math.max(0, Math.min(my, crop.y + crop.h - minSize));
        newCrop.w = (crop.x + crop.w) - nx;
        newCrop.h = (crop.y + crop.h) - ny;
        newCrop.x = nx;
        newCrop.y = ny;
      } else if (handle === "ne") {
        const nw = Math.max(minSize, Math.min(mx - crop.x, 1 - crop.x));
        const ny = Math.max(0, Math.min(my, crop.y + crop.h - minSize));
        newCrop.w = nw;
        newCrop.h = (crop.y + crop.h) - ny;
        newCrop.y = ny;
      } else if (handle === "sw") {
        const nx = Math.max(0, Math.min(mx, crop.x + crop.w - minSize));
        const nh = Math.max(minSize, Math.min(my - crop.y, 1 - crop.y));
        newCrop.w = (crop.x + crop.w) - nx;
        newCrop.h = nh;
        newCrop.x = nx;
      } else if (handle === "se") {
        newCrop.w = Math.max(minSize, Math.min(mx - crop.x, 1 - crop.x));
        newCrop.h = Math.max(minSize, Math.min(my - crop.y, 1 - crop.y));
      }
    }

    setCrop(newCrop);
  };

  const handleMouseUp = () => {
    activeHandleRef.current = null;
    dragStartRef.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);

    // If crop is active, bake the crop bounds into a cropped canvas
    if (isCropActive) {
      const croppedCanvas = document.createElement("canvas");
      const ctx = croppedCanvas.getContext("2d");

      const cx = crop.x * canvas.width;
      const cy = crop.y * canvas.height;
      const cw = crop.w * canvas.width;
      const ch = crop.h * canvas.height;

      croppedCanvas.width = cw;
      croppedCanvas.height = ch;

      ctx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

      croppedCanvas.toBlob((blob) => {
        if (blob) {
          const editedFile = new File([blob], file.name || "edited-product.png", {
            type: "image/png",
            lastModified: Date.now()
          });
          onSave(editedFile);
        }
        setLoading(false);
      }, "image/png");
    } else {
      // Bake rotation / bg removal directly without crop
      canvas.toBlob((blob) => {
        if (blob) {
          const editedFile = new File([blob], file.name || "edited-product.png", {
            type: "image/png",
            lastModified: Date.now()
          });
          onSave(editedFile);
        }
        setLoading(false);
      }, "image/png");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const downloadCanvas = (cv) => {
      const dataUrl = cv.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = (typeof file === "string" ? "edited-image.png" : file.name) || "edited-product.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (isCropActive) {
      const croppedCanvas = document.createElement("canvas");
      const ctx = croppedCanvas.getContext("2d");

      const cx = crop.x * canvas.width;
      const cy = crop.y * canvas.height;
      const cw = crop.w * canvas.width;
      const ch = crop.h * canvas.height;

      croppedCanvas.width = cw;
      croppedCanvas.height = ch;

      ctx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
      downloadCanvas(croppedCanvas);
    } else {
      downloadCanvas(canvas);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-white">Image Editor Studio</h3>
            <p className="text-xs text-neutral-400">Crop, rotate, and extract subjects with AI background remover</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition p-2 hover:bg-neutral-800 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Workspace Canvas Area */}
        <div className="flex-1 overflow-auto bg-neutral-950 flex items-center justify-center p-6 min-h-[350px] relative">
          
          {aiProcessing && (
            <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-emerald-500 animate-spin-reverse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white tracking-wide">AI SUBJECT EXTRACTION</p>
                <p className="text-xs text-neutral-400 mt-1">Removing background, smoothing edges...</p>
              </div>
              {/* Scanline animation */}
              <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan" />
            </div>
          )}

          {imageSrc ? (
            <div className="relative max-w-full max-h-full select-none cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg border border-neutral-800 bg-neutral-900"
              />
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">Loading image canvas...</div>
          )}
        </div>

        {/* Scale/Padding and Canvas Fill Control Toolbar */}
        <div className="border-t border-neutral-800 bg-neutral-900/30 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs font-semibold text-neutral-400 whitespace-nowrap">Image Scale (Padding):</span>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
            />
            <span className="text-xs font-bold text-amber-500 w-10 text-right">{Math.round(scale * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400">Canvas Fill:</span>
            <div className="flex rounded-xl bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                onClick={() => setBgFill("transparent")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  bgFill === "transparent" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Transparent
              </button>
              <button
                type="button"
                onClick={() => setBgFill("white")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  bgFill === "white" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                White
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar Footer */}
        <div className="border-t border-neutral-800 bg-neutral-900/50 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Editor Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsCropActive(!isCropActive)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                isCropActive 
                  ? "bg-amber-500 border-amber-500 text-neutral-950 font-bold" 
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white"
              }`}
            >
              {isCropActive ? "✓ Crop Box Active" : "Crop Rectangle"}
            </button>
            <button
              onClick={handleRotate}
              className="rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white px-4 py-2 text-xs font-semibold transition"
            >
              Rotate 90°
            </button>
            <button
              onClick={handleRemoveBackground}
              disabled={aiProcessing}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 px-4 py-2 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              AI Remove BG
            </button>
          </div>

          {/* Cancel/Save Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-700 hover:bg-neutral-800 px-5 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={loading || aiProcessing}
              className="rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-5 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </button>
            <button
              onClick={handleSave}
              disabled={loading || aiProcessing}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Baking..." : "Apply & Save"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
