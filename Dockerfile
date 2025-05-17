FROM node:18

# Install TeX Live (basic LaTeX tools)
RUN apt-get update && apt-get install -y texlive-full

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

RUN mkdir -p /app/public && chmod -R 777 /app/public
