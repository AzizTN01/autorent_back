# AutoRent API Documentation

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Companies](#company-endpoints)
  - [Cars](#car-endpoints)
  - [Rentals](#rental-endpoints)
- [Error Handling](#error-handling)
- [Security](#security)

## Overview

AutoRent API is a RESTful API for managing car rental operations. It provides comprehensive endpoints for user authentication, company management, car inventory, and rental transactions.

**Base URL**: `http://localhost:5001/api`  
**API Documentation (Swagger)**: `http://localhost:5001/api-docs`

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AzizTN01/autorent_back.git
cd autorent_back
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
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
# Development mode
npm run dev

# Production mode
npm start
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Login via the `/api/auth/login` endpoint to receive a JWT token.

## Rate Limiting

To prevent abuse, the API implements rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints** (login/signup): 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Rate Limited**: Yes (5 requests per 15 minutes)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "mobileNumber": "12345678",
  "age": 25,
  "province": "Tunis"
}
```

**Response** (201 Created):
```json
{
  "message": "User created successfully",
  "user": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "12345678",
    "age": 25,
    "province": "Tunis"
  }
}
```

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Rate Limited**: Yes (5 requests per 15 minutes)

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

#### POST /api/auth/forgot-password
Request a password reset email.

**Rate Limited**: Yes (3 requests per hour)

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "If your email exists in our system, you will receive a password reset link"
}
```

#### POST /api/auth/reset-password/:token
Reset password using the token received via email.

**URL Parameters**:
- `token`: Password reset token from email

**Request Body**:
```json
{
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password has been reset successfully"
}
```

### User Endpoints

#### GET /api/auth/user/:id
Get user details by ID.

**Authentication**: Not required

**URL Parameters**:
- `id`: User ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "12345678",
    "age": 25,
    "province": "Tunis"
  }
}
```

#### GET /api/auth/getusers
Get all users (paginated).

**Authentication**: Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "users": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

#### PUT /api/auth/update-profile
Update user profile.

**Authentication**: Required

**Request Body** (multipart/form-data):
```
name: John Updated
age: 26
province: Sfax
profilePicture: [file]
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

#### DELETE /api/auth/delete-user/:id
Delete a user account.

**Authentication**: Required (admin or self)

**URL Parameters**:
- `id`: User ID to delete

**Response** (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

### Company Endpoints

#### POST /api/auth/companies
Create a new company.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "AutoRent Tunis",
  "baseProvince": "Tunis",
  "address": "123 Main Street, Tunis",
  "email": "contact@autorenttunis.com",
  "phone": "71234567"
}
```

**Response** (201 Created):
```json
{
  "message": "Company created successfully",
  "company": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "AutoRent Tunis",
    "baseProvince": "Tunis",
    "address": "123 Main Street, Tunis",
    "email": "contact@autorenttunis.com",
    "phone": "71234567",
    "cars": []
  }
}
```

### Car Endpoints

#### GET /api/auth/cars
Get all cars.

**Authentication**: Not required

**Response** (200 OK):
```json
{
  "message": "Cars retrieved successfully",
  "cars": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2022,
      "price": 50,
      "color": "White",
      "fuelType": "Gasoline",
      "transmission": "Automatic",
      "isAvailable": true,
      "company": {...}
    }
  ]
}
```

#### GET /api/auth/cars/:carId
Get details of a specific car.

**Authentication**: Not required

**URL Parameters**:
- `carId`: Car ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "price": 50,
  "color": "White",
  "fuelType": "Gasoline",
  "transmission": "Automatic",
  "mileage": 15000,
  "seats": 5,
  "description": "Comfortable sedan perfect for family trips",
  "isAvailable": true,
  "image": "http://localhost:5001/uploads/car-1234567890.jpg",
  "company": {...}
}
```

#### GET /api/auth/companies/:companyId/cars
Get all cars belonging to a specific company.

**Authentication**: Not required

**URL Parameters**:
- `companyId`: Company ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "message": "Cars retrieved successfully",
  "cars": [...]
}
```

#### POST /api/auth/companies/:companyId/cars
Add a new car to a company.

**Authentication**: Required

**URL Parameters**:
- `companyId`: Company ID (MongoDB ObjectId)

**Request Body** (multipart/form-data):
```
brand: Toyota
model: Corolla
year: 2022
price: 50
color: White
fuelType: Gasoline
transmission: Automatic
mileage: 15000
seats: 5
description: Comfortable sedan
carImage: [file]
```

**Response** (201 Created):
```json
{
  "message": "Car added to company successfully",
  "company": {...}
}
```

#### PUT /api/auth/cars/:carId
Update car details.

**Authentication**: Required

**URL Parameters**:
- `carId`: Car ID (MongoDB ObjectId)

**Request Body**:
```json
{
  "price": 55,
  "mileage": 16000,
  "isAvailable": false
}
```

**Response** (200 OK):
```json
{
  "message": "Car details updated successfully",
  "car": {...}
}
```

#### POST /api/auth/cars/image
Get car image URL by car ID.

**Authentication**: Not required

**Request Body**:
```json
{
  "carId": "507f1f77bcf86cd799439011"
}
```

**Response** (200 OK):
```json
{
  "image": "http://localhost:5001/uploads/car-1234567890.jpg"
}
```

### Rental Endpoints

#### POST /api/auth/rentals
Create a new rental.

**Authentication**: Required

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "carId": "507f1f77bcf86cd799439012",
  "rentalStartDate": "2024-01-15T10:00:00Z",
  "rentalEndDate": "2024-01-20T10:00:00Z",
  "totalCost": 250,
  "pickupLocation": "Tunis Airport",
  "dropOffLocation": "Tunis City Center"
}
```

**Response** (201 Created):
```json
{
  "message": "Rental created successfully",
  "rental": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439011",
    "car": "507f1f77bcf86cd799439012",
    "rentalStartDate": "2024-01-15T10:00:00.000Z",
    "rentalEndDate": "2024-01-20T10:00:00.000Z",
    "totalCost": 250,
    "pickupLocation": "Tunis Airport",
    "dropOffLocation": "Tunis City Center",
    "status": "Pending",
    "paymentStatus": "Unpaid"
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Security

### Implemented Security Measures

1. **Helmet.js**: Secure HTTP headers
2. **Rate Limiting**: Prevent brute force attacks
3. **JWT Authentication**: Secure token-based auth
4. **Password Hashing**: Bcrypt with 12 salt rounds
5. **Input Validation**: Sanitization and validation
6. **CORS Configuration**: Controlled origin access
7. **Request Size Limits**: 10MB limit on requests
8. **Compression**: Response compression enabled
9. **Account Lockout**: After 5 failed login attempts
10. **Secure Password Reset**: Token-based with expiry

### Best Practices

- Always use HTTPS in production
- Keep JWT_SECRET secure and complex
- Regularly update dependencies
- Monitor rate limit logs for abuse
- Use strong passwords (min 8 characters)
- Enable 2FA for admin accounts (future feature)

## Health Check

**GET /health**

Returns server health status:

```json
{
  "uptime": 12345.67,
  "message": "OK",
  "timestamp": 1705334400000,
  "environment": "development"
}
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/AzizTN01/autorent_back/issues
- Email: support@autorent.com

## License

MIT License - see LICENSE file for details
