import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCloudUploadAlt } from "react-icons/fa";

const BankSlipUpload = () => {
  const [slip, setSlip] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setSlip(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!slip || !orderId.trim()) {
      toast.error("Please provide both Order ID and Bank Slip.");
      return;
    }

    const formData = new FormData();
    formData.append("slip", slip);
    formData.append("orderId", orderId);

    setIsLoading(true);
    try {
      await axios.post("http://localhost:3000/api/bankslip/upload", formData);
      toast.success("✅ Bank slip uploaded successfully!");
      setSlip(null);
      setOrderId("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to upload bank slip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Upload Bank Slip
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order ID
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Bank Slip (PDF or Image)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="w-full"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white ${
            isLoading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload"}
          {!isLoading && <FaCloudUploadAlt className="text-lg" />}
        </button>
      </div>
    </div>
  );
};

export default BankSlipUpload;
