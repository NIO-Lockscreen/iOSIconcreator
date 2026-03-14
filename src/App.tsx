import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Settings, Smartphone, Image as ImageIcon, Move } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setImageSrc(src);
        const img = new Image();
        img.onload = () => {
          setImage(img);
          const initScale = Math.max(300 / img.width, 300 / img.height);
          setPos({ x: (300 - img.width * initScale) / 2, y: (300 - img.height * initScale) / 2 });
          setScale(initScale);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setPos({ x: e.touches[0].clientX - startPos.x, y: e.touches[0].clientY - startPos.y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (newScale: number) => {
    if (!image) return;
    const scaleRatio = newScale / scale;
    const newX = 150 - (150 - pos.x) * scaleRatio;
    const newY = 150 - (150 - pos.y) * scaleRatio;
    setScale(newScale);
    setPos({ x: newX, y: newY });
  };

  const exportIcon = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw image
    const factor = 1024 / 300;
    const drawX = pos.x * factor;
    const drawY = pos.y * factor;
    const drawW = image.width * scale * factor;
    const drawH = image.height * scale * factor;

    ctx.drawImage(image, drawX, drawY, drawW, drawH);

    // Export
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'icon.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <h1 className="font-semibold text-lg">iOS Icon Maker</h1>
        </div>
        <button 
          onClick={exportIcon} 
          disabled={!image} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          Export icon.png
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">1. Upload Image</h2>
            <label className="block w-full border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Upload className="mx-auto text-neutral-400 mb-3" size={24} />
              <p className="text-sm font-medium text-neutral-700">Click to upload image</p>
              <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 10MB</p>
            </label>
          </div>

          <div className={`bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 transition-opacity ${!image ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">2. Adjust & Compose</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-2">
                  <span>Scale</span>
                  <span className="text-neutral-500">{Math.round(scale * 100)}%</span>
                </label>
                <input 
                  type="range" 
                  min={image ? Math.min(300/image.width, 300/image.height) * 0.1 : 0.1} 
                  max={image ? Math.max(300/image.width, 300/image.height) * 5 : 5} 
                  step="0.01"
                  value={scale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Background Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">iOS icons cannot have transparency. The background color will fill any transparent areas.</p>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => {
                    if(image) {
                      const initScale = Math.max(300 / image.width, 300 / image.height);
                      setPos({ x: (300 - image.width * initScale) / 2, y: (300 - image.height * initScale) / 2 });
                      setScale(initScale);
                    }
                  }}
                  className="w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Reset Position & Scale
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Settings size={16} />
              iOS Icon Best Practices
            </h3>
            <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
              <li><strong>Keep it simple:</strong> Find a single element that captures the essence of your app.</li>
              <li><strong>No transparency:</strong> iOS icons must be opaque. The system will add a black background if you leave it transparent.</li>
              <li><strong>Don't add the mask:</strong> The system automatically applies the rounded corners (squircle). Export as a square.</li>
              <li><strong>Avoid text:</strong> Text is hard to read at small sizes. Use the app name below the icon instead.</li>
            </ul>
          </div>
        </div>

        {/* Right: Previews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Large Preview */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center min-h-[500px]">
            <h2 className="text-lg font-medium text-neutral-800 mb-8">App Store Preview (1024x1024)</h2>
            
            <div 
              className="relative shadow-2xl bg-white overflow-hidden select-none"
              style={{ 
                width: 300, 
                height: 300, 
                borderRadius: '22.5%', // iOS Squircle approximation
                backgroundColor: bgColor,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {!image && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 pointer-events-none">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">No image</span>
                </div>
              )}
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt="Icon element" 
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    width: image?.width ? image.width * scale : 'auto',
                    height: image?.height ? image.height * scale : 'auto',
                    maxWidth: 'none',
                    pointerEvents: 'none'
                  }}
                />
              )}
              
              {/* Grid overlay for alignment */}
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[inherit]"></div>
            </div>
            
            <p className="text-sm text-neutral-500 mt-8 flex items-center gap-2">
              <Move size={16} />
              Drag image to reposition
            </p>
          </div>

          {/* Home Screen Context Preview */}
          <div className="bg-neutral-900 p-8 rounded-3xl shadow-xl overflow-hidden relative">
            <h2 className="text-lg font-medium text-white mb-8 relative z-10 text-center">Home Screen Context</h2>
            
            {/* Simulated Wallpaper */}
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="relative z-10 flex justify-center">
              <div className="grid grid-cols-4 gap-x-6 gap-y-8 max-w-sm w-full">
                {/* Dummy Icon 1 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-green-400 to-green-500 shadow-sm"></div>
                  <span className="text-[11px] text-white font-medium">Messages</span>
                </div>
                {/* Dummy Icon 2 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-blue-400 to-blue-500 shadow-sm"></div>
                  <span className="text-[11px] text-white font-medium">Mail</span>
                </div>
                {/* Dummy Icon 3 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-[22.5%] bg-white shadow-sm flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"></div>
                  </div>
                  <span className="text-[11px] text-white font-medium">Photos</span>
                </div>
                
                {/* Our Custom Icon */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="w-16 h-16 rounded-[22.5%] shadow-md overflow-hidden relative"
                    style={{ backgroundColor: bgColor }}
                  >
                    {imageSrc && (
                      <img 
                        src={imageSrc} 
                        alt="Preview" 
                        style={{
                          position: 'absolute',
                          left: pos.x * (64 / 300),
                          top: pos.y * (64 / 300),
                          width: image?.width ? image.width * scale * (64 / 300) : 'auto',
                          height: image?.height ? image.height * scale * (64 / 300) : 'auto',
                          maxWidth: 'none'
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[11px] text-white font-medium">My App</span>
                </div>
                
                {/* More Dummy Icons */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-gray-700 to-gray-800 shadow-sm"></div>
                  <span className="text-[11px] text-white font-medium">Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
