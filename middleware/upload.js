const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sanitizeFilename = require('sanitize-filename');
const FileType = require('file-type');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
    try {
        await fs.access('./uploads/');
    } catch {
        await fs.mkdir('./uploads/', { recursive: true });
    }
};

// Advanced file validation
const validateFile = async (file, buffer) => {
    try {
        // Verify file type from actual content (not just extension)
        const detectedType = await FileType(buffer);

        if (!detectedType) {
            throw new Error('File type could not be determined');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (!allowedTypes.includes(detectedType.mime)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
        }

        const fileExt = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            throw new Error('Invalid file extension');
        }

        // Additional security checks
        const maliciousPatterns = [
            /\.php$/i, /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.sh$/i, /\.jsp$/i, /\.asp$/i
        ];

        if (maliciousPatterns.some(pattern => pattern.test(file.originalname))) {
            throw new Error('Potentially malicious file detected');
        }

        return true;
    } catch (error) {
        throw new Error(`File validation failed: ${error.message}`);
    }
};

// Set storage engine with enhanced security
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await ensureUploadsDir();
            cb(null, './uploads/');
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            // Sanitize filename to prevent directory traversal
            const sanitizedName = sanitizeFilename(file.originalname);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(sanitizedName).toLowerCase();
            const baseName = path.basename(sanitizedName, ext);

            const filename = `${file.fieldname}-${uniqueSuffix}-${baseName}${ext}`;
            cb(null, filename);
        } catch (error) {
            cb(error);
        }
    }
});

// Enhanced file filter with security checks
const fileFilter = async (req, file, cb) => {
    try {
        // Basic MIME type check
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only images are allowed'), false);
        }

        // Filename security checks
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            return cb(new Error('Invalid filename - path traversal detected'), false);
        }

        cb(null, true);
    } catch (error) {
        cb(error, false);
    }
};

// Create multer instance with comprehensive security settings
const multerConfig = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1, // Single file upload
        parts: 10, // Limit form parts to prevent DoS
        fieldNameSize: 100, // Limit field name size
        fieldSize: 1024 * 1024, // 1MB limit for field values
        headerPairs: 20 // Limit header pairs
    },
    fileFilter: fileFilter,
    preservePath: false, // Security: don't preserve client path
    onError: (err, next) => {
        // Proper error handling to prevent crashes
        console.error('Multer error:', err);
        next(err);
    }
});

// Middleware wrapper with enhanced error handling and cleanup
const secureUpload = (fieldName) => {
    return async (req, res, next) => {
        const upload = multerConfig.single(fieldName);

        upload(req, res, async (error) => {
            if (error) {
                // Handle specific multer errors
                if (error instanceof multer.MulterError) {
                    switch (error.code) {
                        case 'LIMIT_FILE_SIZE':
                            return res.status(413).json({
                                error: 'File too large. Maximum size is 5MB'
                            });
                        case 'LIMIT_FILE_COUNT':
                            return res.status(400).json({
                                error: 'Too many files. Only one file allowed'
                            });
                        case 'LIMIT_UNEXPECTED_FILE':
                            return res.status(400).json({
                                error: 'Unexpected field name'
                            });
                        case 'LIMIT_PART_COUNT':
                            return res.status(400).json({
                                error: 'Too many form parts'
                            });
                        default:
                            return res.status(400).json({
                                error: `Upload error: ${error.message}`
                            });
                    }
                } else {
                    return res.status(400).json({
                        error: error.message || 'File upload failed'
                    });
                }
            }

            // If file was uploaded, perform additional validation
            if (req.file) {
                try {
                    const buffer = await fs.readFile(req.file.path);
                    await validateFile(req.file, buffer);
                } catch (validationError) {
                    // Clean up uploaded file on validation failure
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkError) {
                        console.error('Failed to clean up invalid file:', unlinkError);
                    }
                    return res.status(400).json({
                        error: validationError.message
                    });
                }
            }

            next();
        });
    };
};

// Export different upload configurations
module.exports = {
    single: (fieldName = 'image') => secureUpload(fieldName),
    profilePicture: secureUpload('profilePicture'),
    carImage: secureUpload('image'),
    // For backward compatibility
    default: secureUpload('profilePicture')
};
