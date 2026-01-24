const express = require('express');
const router = express.Router();
const googleCloudController = require('../controllers/googleCloudController');
const path = require('path');
const multer = require('multer');

// Configure storage to use the original file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('inside multer:', file);
    console.log('Setting destination for file:', file.originalname);
    cb(null, 'uploads'); // Set your upload directory
  },
  filename: (req, file, cb) => {
    // Use path.basename to ensure a safe file name
    const originalName = path.basename(file.originalname);
    console.log('Saving file as:', originalName)
    cb(null, originalName);
  }
});
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });
 

router.post('/speechToTextSync', (req, res, next) => {console.log('before!');next()}, upload.single('audioFile'), (req, res, next) => {console.log('after!!');next()},(req, res) => googleCloudController.speechToTextSync(req, res));


// router.post('/speechToTextSync',upload.single('file'),  (req, res) => {
//  //console.log('Request reached the route, req.file:', req.file);
//   console.log('hello world');
//   res.send('File received');

// });


// router.post('/speechToTextSync', (req, res, next) => {
//   // Manually call multer and handle the callback
//   upload.single('file')(req, res, (err) => {
//     if (err) {
//       console.error('Multer error:', err);
//       return next(err); // This will trigger your global error handler
//     }

//     console.log('Multer finished, req.file:', req.file);
//     // If you see this log, it means Multer succeeded. Now call your controller:
//     googleCloudController.speechToTextSync(req, res)
//       .then(() => {
//         console.log('Controller completed successfully');
//       })
//       .catch(error => {
//         console.error('Error in controller:', error);
//         next(error);
//       });
//   });
// });


// // // Then do something like this
// router.post('/speechToTextSync', (req, res, next) => {
//   upload.single('file')(req, res, async (err) => {
//     if (err) return next(err);

//     console.log('Multer finished, req.file:', req.file);

//     try {
//       // Just an example of async code
//       await googleCloudController.speechToTextSync(req, res);
//       console.log('Controller completed successfully');
//     } catch (controllerError) {
//       console.error('Error in controller:', controllerError);
//       return next(controllerError);
//     }
//   });
// });



// Global error handler for your router (or in your main app)
router.use((err, req, res, next) => {
  console.error('Error encountered:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

router.get('/speechToTextAsync',(req, res) => googleCloudController.speechToTextAsync(req, res));

module.exports = router;
//curl -X POST -F "file=@0502606168_2.mp3" http://localhost:3002/googleCloud/speechToTextSync