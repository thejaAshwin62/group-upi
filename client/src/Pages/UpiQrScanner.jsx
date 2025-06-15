import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const UpiQrScanner = () => {
  const [upiId, setUpiId] = useState("");
  const [rawData, setRawData] = useState("");
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef(null);
  const isScannerRunning = useRef(false);

  useEffect(() => {
    // Ensure div is present
    if (!document.getElementById(qrCodeRegionId)) return;

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;

        html5QrCodeRef.current
          .start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              handleScan(decodedText);
            },
            (errorMessage) => {
              // Optional: console.log(`QR Code no match: ${errorMessage}`);
            }
          )
          .then(() => {
            isScannerRunning.current = true;
          })
          .catch((err) => {
            console.error(`Unable to start scanning: ${err}`);
          });
      }
    });

    return () => {
      if (html5QrCodeRef.current && isScannerRunning.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current.clear();
            isScannerRunning.current = false;
          })
          .catch((err) => {
            console.warn("Scanner stop error: ", err);
          });
      }
    };
  }, []);

  const handleScan = (data) => {
    if (data) {
      setRawData(data);
      try {
        const upiUrl = new URL(data);
        const params = new URLSearchParams(upiUrl.search);
        const pa = params.get("pa");
        setUpiId(pa || "UPI ID not found");
      } catch {
        setUpiId("Invalid QR code format");
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Scan Shop QR to Get UPI ID</h2>
      <div id={qrCodeRegionId} style={{ width: "300px" }}></div>
      <div className="mt-4">
        <p>
          <strong>Raw QR Data:</strong> {rawData}
        </p>
        <p>
          <strong>UPI ID:</strong> {upiId}
        </p>
      </div>
    </div>
  );
};

export default UpiQrScanner;
