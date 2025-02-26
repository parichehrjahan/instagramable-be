# Instagramable Backend

This repository houses the Express.js backend for the Instagramable App. Below are instructions and an overview of the project structure so you can quickly get started.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Scripts](#scripts)
5. [Project Structure](#project-structure)
6. [Environment Variables](#environment-variables)
7. [Supabase Integration](#supabase-integration)
8. [Logging](#logging)
9. [Contributing](#contributing)

---

## Prerequisites

• Node.js (version 16 or higher recommended)  
• npm (comes with Node.js)

---

## Installation

1. Clone the repository:
   git clone https://github.com/your-name/instagramable-be.git

2. Navigate to the project folder:
   cd instagramable-be

3. Install dependencies:
   npm install

4. Copy .env.example to .env for configuring environment variables:
   cp .env.example .env
   (Update the values in .env as needed.)

---

## Usage

1. Start the development server (with auto-reload via Nodemon):
   npm run dev

2. Or start the production-like server:
   npm run start

Once running, the server listens on the port defined in your .env or defaults to port 3003.  
Base URL (local): http://localhost:3003

---

## Scripts

Below are the important scripts defined in package.json:

• npm run dev: Starts the server in development mode using nodemon.  
• npm run start: Starts the server in production mode.  
• npm run format: Automatically formats your code using Prettier.  
• npm run test: (Placeholder) if you elect to add test cases in the future.

Additionally, a pre-commit hook is set up to automatically format staged files using Prettier (via lint-staged and simple-git-hooks).

---

## Project Structure

Here’s a simplified view of how the files are organized:

instagramable-be/  
├─ .env.example # Example environment config  
├─ .gitignore # Ignored files (includes .env, node_modules)  
├─ package.json # Project metadata and scripts  
├─ src/  
│ ├─ app.js # Express app setup (middlewares, routes)  
│ ├─ config/  
│ │ ├─ supabaseClient.js # Contains our supabase config
│ │ └─ ... # Other configs
│ ├─ controllers/  
│ │ ├─ spotsController.js # Spots CRUD logic  
│ │ └─ ... # Other controllers
│ ├─ middlewares/  
│ │ ├─ auth.js # Authentication middleware
│ │ └─ ... # Other middleware files
│ ├─ routes/  
│ │ ├─ spots.js # Defines routes for /spots  
│ │ ├─ index.js # Main router aggregator  
│ │ └─ ... # Other routes
│ ├─ utils/  
│ │ └─ logger.js # Winston logger config  
│ ├─ app.js # Express setup, includes routes, etc.  
│ └─ index.js # Server entry point (listen on PORT)  
└─ README.md # You are here!

---

## Environment Variables

We use the dotenv package to load environment variables from a .env file.  
You have an .env.example file provided—rename or copy it to .env and place all your secret keys, database connection strings, or API keys there. Example fields include:

SUPABASE_URL=  
SUPABASE_ANON_KEY=  
SUPABASE_SERVICE_KEY=  
PORT=3003

Make sure not to commit your actual .env file to version control.

---

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

TODO: add script for generating spots automatically with llms + apify ig scraper

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

## Supabase Integration

We use Supabase for authentication and database management.

will be hosting the backend on railway.app

TODO: add script for generating spots automatically with llms + apify ig scraper

TODO: add script for generating spots automatically with llms + apify ig scraper
