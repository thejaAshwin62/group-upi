import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UpiQrScanner from "../Pages/UpiQrScanner";
import QRScannerErrorBoundary from "./QRScannerErrorBoundary";

const PaymentForm = ({ isOpen, onClose, onSubmit, darkMode }) => {
  const [formData, setFormData] = useState({
    amount: "",
    shopName: "",
    shopUpiId: "",
    description: "",
  });
  const [showScanner, setShowScanner] = useState(false);

  const handleUpiIdFound = (upiId) => {
    setFormData((prev) => ({ ...prev, shopUpiId: upiId }));
    setShowScanner(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-xl overflow-hidden`}
        >
          {showScanner ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Scan UPI QR Code
                </h3>
                <button
                  onClick={() => setShowScanner(false)}
                  className={`p-2 rounded-lg ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  ← Back
                </button>
              </div>
              <QRScannerErrorBoundary
                onRetry={() => {
                  setShowScanner(false);
                  setTimeout(() => setShowScanner(true), 100);
                }}
              >
                <UpiQrScanner onUpiFound={handleUpiIdFound} />
              </QRScannerErrorBoundary>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Payment
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className={`p-2 rounded-lg ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shopName: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Shop UPI ID
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.shopUpiId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shopUpiId: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-blue-500 pr-12`}
                    placeholder="Enter UPI ID or scan QR"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className={`absolute right-2 p-2 rounded-lg transition-all ${
                      darkMode
                        ? "bg-gray-600 hover:bg-gray-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } flex items-center justify-center`}
                    title="Scan QR Code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6zM8 8V4m8 0v4m0 8v4M8 16v4m4-16v4m0 8v4M4 8h4m8 0h4M4 16h4m8 0h4" />
                    </svg>
                  </button>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Click the camera icon to scan UPI QR code
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter payment description"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Payment
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentForm;
