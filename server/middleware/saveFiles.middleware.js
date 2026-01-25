const multer = require('multer');  
const path = require('path');
const { sizeChecker } = require('../middleware/fileSize.middleware');  

// For cloud processing, use memory storage.
// Files over 15MB will be rejected with a 413 status code.    
const uploadToMemory = multer({  
  storage: multer.memoryStorage(),  
  limits: { fileSize: 15 * 1024 * 1024 }
});  

// If you really need disk storage for some routes:
// Configure storage to use the original file name
const diskStorage  = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('inside multer:', file);
    console.log('Setting destination for file:', file.originalname);
    cb(null, process.env.MP3_UPLOAD_FOLDER_FILES); // Set your upload directory
  },
  filename: (req, file, cb) => {
    // Use path.basename to ensure a safe file name
    const originalName = path.basename(file.originalname);
    console.log('Saving file as:', originalName)
    cb(null, originalName);
  }
});
// const upload = multer({ dest: 'uploads/' });
const uploadToDisk  = multer({ storage: diskStorage  });

// If you really need disk storage for some routes:
// Configure storage to use the original file name
const diskMP4Storage  = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('inside multer:', file);
    console.log('Setting destination for file:', file.originalname);
    cb(null, process.env.MP4_UPLOAD_FOLDER_FILES); // Set your upload directory
  },
  filename: (req, file, cb) => {
    // Use path.basename to ensure a safe file name
    const originalName = path.basename(file.originalname);
    console.log('Saving file as:', originalName)
    cb(null, originalName);
  }
});
// const upload = multer({ dest: 'uploads/' });
const uploadMP4ToDisk  = multer({ storage: diskMP4Storage  });


const storageM4a = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.M4A_UPLOAD_FOLDER_FILES),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.m4a';
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  }
});

const uploadM4A = multer({
  storage: storageM4a,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.m4a') return cb(new Error('Only .m4a files allowed'));
    cb(null, true);
  }
});


module.exports = {  
  uploadToDisk,
  uploadToMemory,
  uploadMP4ToDisk,
  uploadM4A
};