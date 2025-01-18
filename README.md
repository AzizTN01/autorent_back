# AUTORENT Backend

## Overview

AUTORENT is a backend application designed for managing car rentals. It provides RESTful APIs for user authentication, company management, and car rental functionalities. Built with Node.js, Express, and MongoDB, this application aims to facilitate a seamless experience for users looking to rent cars from various companies.

## Features

- User authentication (signup, login, password reset)
- Company management (create, update, delete companies)
- Car management (add, update, delete cars)
- Rental management (create rentals)
- Secure API endpoints with JWT authentication
- MongoDB for data storage

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (JSON Web Tokens) for authentication
- dotenv for environment variable management
- CORS for cross-origin resource sharing
- Body-parser for parsing incoming request bodies

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/autorent-backend.git
   cd autorent-backend
2. Install dependencies:
   npm install
3. Create a .env file in the root directory and add your environment variables:
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
4. Start the server:
   npm start

 ## API Endpoints

POST /api/auth/signup - Register a new user
POST /api/auth/login - Log in a user
POST /api/auth/forgot-password - Request a password reset
POST /api/auth/reset-password/:token - Reset user password

## Companies
POST /api/auth/companies - Create a new company
GET /api/auth/companies/:companyId - Get company details
PUT /api/auth/companies/:companyId - Update company details
DELETE /api/auth/companies/:companyId - Delete a company
POST /api/auth/companies/:companyId/cars - Add a car to a company

##Cars
GET /api/auth/cars/:carId - Get car details
PUT /api/auth/cars/:carId - Update car details
DELETE /api/auth/cars/:carId - Delete a car

## Testing
You can use tools like Postman or Insomnia to test the API endpoints. Make sure to include the necessary headers, such as Content-Type: application/json and Authorization: Bearer <token> for protected routes.
