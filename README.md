# AUTORENT Backend

## Overview

AUTORENT is a backend application designed for managing car rentals. It provides RESTful APIs for user authentication, company management, and car rental functionalities. Built with Node.js, Express, and MongoDB, this application aims to facilitate a seamless experience for users looking to rent cars from various companies.

**Note:** Some of the features listed below are still in development.

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

1. POST /api/auth/signup - Register a new user
2. POST /api/auth/login - Log in a user
3. POST /api/auth/forgot-password - Request a password reset
4. POST /api/auth/reset-password/:token - Reset user password

## Companies
1. POST /api/auth/companies - Create a new company
2. GET /api/auth/companies/:companyId - Get company details
3. PUT /api/auth/companies/:companyId - Update company details
4. DELETE /api/auth/companies/:companyId - Delete a company
5. POST /api/auth/companies/:companyId/cars - Add a car to a company

##Cars
1. GET /api/auth/cars/:carId - Get car details
2. PUT /api/auth/cars/:carId - Update car details
3. DELETE /api/auth/cars/:carId - Delete a car

## Testing
You can use tools like Postman or Insomnia to test the API endpoints. Make sure to include the necessary headers, such as Content-Type: application/json and Authorization: Bearer <token> for protected routes.


### Notes:
- Replace `yourusername` in the clone URL with your actual GitHub username.
- Update the `.env` section with your actual MongoDB connection string and JWT secret.
- You can add more details or sections as needed, such as a "Future Improvements" section or "Known Issues."

