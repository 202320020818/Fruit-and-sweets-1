import mongoose from 'mongoose';

// Define the schema for Bank Slip
const bankSlipSchema = new mongoose.Schema({
  filePath: { type: String, required: true }, // Store file path for the uploaded slip
  uploadedAt: { type: Date, default: Date.now }, // Record the upload time
  status: { type: String, default: 'Pending' }, // Status of the bank slip (Pending, Approved, Rejected)
});

// Create and export the BankSlip model
const BankSlip = mongoose.model('BankSlip', bankSlipSchema);

export default BankSlip;
