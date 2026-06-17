import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, src, alt = 'Image Preview' }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset transforms when image changes or modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, src]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename or fallback
      const filename = src.split('/').pop() || 'downloaded-image';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback if CORS prevents blob fetch
      window.open(src, '_blank');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all duration-300 ease-out"
    >
      {/* Control panel (Glassmorphism design) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white shadow-lg backdrop-blur-md"
      >
        <button
          onClick={handleZoomIn}
          className="rounded-full p-2 transition hover:bg-white/20 active:scale-95"
          title="Phóng to"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-full p-2 transition hover:bg-white/20 active:scale-95"
          title="Thu nhỏ"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleRotate}
          className="rounded-full p-2 transition hover:bg-white/20 active:scale-95"
          title="Xoay ảnh"
        >
          <RotateCw size={18} />
        </button>
        <button
          onClick={handleDownload}
          className="rounded-full p-2 transition hover:bg-white/20 active:scale-95"
          title="Tải xuống"
        >
          <Download size={18} />
        </button>
        <span className="h-5 w-px bg-white/20 mx-1"></span>
        <button
          onClick={onClose}
          className="rounded-full bg-white/20 p-2 text-white transition hover:bg-red-500 hover:text-white active:scale-95"
          title="Đóng (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image container */}
      <div
        className="flex max-h-[85vh] max-w-[90vw] items-center justify-center overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default ImageModal;
