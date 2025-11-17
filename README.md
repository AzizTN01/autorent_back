# AUTORENT Backend

## Overview

AUTORENT is a high-performance, secure backend application designed for managing car rentals. It provides comprehensive RESTful APIs for user authentication, company management, and car rental functionalities. Built with Node.js, Express, and MongoDB, this application delivers a seamless and optimized experience for car rental operations.

## 🚀 Recent Optimizations (v1.0.0)

### Performance Enhancements
- **Database Indexing**: Added strategic indexes on frequently queried fields for faster lookups
- **Response Compression**: Gzip compression for API responses reduces bandwidth usage
- **Connection Pooling**: Optimized MongoDB connection settings
- **Request Rate Limiting**: Prevents API abuse and ensures fair usage

### Security Improvements
- **Helmet.js Integration**: Enhanced HTTP header security
- **JWT Authentication**: Secure token-based authentication with 24-hour expiry
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Account Lockout**: Automatic lockout after 5 failed login attempts
- **Secure Password Reset**: Token-based reset with 1-hour expiry
- **Input Validation**: Comprehensive request validation and sanitization
- **CORS Configuration**: Configurable allowed origins

### Code Quality
- **Fixed Broken APIs**: Resolved JWT import issues and route conflicts
- **Environment Variables**: All URLs and configurations now use environment variables
- **Error Handling**: Consistent error handling across all endpoints
- **Logging**: Request/response logging for monitoring and debugging

### Documentation
- **Swagger UI**: Interactive API documentation at `/api-docs`
- **Comprehensive API Docs**: Detailed endpoint documentation in `API_DOCUMENTATION.md`
- **Health Check**: Server status endpoint at `/health`

## Features

- ✅ User authentication (signup, login, password reset)
- ✅ Company management (create, update, delete companies)
- ✅ Car management (add, update, delete cars with image uploads)
- ✅ Rental management (create rentals with availability checking)
- ✅ Secure API endpoints with JWT authentication
- ✅ Rate limiting to prevent abuse
- ✅ Request/response compression
- ✅ MongoDB with optimized indexes
- ✅ Comprehensive error handling
- ✅ API documentation with Swagger UI
- ✅ Health monitoring endpoint

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, bcrypt, express-rate-limit
- **File Upload**: Multer
- **Email**: Nodemailer
- **Documentation**: Swagger UI, swagger-jsdoc
- **Utilities**: dotenv, compression, cors, body-parser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AzizTN01/autorent_back.git
   cd autorent_back
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   BASE_URL=http://localhost:5001
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

### Interactive Documentation
Visit `http://localhost:5001/api-docs` for interactive Swagger UI documentation.

### Detailed Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for comprehensive endpoint documentation.

### Quick Reference

#### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Log in a user
- `POST /api/auth/forgot-password` - Request a password reset
- `POST /api/auth/reset-password/:token` - Reset user password

#### Users
- `GET /api/auth/user/:id` - Get user details
- `GET /api/auth/getusers` - Get all users (authenticated, paginated)
- `PUT /api/auth/update-profile` - Update user profile (authenticated)
- `DELETE /api/auth/delete-user/:id` - Delete user (authenticated)

#### Companies
- `POST /api/auth/companies` - Create a new company (authenticated)

#### Cars
- `GET /api/auth/cars` - Get all cars
- `GET /api/auth/cars/:carId` - Get car details
- `GET /api/auth/companies/:companyId/cars` - Get cars by company
- `POST /api/auth/companies/:companyId/cars` - Add a car to a company (authenticated)
- `PUT /api/auth/cars/:carId` - Update car details (authenticated)
- `POST /api/auth/cars/image` - Get car image URL

#### Rentals
- `POST /api/auth/rentals` - Create a new rental (authenticated)

#### System
- `GET /health` - Health check endpoint
- `GET /` - API information

## Rate Limits

To ensure fair usage and prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication** (login/signup): 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP

## Security Best Practices

1. Always use HTTPS in production
2. Keep your JWT_SECRET secure and complex
3. Regularly update dependencies: `npm audit fix`
4. Use strong passwords (minimum 8 characters)
5. Monitor rate limit logs for potential abuse
6. Configure ALLOWED_ORIGINS appropriately for production

## Testing

You can use tools like Postman or Insomnia to test the API endpoints. 

For authenticated routes, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 5001 |
| MONGODB_URI | MongoDB connection string | Yes | - |
| JWT_SECRET | Secret key for JWT signing | Yes | - |
| EMAIL_USER | Email account for sending emails | Yes | - |
| EMAIL_PASS | Email account password | Yes | - |
| BASE_URL | Base URL for file uploads | No | http://localhost:5001 |
| ALLOWED_ORIGINS | Comma-separated CORS origins | No | * (all origins) |
| FRONTEND_URL | Frontend application URL | Yes | - |
| NODE_ENV | Environment (development/production) | No | development |

## Project Structure

```
autorent_back/
├── config/             # Configuration files
│   └── swagger.js      # Swagger API documentation config
├── Controllers/        # Route controllers
│   ├── authController.js
│   ├── carController.js
│   ├── companyController.js
│   └── rentalController.js
├── middleware/         # Custom middleware
│   ├── errorHandler.js
│   ├── logger.js
│   ├── rateLimiter.js
│   └── upload.js
├── models/            # Database models
│   ├── Car.js
│   ├── Company.js
│   ├── Rental.js
│   └── User.js
├── routes/            # API routes
│   └── auth.js
├── uploads/           # Uploaded files directory
├── .env               # Environment variables (not in repo)
├── .gitignore        # Git ignore file
├── API_DOCUMENTATION.md  # Detailed API documentation
├── package.json       # Dependencies and scripts
├── README.md         # This file
└── server.js         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues or questions:
- GitHub Issues: https://github.com/AzizTN01/autorent_back/issues
- Email: support@autorent.com

## Changelog

### Version 1.0.0 (Current)
- ✅ Fixed broken API endpoints (JWT import, route conflicts)
- ✅ Added comprehensive security measures (Helmet, rate limiting, account lockout)
- ✅ Implemented database indexing for performance optimization
- ✅ Added response compression
- ✅ Created Swagger UI documentation
- ✅ Added health check endpoint
- ✅ Implemented proper error handling
- ✅ Fixed security vulnerabilities in dependencies
- ✅ Added environment variable support for all configurations
- ✅ Improved authentication middleware
- ✅ Added comprehensive API documentation

## Future Enhancements

- [ ] Add user roles and permissions system
- [ ] Implement payment gateway integration
- [ ] Add email verification for new users
- [ ] Create admin dashboard endpoints
- [ ] Add rental history and analytics
- [ ] Implement search and filtering for cars
- [ ] Add notification system
- [ ] Implement two-factor authentication
- [ ] Add automated testing suite
- [ ] Create Docker deployment configuration

