import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

const UpiQrScanner = ({ onUpiFound }) => {
  const html5QrCode = useRef(null);
  const [lastScannedText, setLastScannedText] = useState("");
  const [scanStatus, setScanStatus] = useState("Initializing...");
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const qrReaderRef = useRef(null);

  const cleanupScanner = async () => {
    try {
      if (html5QrCode.current && isScanning) {
        await html5QrCode.current.stop();
        setIsScanning(false);
      }
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  };

  const initializeScanner = async () => {
    if (!qrReaderRef.current || html5QrCode.current) return;

    try {
      html5QrCode.current = new Html5Qrcode("qr-reader");
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        setScanStatus("No cameras found");
        return;
      }

      await html5QrCode.current.start(
        devices[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => handleQrCodeSuccess(decodedText),
        (errorMessage) => {
          if (!errorMessage.includes("NotFound")) {
            console.log("QR Error:", errorMessage);
          }
        }
      );

      setIsScanning(true);
      setScanStatus("Scanner running - point at a QR code");
    } catch (err) {
      console.error("Scanner startup error:", err);
      setScanStatus("Failed to start scanner");
    }
  };

  useEffect(() => {
    if (!uploadedImage) {
      const timeoutId = setTimeout(initializeScanner, 1000);
      return () => {
        clearTimeout(timeoutId);
        cleanupScanner();
      };
    }
  }, [uploadedImage]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Stop any ongoing camera scan first
      await cleanupScanner();
      
      setScanStatus("Processing uploaded QR code...");
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Create new instance if needed
      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode("qr-reader");
      }

      // Set up configuration for better QR code detection
      const config = {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      console.log("Reading uploaded QR code image...");
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try scanning with different configurations if first attempt fails
      try {
        const result = await html5QrCode.current.scanFile(file, true);
        console.log("QR Code scan result:", result);
        handleQrCodeSuccess(result);
      } catch (initialError) {
        console.log("Initial scan failed, trying alternative configuration...");
        
        // Try with different settings
        const alternativeConfig = {
          ...config,
          experimentalFeatures: {
            ...config.experimentalFeatures,
            quietZone: true
          }
        };
        
        try {
          const result = await html5QrCode.current.scanFile(file, true, alternativeConfig);
          console.log("QR Code scan result (alternative):", result);
          handleQrCodeSuccess(result);
        } catch (alternativeError) {
          throw new Error("Failed to scan QR code with both configurations");
        }
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      setScanStatus("Failed to scan QR code. Please ensure the image is clear and contains a valid QR code.");
      
      // Clear the uploaded image after a delay
      setTimeout(() => {
        setUploadedImage(null);
        initializeScanner();
      }, 3000);
    }
  };

  const extractUpiId = (text) => {
    if (!text) return null;
    console.log("Raw QR Text:", text);

    try {
      // Handle standard UPI URLs
      if (text.startsWith("upi://")) {
        const params = new URLSearchParams(text.split("upi://")[1]);
        const pa = params.get("pa");
        if (pa) return pa;
      }

      // Handle modern UPI URLs
      if (text.startsWith("upi:")) {
        const url = new URL(text);
        const params = new URLSearchParams(url.search);
        const pa = params.get("pa");
        if (pa) return pa;
      }

      // Handle direct UPI IDs
      if (text.includes("@")) {
        const upiPattern = /[\w.-]+@[\w.-]+/;
        const match = text.match(upiPattern);
        if (match) return match[0];
      }

      return null;
    } catch (error) {
      console.error("Error parsing QR code:", error);
      return null;
    }
  };

  const handleQrCodeSuccess = async (decodedText) => {
    if (!decodedText) return;

    setLastScannedText(decodedText);
    console.log("QR Code Detected! Content:", decodedText);

    const upiId = extractUpiId(decodedText);
    if (upiId) {
      setScanStatus(`Found UPI ID: ${upiId}`);
      await cleanupScanner();
      onUpiFound(upiId);
    } else {
      setScanStatus("Invalid QR code - No UPI ID found");
    }
  };

  return (
    <div className="relative">
      <div
        id="qr-reader"
        ref={qrReaderRef}
        style={{ width: "100%", maxWidth: "500px" }}
        className="mx-auto"
      >
        {uploadedImage && (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded QR Code"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <button
              onClick={async () => {
                setUploadedImage(null);
                setScanStatus("Restarting camera scanner...");
                await new Promise(resolve => setTimeout(resolve, 500));
                initializeScanner();
              }}
              className="absolute top-2 right-2 p-2 bg-gray-800/50 hover:bg-gray-800/70 text-white rounded-full transition-colors"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {scanStatus}
        </p>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            For testing: Upload a QR code image
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload QR Code
          </button>
        </div>

        {lastScannedText && (
          <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <p className="font-mono break-all">
              Last scanned: {lastScannedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpiQrScanner;
