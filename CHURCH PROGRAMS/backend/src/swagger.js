const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mission Accomplize API',
      version: '1.0.0',
      description: 'API documentation for Mission Accomplize: Sniper Legacy backend',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

module.exports = swaggerJSDoc(options);
