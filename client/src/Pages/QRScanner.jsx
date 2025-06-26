"use client";

import { useState, useRef, useEffect } from "react";
import { BackgroundGradient } from "../components/background-gradient";
import { SparklesCore } from "../components/sparkles";
import { AnimatedTooltip } from "../components/animated-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 1,
      upiId: "john@paytm",
      timestamp: "2024-01-15 14:30",
      linked: true,
      memberName: "John Doe",
      amount: 1875,
    },
    {
      id: 2,
      upiId: "jane@gpay",
      timestamp: "2024-01-15 14:25",
      linked: true,
      memberName: "Jane Smith",
      amount: 1875,
    },
    {
      id: 3,
      upiId: "unknown@phonepe",
      timestamp: "2024-01-15 14:20",
      linked: false,
      memberName: null,
      amount: 0,
    },
  ]);

  const videoRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [scanMode, setScanMode] = useState("auto"); // auto, manual

  const groupMembers = [
    { id: 1, name: "John Doe", upiId: "john@paytm", avatar: "JD" },
    { id: 2, name: "Jane Smith", upiId: "jane@gpay", avatar: "JS" },
    { id: 3, name: "Mike Johnson", upiId: "", avatar: "MJ" },
    { id: 4, name: "Sarah Wilson", upiId: "sarah@paytm", avatar: "SW" },
  ];

  const tooltipItems = [
    {
      name: "QR Scanner Tips",
      designation: "Point camera at UPI QR code for best results",
    },
  ];

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const simulateQRScan = () => {
    const mockUPIData = {
      upiId: "newuser@paytm",
      name: "New User",
      timestamp: new Date().toLocaleString(),
      amount: 1875,
    };
    setScannedData(mockUPIData);
    stopScanning();
  };

  const linkToMember = () => {
    if (scannedData && selectedMember) {
      const newScan = {
        id: Date.now(),
        upiId: scannedData.upiId,
        timestamp: scannedData.timestamp,
        linked: true,
        memberName: groupMembers.find((m) => m.id.toString() === selectedMember)
          ?.name,
        amount: scannedData.amount,
      };
      setScanHistory([newScan, ...scanHistory]);
      setScannedData(null);
      setSelectedMember("");
      alert("UPI ID linked successfully!");
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <SparklesCore
        id="qr-scanner-sparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={20}
        className="w-full h-full"
        particleColor="#3B82F6"
      />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
            QR Code Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scan UPI QR codes to extract payment information and link to group
            members
          </p>
        </motion.div>

        {/* Scan Mode Toggle */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScanMode("auto")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                scanMode === "auto"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/80"
              }`}
            >
              🤖 Auto Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScanMode("manual")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                scanMode === "manual"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/80"
              }`}
            >
              👆 Manual Entry
            </motion.button>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Scanner Section - Takes 2 columns */}
            <div className="lg:col-span-2">
              <BackgroundGradient className="rounded-3xl p-1 h-full">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 h-full">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {scanMode === "auto"
                      ? "📱 Camera Scanner"
                      : "✏️ Manual Entry"}
                  </h3>

                  {scanMode === "auto" ? (
                    <div className="space-y-6">
                      <div className="relative">
                        {isScanning ? (
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full h-80 bg-gray-900 rounded-2xl object-cover"
                            />
                            <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-2xl flex items-center justify-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                                className="w-40 h-40 border-4 border-blue-400 rounded-2xl bg-blue-400/20"
                              ></motion.div>
                            </div>
                            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                              🔍 Scanning...
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 20,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                                className="text-8xl mb-6"
                              >
                                📱
                              </motion.div>
                              <p className="text-gray-600 text-lg">
                                Camera preview will appear here
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {!isScanning ? (
                          <AnimatedTooltip items={tooltipItems}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={startScanning}
                              className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium text-lg shadow-lg"
                            >
                              📷 Start Scanning
                            </motion.button>
                          </AnimatedTooltip>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={simulateQRScan}
                              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
                            >
                              🎯 Simulate Detection
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={stopScanning}
                              className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg"
                            >
                              ⏹️ Stop Scanning
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UPI ID
                          </label>
                          <input
                            type="text"
                            placeholder="Enter UPI ID (e.g., user@paytm)"
                            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (Optional)
                          </label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg"
                      >
                        ➕ Add Manually
                      </motion.button>
                    </div>
                  )}
                </div>
              </BackgroundGradient>
            </div>

            {/* Results Section */}
            <div className="space-y-8">
              <BackgroundGradient className="rounded-3xl p-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Scan Results
                  </h3>

                  <AnimatePresence mode="wait">
                    {scannedData ? (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="space-y-6"
                      >
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            ✅ QR Code Detected!
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <strong>UPI ID:</strong>
                              <span className="text-blue-600">
                                {scannedData.upiId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <strong>Amount:</strong>
                              <span className="text-green-600">
                                ₹{scannedData.amount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <strong>Scanned:</strong>
                              <span>{scannedData.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Link to Group Member
                          </label>
                          <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                          >
                            <option value="">Select a member...</option>
                            {groupMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}{" "}
                                {member.upiId && `(${member.upiId})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={linkToMember}
                            disabled={!selectedMember}
                            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            🔗 Link
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setScannedData(null)}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                          >
                            Clear
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          className="text-6xl mb-4"
                        >
                          🔍
                        </motion.div>
                        <p className="text-gray-600 mb-2">
                          No QR code detected yet
                        </p>
                        <p className="text-sm text-gray-500">
                          Start scanning to see results here
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </BackgroundGradient>

              {/* Quick Stats */}
              <BackgroundGradient className="rounded-3xl p-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Today's Stats
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Scans completed:</span>
                      <span className="font-bold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Successfully linked:
                      </span>
                      <span className="font-bold text-green-600">10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Success rate:</span>
                      <span className="font-bold text-purple-600">83%</span>
                    </div>
                  </div>
                </div>
              </BackgroundGradient>
            </div>
          </div>

          {/* Scan History */}
          <BackgroundGradient className="rounded-3xl p-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Scan History
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm font-medium"
                  >
                    📊 Export
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-medium"
                  >
                    🗑️ Clear All
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scanHistory.map((scan, index) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          scan.linked ? "bg-green-500" : "bg-orange-500"
                        }`}
                      ></div>
                      <div className="text-xs text-gray-500">
                        {scan.timestamp}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-gray-900 truncate">
                          {scan.upiId}
                        </div>
                        {scan.amount > 0 && (
                          <div className="text-sm text-green-600">
                            ₹{scan.amount}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {scan.linked ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {scan.memberName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-600">
                                ✅ Linked
                              </div>
                              <div className="text-xs text-gray-600">
                                {scan.memberName}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-orange-600">
                              ⏳ Unlinked
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Link now
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BackgroundGradient>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
