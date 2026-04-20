import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../public');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file , cb){
        cb(null, uploadDir);
    },
    filename: function(req , file , cb){
        const filename = Date.now() + "-" + file.originalname;
        console.log(`Uploading file: ${filename}`);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
        console.log(`File accepted: ${file.originalname}`);
        cb(null, true);
    } else {
        console.log(`File rejected: ${file.originalname} - Invalid type: ${file.mimetype}`);
        cb(new Error('Only PDF files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});