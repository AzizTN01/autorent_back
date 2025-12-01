const multer = require('multer');
const fs = require('fs').promises;

// Helper function to clean up temporary files
const cleanupTempFiles = async (req) => {
  try {
    // Clean up any uploaded files if there's an error
    if (req.file) {
      await fs.unlink(req.file.path);
      console.log('Cleaned up temporary file:', req.file.path);
    }
    if (req.files) {
      const deletePromises = Object.values(req.files).flat().map(file => fs.unlink(file.path));
      await Promise.all(deletePromises);
      console.log('Cleaned up temporary files');
    }
  } catch (cleanupError) {
    console.error('Error cleaning up temporary files:', cleanupError);
  }
};

// Helper function to destroy streams
const destroyStreams = (req) => {
  try {
    // Destroy any open streams to prevent memory leaks
    if (req.readable && typeof req.destroy === 'function') {
      req.destroy();
    }

    // Handle any busboy or multer streams
    if (req._readableState && !req._readableState.destroyed) {
      req.destroy();
    }
  } catch (streamError) {
    console.error('Error destroying streams:', streamError);
  }
};

const errorHandler = async (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    code: err.code,
    type: err.constructor.name,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Clean up resources to prevent memory leaks
  await cleanupTempFiles(req);
  destroyStreams(req);

  let statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';

  // Handle Multer-specific errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        statusCode = 413;
        message = 'File too large. Maximum size allowed is 5MB';
        break;
      case 'LIMIT_FILE_COUNT':
        statusCode = 400;
        message = 'Too many files uploaded. Only one file is allowed';
        break;
      case 'LIMIT_FIELD_KEY':
        statusCode = 400;
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        statusCode = 400;
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        statusCode = 400;
        message = 'Too many fields in form';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        statusCode = 400;
        message = 'Unexpected field name for file upload';
        break;
      case 'LIMIT_PART_COUNT':
        statusCode = 400;
        message = 'Too many parts in multipart form';
        break;
      case 'MISSING_FIELD_NAME':
        statusCode = 400;
        message = 'Field name is missing';
        break;
      default:
        statusCode = 400;
        message = `Upload error: ${err.message}`;
    }
  }
  // Handle stream-related errors
  else if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') {
    statusCode = 400;
    message = 'Connection was reset during upload. Please try again';
  }
  // Handle file system errors
  else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
  }
  else if (err.code === 'ENOSPC') {
    statusCode = 507;
    message = 'Insufficient storage space';
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle MongoDB errors
  else if (err.name === 'MongoError' || err.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database error occurred';
  }
  // Handle custom errors with statusCode
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle other known error types
  else if (err.message) {
    message = err.message;
  }

  // Security: Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    error: message,
    code: err.code || 'UNKNOWN_ERROR',
    ...(isDevelopment && {
      stack: err.stack,
      details: {
        type: err.constructor.name,
        originalMessage: err.message
      }
    })
  };

  // Send response if not already sent
  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse);
  } else {
    console.error('Headers already sent, cannot send error response');
  }
};

module.exports = errorHandler;