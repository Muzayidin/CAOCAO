'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, ZapOff, RefreshCw } from 'lucide-react';

interface QrCameraScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function QrCameraScanner({
  onScan,
  onClose,
  title = 'Scanner QR Code',
  subtitle = 'Arahkan kamera ke QR Code',
}: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [camError, setCamError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
    setScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Dynamically import jsQR to avoid SSR issues
    import('jsqr').then(({ default: jsQR }) => {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setDetected(true);
        stopCamera();
        setTimeout(() => {
          onScan(code.data);
        }, 300);
      } else {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    });
  }, [onScan, stopCamera]);

  const startCamera = useCallback(async () => {
    setCamError(null);
    setIsReady(false);
    setDetected(false);

    // Check if navigator.mediaDevices is supported (e.g. secure context check)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isHttp = typeof window !== 'undefined' && window.location.protocol === 'http:';
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      if (isHttp && !isLocal) {
        setCamError(
          'Akses kamera diblokir oleh browser karena koneksi tidak aman (HTTP). ' +
          'Buka aplikasi menggunakan HTTPS (SSL) atau gunakan input manual di bawah ini.'
        );
      } else {
        setCamError('Browser perangkat ini tidak mendukung akses kamera.');
      }
      return;
    }

    // Try multiple constraints options from ideal to minimal
    const constraintOptions = [
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      {
        video: {
          facingMode: 'environment'
        }
      },
      {
        video: true
      }
    ];

    let lastError: any = null;
    let stream: MediaStream | null = null;

    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break; // Successfully got stream
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      const message =
        lastError?.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.'
          : lastError?.name === 'NotFoundError'
          ? 'Kamera tidak ditemukan pada perangkat Anda.'
          : lastError?.name === 'NotReadableError'
          ? 'Kamera sedang digunakan oleh aplikasi lain.'
          : `Gagal mengakses kamera: ${lastError?.message || 'Hubungkan kamera kembali'}`;
      setCamError(message);
      return;
    }

    try {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsReady(true);
            setScanning(true);
            animFrameRef.current = requestAnimationFrame(scanFrame);
          }).catch((e) => {
            setCamError(`Gagal memutar video kamera: ${e.message}`);
          });
        };
      }
    } catch (err: any) {
      setCamError(`Gagal menyambungkan kamera ke penampil video: ${err.message}`);
    }
  }, [scanFrame]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-cafe-100 animate-scale-up overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-cafe-100">
          <div>
            <h3 className="font-extrabold text-cafe-900 text-sm flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-earth-olive animate-pulse" />
              {title}
            </h3>
            <p className="text-[9px] text-cafe-400 uppercase font-black tracking-wider mt-0.5">
              {subtitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 hover:bg-cafe-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-black aspect-square overflow-hidden">
          
          {/* Live Video */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            playsInline
            muted
            autoPlay
          />

          {/* Hidden canvas for jsQR frame processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading overlay */}
          {!isReady && !camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-3">
              <Camera className="w-12 h-12 animate-pulse" />
              <p className="text-xs font-semibold">Memuat kamera...</p>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error overlay */}
          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 gap-3 bg-cafe-950/90">
              <ZapOff className="w-10 h-10 text-red-400" />
              <p className="text-xs font-semibold text-center leading-relaxed text-white/80">
                {camError}
              </p>
              <button
                onClick={startCamera}
                className="flex items-center gap-1.5 px-4 py-2 bg-earth-olive text-white rounded-xl text-xs font-bold mt-1 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Detected flash overlay */}
          {detected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-[2px]">
              <div className="w-20 h-20 rounded-full bg-green-500/30 border-4 border-green-400 flex items-center justify-center animate-ping-once">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-300 font-extrabold text-sm mt-4 drop-shadow">QR Terdeteksi!</p>
            </div>
          )}

          {/* Scan frame corners (visible when camera is ready) */}
          {isReady && !detected && (
            <>
              {/* Corner markers */}
              <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-earth-olive rounded-tl-sm" />
              <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-earth-olive rounded-tr-sm" />
              <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-earth-olive rounded-bl-sm" />
              <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-earth-olive rounded-br-sm" />
              
              {/* Scanning laser line */}
              <div className="absolute left-10 right-10 h-0.5 bg-earth-olive/80 shadow-[0_0_8px_2px_rgba(107,142,35,0.6)] animate-scan-laser" />
            </>
          )}

          {/* Scanning badge */}
          {scanning && !detected && isReady && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Memindai QR Code...
              </span>
            </div>
          )}
        </div>

        {/* Footer hint & Manual input fallback */}
        <div className="px-5 py-4 bg-cafe-50/50 border-t border-cafe-100/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                stopCamera();
                onScan(manualCode.trim());
              }
            }}
            className="space-y-3"
          >
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-cafe-500 uppercase tracking-wider block">
                Kamera bermasalah / Input manual
              </span>
              <p className="text-[9px] text-cafe-400 font-semibold mt-0.5 leading-relaxed">
                Ketik PIN staf, kode unik sinkronisasi, atau kode QR di bawah ini:
              </p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: CAO-STAFF-2026 atau 1111"
                className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-white font-mono font-bold tracking-wider"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-cafe-800 hover:bg-cafe-950 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                Kirim
              </button>
            </div>
          </form>

          <p className="text-[9px] text-cafe-400 font-semibold mt-4 text-center leading-relaxed">
            *Akses kamera di HP memerlukan koneksi aman (HTTPS). Gunakan input manual jika menggunakan HTTP lokal.
          </p>
        </div>
      </div>
    </div>
  );
}
