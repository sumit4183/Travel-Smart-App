# Use the official Node.js image from Docker Hub
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package.json package-lock.json* /app/

# Install dependencies (use --legacy-peer-deps if needed for compatibility issues)
RUN npm install

# If you have build scripts, you can run them here
# RUN npm run build

# Copy the rest of the project files into the container
COPY . /app/

# Expose port 3000 for the Next.js app
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]

# # Commands for production
# # Build the app for production
# RUN npm run build
# # Serve the built app
# CMD ["npm", "run", "start"]