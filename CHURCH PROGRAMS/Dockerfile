# Use Node 18 as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Start the app
CMD ["npm", "start"]