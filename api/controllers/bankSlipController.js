import multer from 'multer';
import path from 'path';

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/bank_slips/'); // Save uploaded files to 'uploads/bank_slips' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current time as filename to avoid duplicates
  }
});

// File filter to allow only specific types (PDF, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // Accept the file
  } else {
    cb('Error: Only JPEG, PNG, or PDF files are allowed!');
  }
};

// Set up Multer upload with file size limit (10MB) and filter
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter
});

// Export the upload function for use in the routes
export default upload;
