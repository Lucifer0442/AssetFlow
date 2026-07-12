import swaggerJSDoc from 'swagger-jsdoc';
import env from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AssetFlow ERP API Documentation',
      version: '1.0.0',
      description: 'API specifications and schema validation for AssetFlow - Enterprise Asset & Resource Management System',
      contact: {
        name: 'AssetFlow Support',
        email: 'support@assetflow.local',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.ts', './src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
