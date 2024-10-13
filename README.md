# Risevest Blog

## Overview

Risevest Online Blog is a web application for managing post, comments and users for a blog.

## Table of Contents

- [Setup](#setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Scripts](#scripts)

## Setup

### Prerequisites

- Node.js and npm installed
- PostgreSQL database (using ElephantSQL)
- Docker

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

   ```

2. Install the dependencies:

   ```bash
   docker-compose build


   ```

3. Set up environment variables. Create a .env file in the root directory and add the following variables:

   ```bash
   # Server configuration
   PORT=3000
   NODE_ENV=local

   # Database configuration
   DATABASE_URL=<Your ElephantSQL URL>

   # JWT configuration
   JWT_SECRET_KEY=<Your JWT Secret>
   JWT_EXPIRATION=<Your JWT Expiration Time>
   REFRESH_TOKEN_SECRET=<Your Refresh Token Secret>
   REFRESH_TOKEN_EXPIRATION=<Your Refresh Token Expiration Time>


   # API Key
   API_KEY=<Your API Key>

   # AWS configuration
   AWS_ACCESS_KEY=<Your AWS Access Key>
   AWS_SECRET_KEY=<Your AWS Secret Key>
   AWS_REGION=<Your AWS Region>
   SQS_QUEUE_URL=<Your SQS Queue URL>
   SES_REPLY_TO_EMAIL=<Your SES Reply-To Email>
   SES_SENDER_NAME=<Your SES Sender Name>
   SES_SOURCE_EMAIL=<Your SES Source Email>


   ```

4. Start the Server

   ```bash
    docker-compose up

   ```


## Usage

### Users

- POST /users/login - Login a user
- POST /users - Register a new user
- GET /users - Get all users

### Posts

- GET /users/:id/posts - Retrieve a user posts
- POST /users/:id/posts - Create post for a user
- GET /posts/:postId/comments - Retrieve comment for a post
- POST /posts/:postId/comments - Add comment to a post
- GET /posts/top-users - Fetch the top 3 users with the most posts


## API Documentation

### Swagger Doc

- You can view the API documentation by navigating to https://risevest-5607.postman.co/workspace/Risevest~d60c3d2a-d42d-4753-9793-d493553856f3/request/29984590-90bd4e82-0fec-49cf-8e97-4d25c34f5f4a.

## Scripts

### Install Dependencies

    ```bash
    docker-compose build

    ```

### Test

    ```bash
    docker-compose run --rm app npm run test

    ```

### Start

    ```bash
    docker-compose up

    ```
