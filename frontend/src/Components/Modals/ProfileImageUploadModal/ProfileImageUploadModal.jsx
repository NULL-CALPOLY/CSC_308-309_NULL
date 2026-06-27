import { useState, useRef, useCallback, useEffect } from 'react';

const CROP_SIZE = 280;

// ── Canvas crop helper ──
async function getCroppedBlob(imageSrc, cropPx) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropPx.width;
      canvas.height = cropPx.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        cropPx.x,
        cropPx.y,
        cropPx.width,
        cropPx.height,
        0,
        0,
        cropPx.width,
        cropPx.height
      );
      canvas.toBlob(
        (blob) => {
          blob ? resolve(blob) : reject(new Error('Canvas is empty'));
        },
        'image/jpeg',
        0.92
      );
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

// existingPublicId: if set, PATCH (replace + delete old) instead of POST (fresh upload)
export default function ProfileImageUploadModal({
  isOpen,
  onClose,
  onSuccess,
  existingPublicId,
}) {
  const [step, setStep] = useState('select'); // 'select' | 'crop' | 'uploading' | 'done'
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [renderedSize, setRenderedSize] = useState({ w: 0, h: 0 });

  const cropContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const croppedBlobRef = useRef(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setImageSrc(null);
      setError('');
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setRenderedSize({ w: 0, h: 0 });
      setImageSize({ w: 0, h: 0 });
    }
  }, [isOpen]);

  // ── File validation & load ──
  const loadFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are accepted (JPG, PNG, WEBP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max size is 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  // ── Drop zone ──
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  // ── Crop clamp ──
  const clampCrop = useCallback((x, y, imgW, imgH, z) => {
    const scaledW = imgW * z;
    const scaledH = imgH * z;
    const maxX = Math.max(0, (scaledW - CROP_SIZE) / 2);
    const maxY = Math.max(0, (scaledH - CROP_SIZE) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const onMouseDown = (e) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!isDraggingCrop || !dragStart) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCrop(clampCrop(newX, newY, imageSize.w, imageSize.h, zoom));
    },
    [isDraggingCrop, dragStart, imageSize, zoom, clampCrop]
  );

  const onMouseUp = () => setIsDraggingCrop(false);

  const onWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.min(3, Math.max(1, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
    setCrop((c) => clampCrop(c.x, c.y, imageSize.w, imageSize.h, newZoom));
  };

  // Track both natural and rendered size on image load
  const onImageLoad = (e) => {
    setImageSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setRenderedSize({ w: e.target.width, h: e.target.height });
  };

  // ── Confirm crop: compute pixel coords using actual rendered dimensions ──
  const confirmCrop = async () => {
    if (!imageSrc || !imageSize.w || !renderedSize.w) return;
    try {
      // Scale from rendered (screen) pixels → natural image pixels
      const scaleX = imageSize.w / renderedSize.w;
      const scaleY = imageSize.h / renderedSize.h;

      const containerW = cropContainerRef.current.clientWidth;
      const containerH = cropContainerRef.current.clientHeight;

      // Where the image center sits after the CSS transform
      const imgCenterX = containerW / 2 + crop.x;
      const imgCenterY = containerH / 2 + crop.y;

      // Top-left corner of the zoomed rendered image
      const renderedImgLeft = imgCenterX - (renderedSize.w * zoom) / 2;
      const renderedImgTop = imgCenterY - (renderedSize.h * zoom) / 2;

      // Top-left corner of the crop window on screen
      const cropLeft = containerW / 2 - CROP_SIZE / 2;
      const cropTop = containerH / 2 - CROP_SIZE / 2;

      // Crop box relative to the zoomed rendered image, then scale back to natural pixels
      const cropPx = {
        x: Math.round(((cropLeft - renderedImgLeft) / zoom) * scaleX),
        y: Math.round(((cropTop - renderedImgTop) / zoom) * scaleY),
        width: Math.round((CROP_SIZE / zoom) * scaleX),
        height: Math.round((CROP_SIZE / zoom) * scaleY),
      };

      // Clamp to image bounds so we never request out-of-range pixels
      cropPx.x = Math.max(0, Math.min(cropPx.x, imageSize.w - cropPx.width));
      cropPx.y = Math.max(0, Math.min(cropPx.y, imageSize.h - cropPx.height));

      croppedBlobRef.current = await getCroppedBlob(imageSrc, cropPx);
      handleUpload(croppedBlobRef.current);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
  };

  if (!isOpen) return null;

  // ── Upload to backend ──
  // If existingPublicId is set (user already has a profile pic), use PATCH to
  // replace it and delete the old one. Otherwise use POST for a fresh upload.
  const handleUpload = async (blob) => {
    setStep('uploading');
    try {
      const formData = new FormData();
      formData.append('file', blob, 'cropped.jpg');

      let res;

      if (existingPublicId) {
        // Replace existing image — backend deletes old one from Cloudinary first
        res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/image/${encodeURIComponent(existingPublicId)}`,
          { method: 'PATCH', body: formData }
        );
      } else {
        // No previous image — fresh upload
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/image/upload`, {
          method: 'POST',
          body: formData,
        });
      }

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          'Server returned an unexpected response. Please try again.'
        );
      }
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Upload failed');

      setStep('done');
      onSuccess?.(json);
    } catch (err) {
      setError(err.message);
      setStep('crop');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-[6px] z-[6000] flex items-center justify-center [animation:iup-fade-in_0.2s_ease]"
      onClick={onClose}>
      <div
        className="bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 w-full max-w-[480px] shadow-[0_24px_60px_rgba(0,0,0,0.6)] [animation:iup-slide-in_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-[1.2rem] font-bold text-white font-[Consolas,monospace]">
            {step === 'select' && 'Upload Photo'}
            {step === 'crop' && 'Crop Photo'}
            {step === 'uploading' && 'Uploading…'}
            {step === 'done' && 'Upload Complete'}
          </h2>
          <button
            className="bg-[rgba(255,255,255,0.06)] border-none text-[rgba(255,255,255,0.5)] w-[30px] h-[30px] rounded-full text-[0.75rem] cursor-pointer flex items-center justify-center transition-[background,color] duration-200 hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
            onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ── STEP: SELECT ── */}
        {step === 'select' && (
          <div
            className={`border-2 border-dashed rounded-[14px] py-12 px-8 text-center cursor-pointer transition-[border-color,background] duration-200 ${
              isDragging
                ? 'border-[#7c3aed] bg-[rgba(124,58,237,0.08)]'
                : 'border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.04)] hover:border-[#7c3aed] hover:bg-[rgba(124,58,237,0.08)]'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}>
            <div className="text-[2.5rem] mb-3">📁</div>
            <p className="m-0 mb-1 text-[1rem] font-semibold text-white">Drop your image here</p>
            <p className="m-0 mb-3 text-[0.875rem] text-[rgba(255,255,255,0.4)]">or click to browse</p>
            <p className="m-0 text-[0.75rem] text-[rgba(255,255,255,0.25)]">JPG, PNG, WEBP · Max 10 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => loadFile(e.target.files[0])}
            />
          </div>
        )}

        {/* ── STEP: CROP ── */}
        {step === 'crop' && imageSrc && (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-[0.78rem] text-[rgba(255,255,255,0.35)] text-center">Drag to reposition · Scroll to zoom</p>

            <div
              ref={cropContainerRef}
              className="relative w-full h-[320px] overflow-hidden rounded-[12px] bg-black flex items-center justify-center select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onWheel={onWheel}
              style={{ cursor: isDraggingCrop ? 'grabbing' : 'grab' }}>
              <img
                src={imageSrc}
                className="absolute max-w-none max-h-none w-auto h-full pointer-events-none will-change-transform"
                draggable={false}
                onLoad={onImageLoad}
                style={{
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                }}
                alt="crop preview"
              />

              {/* Dark overlay with circular cutout */}
              <div className="iup-crop-overlay absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="iup-crop-window relative rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] border-2 border-[rgba(124,58,237,0.8)] z-[1]"
                  style={{ width: CROP_SIZE, height: CROP_SIZE }}
                />
              </div>
            </div>

            {/* Zoom row */}
            <div className="flex items-center gap-3">
              <span className="text-[0.75rem] text-[rgba(255,255,255,0.4)] min-w-[36px]">Zoom</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => {
                  const z = parseFloat(e.target.value);
                  setZoom(z);
                  setCrop((c) =>
                    clampCrop(c.x, c.y, imageSize.w, imageSize.h, z)
                  );
                }}
                className="flex-1 appearance-none h-[4px] bg-[rgba(255,255,255,0.1)] rounded-[2px] outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7c3aed] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[0.75rem] text-[rgba(255,255,255,0.4)] min-w-[32px] text-right">{zoom.toFixed(1)}×</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                className="py-[0.65rem] px-5 rounded-[8px] text-[0.875rem] font-bold cursor-pointer border-[1.5px] border-[rgba(255,255,255,0.15)] bg-transparent text-[rgba(255,255,255,0.6)] transition-all duration-200 ease-[ease] tracking-[0.02em] hover:border-[rgba(255,255,255,0.4)] hover:text-white"
                onClick={() => setStep('select')}>
                Change Photo
              </button>
              <button
                className="py-[0.65rem] px-5 rounded-[8px] text-[0.875rem] font-bold cursor-pointer border-none bg-[#7c3aed] text-white transition-all duration-200 ease-[ease] tracking-[0.02em] hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]"
                onClick={confirmCrop}>
                Upload Photo
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: UPLOADING ── */}
        {step === 'uploading' && (
          <div className="flex flex-col items-center gap-4 py-8 text-[rgba(255,255,255,0.7)] text-[0.9rem]">
            <div className="w-10 h-10 border-[3px] border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full [animation:iup-spin_0.7s_linear_infinite]" />
            <p>Uploading your photo…</p>
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-8 text-[rgba(255,255,255,0.7)] text-[0.9rem]">
            <div className="w-[52px] h-[52px] rounded-full bg-[rgba(124,58,237,0.2)] border-2 border-[#7c3aed] flex items-center justify-center text-[1.4rem] text-[#a78bfa]">✓</div>
            <p>Photo uploaded successfully!</p>
            <button
              className="py-[0.65rem] px-5 rounded-[8px] text-[0.875rem] font-bold cursor-pointer border-none bg-[#7c3aed] text-white transition-all duration-200 ease-[ease] tracking-[0.02em] hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]"
              onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-[0.78rem] text-[#f87171] text-center">{error}</p>}
      </div>
    </div>
  );
}
