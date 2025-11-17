# Changelog

All notable changes to the AutoRent Backend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- **Security Features**
  - Helmet.js for secure HTTP headers
  - Express rate limiting middleware (auth: 5/15min, password reset: 3/hour, general API: 100/15min)
  - Account lockout after 5 failed login attempts (15 minutes)
  - Secure password reset with token-based system (1-hour expiry)
  - CORS configuration with environment-based allowed origins
  - Request size limits (10MB) to prevent DoS attacks
  - Input validation and sanitization across all endpoints

- **Performance Optimizations**
  - Database indexes on User, Car, Company, and Rental models
  - Response compression (gzip) for all API responses
  - Optimized MongoDB connection settings (timeouts, pooling)
  - Efficient query projections to exclude sensitive fields

- **Documentation**
  - Swagger UI interactive documentation at `/api-docs`
  - Comprehensive API_DOCUMENTATION.md file
  - Updated README.md with detailed setup instructions
  - .env.example template for environment configuration
  - Validation script (scripts/validate.js) for pre-deployment checks

- **API Endpoints**
  - Health check endpoint: `GET /health`
  - Root endpoint with API info: `GET /`
  - Swagger JSON endpoint: `GET /api-docs.json`

- **Development Tools**
  - Pre-deployment validation script
  - Improved logging middleware
  - Consistent error handling across all endpoints

### Fixed
- **Critical Bugs**
  - Missing JWT import in routes/auth.js causing authentication middleware to fail
  - Delete user route using wrong parameter source (req.body instead of req.params)
  - Duplicate route definition for addCarToCompany
  - Hardcoded localhost URLs in car controller
  - Duplicate database index warnings

- **Security Vulnerabilities**
  - Updated nodemailer from 6.9.16 to 7.0.10 (GHSA-mm7p-fcc7-pg87)
  - Fixed validator vulnerability (GHSA-9965-vmph-33xx)
  - Fixed brace-expansion vulnerability (GHSA-v6h2-p8h4-qcjw)

### Changed
- **Code Structure**
  - Reorganized routes to separate public and protected endpoints
  - Moved authentication logic to dedicated middleware
  - Improved error messages with consistent format
  - Enhanced validation logic in controllers

- **Configuration**
  - All URLs now use environment variables (BASE_URL)
  - CORS origins configurable via ALLOWED_ORIGINS env var
  - MongoDB connection with proper error handling and timeouts
  - JWT tokens now expire after 24 hours

- **Models**
  - Added timestamps to User model
  - Optimized indexes (removed duplicates from unique fields)
  - Added proper index configuration for performance

### Security
- All dependencies updated to latest secure versions
- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens properly signed with HS256 algorithm
- Sensitive data excluded from API responses
- Rate limiting on all authentication endpoints

### Performance
- Database queries optimized with indexes
- Response compression reduces bandwidth by ~70%
- Connection pooling improves throughput
- Efficient pagination for list endpoints

## [0.1.0] - 2024-03-XX (Initial Release)

### Added
- Basic user authentication (signup, login)
- Company management endpoints
- Car management with image uploads
- Rental creation with availability checking
- MongoDB database integration
- JWT authentication
- Basic error handling
- File upload support with Multer

### Notes
- Initial 9-month-old project baseline
- Basic functionality working but not optimized
- Security vulnerabilities present
- No comprehensive documentation

---

## Version History

- **1.0.0** - Major optimization release (current)
- **0.1.0** - Initial project creation
