const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AutoRent API',
    version: '1.0.0',
    description: 'A comprehensive car rental management API built with Node.js, Express, and MongoDB. This API provides endpoints for user authentication, company management, car management, and rental operations.',
    contact: {
      name: 'AutoRent Support',
      email: 'support@autorent.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server'
    },
    {
      url: 'https://api.autorent.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password', 'mobileNumber'],
        properties: {
          userId: {
            type: 'string',
            description: 'Unique user identifier (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            description: 'User password (min 8 characters)',
            example: 'SecurePass123!'
          },
          mobileNumber: {
            type: 'string',
            description: 'User mobile number',
            example: '12345678'
          },
          age: {
            type: 'number',
            description: 'User age',
            example: 25
          },
          province: {
            type: 'string',
            enum: ['Sousse', 'Sfax', 'Monastir', 'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili', 'Mahdia', 'Zaghouan'],
            description: 'User province in Tunisia',
            example: 'Tunis'
          },
          profilePicture: {
            type: 'string',
            description: 'URL to user profile picture',
            example: '/uploads/profile-1234567890.jpg'
          }
        }
      },
      Company: {
        type: 'object',
        required: ['name', 'baseProvince', 'email', 'phone'],
        properties: {
          _id: {
            type: 'string',
            description: 'Company ID',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            description: 'Company name',
            example: 'AutoRent Tunis'
          },
          baseProvince: {
            type: 'string',
            enum: ['Sousse', 'Sfax', 'Monastir', 'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili', 'Mahdia', 'Zaghouan'],
            description: 'Base province of the company',
            example: 'Tunis'
          },
          address: {
            type: 'string',
            description: 'Company address',
            example: '123 Main Street, Tunis'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Company email',
            example: 'contact@autorenttunis.com'
          },
          phone: {
            type: 'string',
            pattern: '^[0-9]{8}$',
            description: 'Company phone number (8 digits)',
            example: '71234567'
          },
          cars: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of car IDs belonging to this company'
          }
        }
      },
      Car: {
        type: 'object',
        required: ['company', 'brand', 'model', 'year', 'price', 'color', 'fuelType', 'transmission'],
        properties: {
          _id: {
            type: 'string',
            description: 'Car ID',
            example: '507f1f77bcf86cd799439011'
          },
          company: {
            type: 'string',
            description: 'Company ID that owns this car',
            example: '507f1f77bcf86cd799439011'
          },
          image: {
            type: 'string',
            description: 'Path to car image',
            example: '/uploads/car-1234567890.jpg'
          },
          brand: {
            type: 'string',
            enum: ['Toyota', 'Volwagen', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia'],
            description: 'Car brand',
            example: 'Toyota'
          },
          model: {
            type: 'string',
            description: 'Car model',
            example: 'Corolla'
          },
          year: {
            type: 'number',
            minimum: 1886,
            description: 'Car manufacturing year',
            example: 2022
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Daily rental price',
            example: 50
          },
          color: {
            type: 'string',
            enum: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gray', 'Brown', 'Gold', 'Orange', 'Purple'],
            description: 'Car color',
            example: 'White'
          },
          fuelType: {
            type: 'string',
            enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
            description: 'Car fuel type',
            example: 'Gasoline'
          },
          transmission: {
            type: 'string',
            enum: ['Automatic', 'Manual'],
            description: 'Car transmission type',
            example: 'Automatic'
          },
          mileage: {
            type: 'number',
            minimum: 0,
            description: 'Car mileage',
            example: 15000
          },
          seats: {
            type: 'number',
            minimum: 1,
            description: 'Number of seats',
            example: 5
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Car description',
            example: 'Comfortable sedan perfect for family trips'
          },
          isAvailable: {
            type: 'boolean',
            description: 'Car availability status',
            example: true
          }
        }
      },
      Rental: {
        type: 'object',
        required: ['user', 'car', 'rentalStartDate', 'rentalEndDate', 'totalCost', 'pickupLocation', 'dropOffLocation'],
        properties: {
          _id: {
            type: 'string',
            description: 'Rental ID',
            example: '507f1f77bcf86cd799439011'
          },
          user: {
            type: 'string',
            description: 'User ID who made the rental',
            example: '507f1f77bcf86cd799439011'
          },
          car: {
            type: 'string',
            description: 'Car ID being rented',
            example: '507f1f77bcf86cd799439011'
          },
          rentalStartDate: {
            type: 'string',
            format: 'date-time',
            description: 'Rental start date',
            example: '2024-01-15T10:00:00Z'
          },
          rentalEndDate: {
            type: 'string',
            format: 'date-time',
            description: 'Rental end date',
            example: '2024-01-20T10:00:00Z'
          },
          totalCost: {
            type: 'number',
            description: 'Total rental cost',
            example: 250
          },
          pickupLocation: {
            type: 'string',
            description: 'Pickup location',
            example: 'Tunis Airport'
          },
          dropOffLocation: {
            type: 'string',
            description: 'Drop-off location',
            example: 'Tunis City Center'
          },
          status: {
            type: 'string',
            enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
            description: 'Rental status',
            example: 'Pending'
          },
          paymentStatus: {
            type: 'string',
            enum: ['Unpaid', 'Paid', 'Refunded'],
            description: 'Payment status',
            example: 'Unpaid'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message description'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Companies',
      description: 'Company management endpoints'
    },
    {
      name: 'Cars',
      description: 'Car management and listing endpoints'
    },
    {
      name: 'Rentals',
      description: 'Rental management endpoints'
    },
    {
      name: 'Health',
      description: 'System health check endpoints'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './Controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
