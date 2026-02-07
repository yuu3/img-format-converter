import { useState, useRef, useEffect } from 'react';
import type { CropArea } from '../types';
import './ImageCropper.css';

type ImageCropperProps = {
  imageUrl: string;
  onCrop: (cropArea: CropArea) => void;
  onCancel: () => void;
}

export const ImageCropper = ({ imageUrl, onCrop, onCancel }: ImageCropperProps) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height,
          1
        );
        setImageSize({
          width: img.width * scale,
          height: img.height * scale
        });

        // Initialize crop area to center 50% of image
        const initialWidth = (img.width * scale) * 0.5;
        const initialHeight = (img.height * scale) * 0.5;
        setCropArea({
          x: ((img.width * scale) - initialWidth) / 2,
          y: ((img.height * scale) - initialHeight) / 2,
          width: initialWidth,
          height: initialHeight
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize' && handle) {
      setIsResizing(handle);
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (isDragging) {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + deltaY))
      }));
    } else if (isResizing) {
      setCropArea(prev => {
        let newCrop = { ...prev };

        switch (isResizing) {
          case 'nw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, Math.min(imageSize.width - prev.x, prev.width + deltaX));
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, Math.min(imageSize.height - prev.y, prev.height + deltaY));
            break;
          case 'se':
            newCrop.width = Math.max(50, Math.min(imageSize.width - prev.x, prev.width + deltaX));
            newCrop.height = Math.max(50, Math.min(imageSize.height - prev.y, prev.height + deltaY));
            break;
        }

        return newCrop;
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const handleCrop = () => {
    // Convert display coordinates to original image coordinates
    const img = imageRef.current;
    if (!img) return;

    const scaleX = img.naturalWidth / imageSize.width;
    const scaleY = img.naturalHeight / imageSize.height;

    const originalCropArea: CropArea = {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    };

    onCrop(originalCropArea);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        <div className="cropper-header">
          <h2>画像をトリミング</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div
          ref={containerRef}
          className="cropper-canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            style={{ width: imageSize.width, height: imageSize.height }}
            draggable={false}
          />

          {imageSize.width > 0 && (
            <>
              {/* Overlay */}
              <div className="crop-overlay" style={{
                width: imageSize.width,
                height: imageSize.height
              }}>
                <div className="crop-area" style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height
                }}>
                  <div
                    className="crop-drag-area"
                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                  />

                  {/* Resize handles */}
                  <div className="resize-handle nw" onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')} />
                  <div className="resize-handle ne" onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')} />
                  <div className="resize-handle sw" onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')} />
                  <div className="resize-handle se" onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="cropper-footer">
          <button className="cancel-btn" onClick={onCancel}>
            キャンセル
          </button>
          <button className="crop-btn" onClick={handleCrop}>
            トリミング適用
          </button>
        </div>
      </div>
    </div>
  );
};
