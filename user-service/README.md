# User Service

User microservice for authentication, registration, profile management, and security features in a MERN microservices setup.
A user can simply sign up register and manage their profile using this

## Features

- User registration with email verification
- Login with JWT
- Password reset via email
- Profile management (view/edit)
- Account lockout after failed attempts
- Two-Factor Authentication (2FA) stub
- ES6+ syntax, Docker-ready

## How to Run

1. Add your `.env` file (see `.env.example`)
2. `npm install`
3. `npm start` or `npm run dev`

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/reset-password-request`
- `POST /api/auth/reset-password`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users/change-password`