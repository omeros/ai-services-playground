
/**  
 * Middleware to check file size before processing uploads  
 * Rejects files larger than 10MB and suggests an alternative endpoint  
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function  
 */  
const sizeChecker = (req, res, next) => {  
  // Set a limit header for the client  
  req.headers['x-file-size-limit'] = 10 * 1024 * 1024; // 10MB  
  
  // This only works with specific content-length header  
  const contentLength = parseInt(req.headers['content-length']);  
  
  if (contentLength && contentLength > 10 * 1024 * 1024) {  
    return res.status(413).json({   
      error: 'File too large (max 10MB)',  
      useAlternateEndpoint: '/api/calls/large-file-upload'  
    });  
  }  
  
  next();  
};  

module.exports = {  
  sizeChecker  
};