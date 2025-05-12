# Modabir
(This project is for my Final Year Developement Project for Cardiff Met. University)
**Modabir** is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for managing and monitoring alerts. This project demonstrates an alerting and reporting system where users can receive and monitor various system alerts.

## Table of Contents

- [General Information](#general-information)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## General Information

Modabir is built using the MERN stack. It includes:

- **Backend**: Express.js and Node.js
- **Frontend**: React
- **Database**: MongoDB (using Atlas)

The application is designed to allow users to manage alerts, check system statuses, and receive notifications about critical events in real-time.

---

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Communication**: WebSocket

---

## Features

- User authentication using JWT tokens.
- Manage and monitor different types of alerts.
- Admin functionality for managing and viewing system status, sending alerts and managing reports.
- Modular backend architecture for scalability.

---

## Installation

To run this project locally, follow these steps:

### Backend (Node.js, Express):

1. Clone the repository:
  ```bash
  git clone https://github.com/securityinshadows/modabir.git
  cd modabir
  ```
2. Navigate to the backend folder:
  ```bash
  cd backend
  ```
3. Install dependencies:
  ```bash 
  npm install
  ```
4. Set up environment variables (see [Configuration](#configuration)).

5. Start the server:
  ```bash
  node server.js
  ```
## Frontend (React):

1. Navigate to the frontend folder:
  ```bash
  cd frontend
  ```
2. Install dependencies:
  ```bash
  npm install
  ```
3. Start the development server:
  ```bash
  npm run dev
  ```

## Configuration
Before running the project, you'll need to configure some environment variables. These are stored in a .env file that should never be committed to GitHub. Instead, an example .env file is provided to help you set up your own .env file.
.env.example:

You will find a file named .env.example in the root of the project. This file contains placeholder values for required environment variables. Do not use this exact file for your own configuration, but instead, create your own .env file based on it.

Example .env.example:
```
# .env.example

# Server Port
PORT=3000

# MongoDB Connection URI (MongoDB Atlas)
ATLAS_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db-name>?retryWrites=true&w=majority

# JWT Secret Key (for token signing)
JWT_SECRET=replace_this_with_your_jwt_secret_key

# JWT Expiration Time
JWT_EXPIRE=30d
```
### To set up your own .env file:

1. Copy the contents of .env.example into a new file called .env.

2. Replace the placeholder values (e.g., <username>, <password>, etc.) with your own credentials.

3. Make sure to never commit your .env file to version control! It contains sensitive data like your MongoDB credentials and JWT secret.
## Usage
### Running Locally:
Once you have installed the dependencies and set up your .env file, you can start the backend and frontend locally as described in the Installation section. The backend will run on the port defined in your .env file (by default, 3000), and the frontend will run on a different port (default 5173 if you're using Vite).
