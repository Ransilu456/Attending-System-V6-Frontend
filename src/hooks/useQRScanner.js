import { useState, useRef, useCallback, useEffect } from "react";
import jsQR from "jsqr";

const useQRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const startScanner = useCallback(async () => {
    setError(null);
    setScannedData(null);
    setScanning(true);

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          animationRef.current = requestAnimationFrame(processFrame);
        };
      }
    } catch (err) {
      setError("Failed to access camera: " + err.message);
      setScanning(false);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  }, []);

  const processFrame = useCallback(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("QR Code detected:", code.data);

        try {
          const qrData = JSON.parse(code.data);
          setScannedData(qrData);
          stopScanner();
          return;
        } catch (e) {
          setScannedData({ rawData: code.data });
          stopScanner();
          return;
        }
      }
    } catch (err) {
      console.error("Error processing frame:", err);
    }
    animationRef.current = requestAnimationFrame(processFrame);
  }, [scanning, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return {
    videoRef,
    canvasRef,
    scanning,
    scannedData,
    error,
    startScanner,
    stopScanner,
  };
};

export default useQRScanner;
