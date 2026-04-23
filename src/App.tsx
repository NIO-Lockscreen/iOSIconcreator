import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Settings, Smartphone, Image as ImageIcon, Move, Layout, MessageSquare, Camera, Cog, Phone, Mail, Crosshair } from 'lucide-react';

type Mode = 'icon' | 'splash' | 'screenshot-iphone' | 'screenshot-ipad';

const getPreviewConfig = (mode: Mode) => {
  switch (mode) {
    case 'icon':
      return { width: 300, height: 300, radius: '22.5%', title: 'App Store Preview (1024x1024)', exportWidth: 1024, exportHeight: 1024, filename: 'icon.png' };
    case 'splash':
      return { width: 225, height: 487, radius: '40px', title: 'Splash Screen Preview (1284x2778)', exportWidth: 1284, exportHeight: 2778, filename: 'splash.png' };
    case 'screenshot-iphone':
      return { width: 225, height: 487, radius: '0px', title: 'iPhone 6.5" Screenshot (1284x2778)', exportWidth: 1284, exportHeight: 2778, filename: 'screenshot_iphone.png' };
    case 'screenshot-ipad':
      return { width: 300, height: 400, radius: '0px', title: 'iPad 13" Screenshot (2048x2732)', exportWidth: 2048, exportHeight: 2732, filename: 'screenshot_ipad.png' };
  }
};

export default function App() {
  const [mode, setMode] = useState<Mode>('icon');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const previewConfig = getPreviewConfig(mode);
  const previewSize = { width: previewConfig.width, height: previewConfig.height };

  useEffect(() => {
    // Reset position and scale when switching modes
    if (image) {
      const initScale = Math.max(previewSize.width / image.width, previewSize.height / image.height);
      setPos({ x: (previewSize.width - image.width * initScale) / 2, y: (previewSize.height - image.height * initScale) / 2 });
      setScale(initScale);
    }
  }, [mode, previewSize.width, previewSize.height]);

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
          const initScale = Math.max(previewSize.width / img.width, previewSize.height / img.height);
          setPos({ x: (previewSize.width - img.width * initScale) / 2, y: (previewSize.height - img.height * initScale) / 2 });
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
    const centerX = previewSize.width / 2;
    const centerY = previewSize.height / 2;
    const scaleRatio = newScale / scale;
    const newX = centerX - (centerX - pos.x) * scaleRatio;
    const newY = centerY - (centerY - pos.y) * scaleRatio;
    setScale(newScale);
    setPos({ x: newX, y: newY });
  };

  const exportIcon = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    
    canvas.width = previewConfig.exportWidth;
    canvas.height = previewConfig.exportHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const factor = canvas.width / previewSize.width;
    const drawX = pos.x * factor;
    const drawY = pos.y * factor;
    const drawW = image.width * scale * factor;
    const drawH = image.height * scale * factor;

    ctx.drawImage(image, drawX, drawY, drawW, drawH);

    // Export
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = previewConfig.filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <h1 className="font-semibold text-lg whitespace-nowrap">iOS Asset Studio</h1>
          </div>
          
          <div className="flex bg-neutral-100 p-1 rounded-full overflow-x-auto custom-scrollbar">
            <button 
              onClick={() => setMode('icon')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === 'icon' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              App Icon
            </button>
            <button 
              onClick={() => setMode('splash')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === 'splash' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Splash Screen
            </button>
            <button 
              onClick={() => setMode('screenshot-iphone')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === 'screenshot-iphone' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              iPhone 6.5"
            </button>
            <button 
              onClick={() => setMode('screenshot-ipad')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === 'screenshot-ipad' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              iPad 13"
            </button>
          </div>
        </div>
        <button 
          onClick={exportIcon} 
          disabled={!image} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Download size={16} />
          Export
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
                  min={image ? Math.min(previewSize.width/image.width, previewSize.height/image.height) * 0.1 : 0.1} 
                  max={image ? Math.max(previewSize.width/image.width, previewSize.height/image.height) * 10 : 10} 
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
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-700 mb-4 bg-neutral-50 p-3 rounded-lg border border-neutral-200 transition-colors hover:bg-neutral-100">
                  <input 
                    type="checkbox" 
                    checked={showCenterGuide} 
                    onChange={(e) => setShowCenterGuide(e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <Crosshair size={16} className="text-neutral-500" />
                  Show Center Alignment Guide
                </label>
                <button 
                  onClick={() => {
                    if(image) {
                      const initScale = Math.max(previewSize.width / image.width, previewSize.height / image.height);
                      setPos({ x: (previewSize.width - image.width * initScale) / 2, y: (previewSize.height - image.height * initScale) / 2 });
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
              Best Practices
            </h3>
            <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
              {mode === 'icon' && (
                <>
                  <li><strong>Keep it simple:</strong> Find a single element that captures the essence of your app.</li>
                  <li><strong>No transparency:</strong> iOS icons must be opaque. The system will add a black background if you leave it transparent.</li>
                  <li><strong>Don't add the mask:</strong> The system automatically applies the rounded corners (squircle). Export as a square.</li>
                  <li><strong>Avoid text:</strong> Text is hard to read at small sizes. Use the app name below the icon instead.</li>
                </>
              )}
              {mode === 'splash' && (
                <>
                  <li><strong>Brand Identity:</strong> Use your logo and primary brand color for a consistent first impression.</li>
                  <li><strong>Simplicity:</strong> Avoid clutter. A clean logo on a solid or gradient background works best.</li>
                  <li><strong>Safe Area:</strong> Keep important content centered to avoid being cut off by different screen sizes.</li>
                  <li><strong>Resolution:</strong> We export at 1284x2778, which covers the highest resolution iPhone Pro Max models.</li>
                </>
              )}
              {mode === 'screenshot-iphone' && (
                <>
                  <li><strong>Focus on value:</strong> Highlight the main feature of your app in the first screenshot.</li>
                  <li><strong>Avoid status bars:</strong> Apple prefers screenshots without status bars, or a clean status bar.</li>
                  <li><strong>6.5" Display:</strong> The 1284 x 2778 size is required for iPhone Pro Max devices in App Store Connect.</li>
                  <li><strong>Use text:</strong> Unlike the icon, add large, legible text to explain features visually.</li>
                </>
              )}
              {mode === 'screenshot-ipad' && (
                <>
                  <li><strong>iPad specific:</strong> Show how your app uses the larger screen (sidebars, multi-column layouts).</li>
                  <li><strong>Landscape vs Portrait:</strong> Both are supported. This tool exports portrait at 2048 x 2732.</li>
                  <li><strong>Readability:</strong> Text overlays should be large enough to read when the screenshot is scaled down on the iPad screen.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Right: Previews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Large Preview */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center min-h-[500px]">
            <h2 className="text-lg font-medium text-neutral-800 mb-8">
              {previewConfig.title}
            </h2>
            
            <div 
              className="relative shadow-2xl bg-white overflow-hidden select-none"
              style={{ 
                width: previewSize.width, 
                height: previewSize.height, 
                borderRadius: previewConfig.radius,
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
                  alt="Asset element" 
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
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[inherit] overflow-hidden">
                {showCenterGuide && (
                  <>
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-red-500/70 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/70 -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-neutral-500 mt-8 flex items-center gap-2">
              <Move size={16} />
              Drag image to reposition
            </p>
          </div>

          {/* Home Screen Context Preview */}
          {mode === 'icon' && (
            <div className="bg-neutral-900 p-8 rounded-3xl shadow-xl overflow-hidden relative">
              <h2 className="text-lg font-medium text-white mb-8 relative z-10 text-center">Home Screen Context</h2>
              
              {/* Simulated Wallpaper */}
              <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="relative z-10 flex justify-center">
                <div className="grid grid-cols-4 gap-x-6 gap-y-8 max-w-sm w-full">
                  {/* Messages Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-green-400 to-green-500 shadow-sm flex items-center justify-center">
                      <MessageSquare size={32} className="text-white" fill="white" />
                    </div>
                    <span className="text-[11px] text-white font-medium">Messages</span>
                  </div>
                  {/* Mail Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-blue-400 to-blue-500 shadow-sm flex items-center justify-center">
                      <Mail size={32} className="text-white" />
                    </div>
                    <span className="text-[11px] text-white font-medium">Mail</span>
                  </div>
                  {/* Photos Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        {/* 8 Petals of the iOS Photos Icon */}
                        <div className="absolute w-2 h-5 bg-[#FFD60A] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(0deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#FF9F0A] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(45deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#FF3B30] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(90deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#FF2D55] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(135deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#AF52DE] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(180deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#007AFF] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(225deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#5AC8FA] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(270deg)' }}></div>
                        <div className="absolute w-2 h-5 bg-[#34C759] rounded-full opacity-90 origin-bottom" style={{ transform: 'translateY(-50%) rotate(315deg)' }}></div>
                      </div>
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
                  
                  {/* Phone Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-green-500 to-green-600 shadow-sm flex items-center justify-center">
                      <Phone size={32} className="text-white" fill="white" />
                    </div>
                    <span className="text-[11px] text-white font-medium">Phone</span>
                  </div>
                  
                  {/* Camera Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-neutral-200 shadow-sm flex items-center justify-center">
                      <Camera size={32} className="text-neutral-600" />
                    </div>
                    <span className="text-[11px] text-white font-medium">Camera</span>
                  </div>

                  {/* Settings Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-b from-gray-200 to-gray-300 shadow-sm flex items-center justify-center">
                      <Cog size={32} className="text-gray-600 animate-spin-slow" />
                    </div>
                    <span className="text-[11px] text-white font-medium">Settings</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
