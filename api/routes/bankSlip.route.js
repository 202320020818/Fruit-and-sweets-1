import express from 'express';
import BankSlip from '../models/bankSlipModel.js';  // Import the BankSlip model
import upload from '../controllers/bankSlipController.js'; // Import the upload function

const router = express.Router();

// Route to handle the file upload
router.post('/upload', upload.single('bankSlip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded'); // Check if file is uploaded
    }

    // Save the bank slip data to the database
    const newBankSlip = new BankSlip({
      filePath: req.file.path
    });

    // Save the new bank slip to MongoDB
    await newBankSlip.save();

    res.status(200).json({ message: 'Bank slip uploaded successfully', bankSlip: newBankSlip });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error'); // Handle any errors
  }
});

// Route to get all uploaded bank slips
router.get('/', async (req, res) => {
  try {
    const bankSlips = await BankSlip.find(); // Fetch all bank slips from DB
    res.status(200).json(bankSlips); // Return them in the response
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to update the status of a specific bank slip (Admin functionality)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // Get the new status from the request body
    const bankSlip = await BankSlip.findById(req.params.id); // Find the bank slip by ID

    if (!bankSlip) {
      return res.status(404).send('Bank slip not found'); // If no such slip is found
    }

    // Update the status of the bank slip
    bankSlip.status = status;
    await bankSlip.save();

    res.status(200).json({ message: 'Status updated successfully', bankSlip });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

export default router;
