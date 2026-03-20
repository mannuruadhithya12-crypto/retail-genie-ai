import React from 'react';

interface ARControlsProps {
  onToggleMirror: () => void;
  onResetAlignment: () => void;
  onCaptureScreenshot: () => void;
  isMirrorMode: boolean;
}

export function ARControls({ onToggleMirror, onResetAlignment, onCaptureScreenshot, isMirrorMode }: ARControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 p-4 rounded-full backdrop-blur-md">
      <button 
        onClick={onToggleMirror}
        className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
      >
        {isMirrorMode ? 'Standard View' : 'Mirror Flip'}
      </button>
      <button 
        onClick={onResetAlignment}
        className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
      >
        Reset Align
      </button>
      <button 
        onClick={onCaptureScreenshot}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition"
      >
        Capture Snap
      </button>
    </div>
  );
}
