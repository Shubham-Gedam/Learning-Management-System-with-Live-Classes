
# Learning Management System (LMS)

A microservices-based Learning Management System built using the MERN stack. It supports user authentication, course management, lessons, quizzes, payments, live classes, video processing, and certificate generation.

## Tech Stack

- **Frontend:** React.js, Vite, Redux Toolkit
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT stored in HTTP cookies
- **Background Jobs:** Redis and BullMQ
- **Video Processing:** FFmpeg (HLS)
- **Video Storage and Delivery:** AWS S3 and CloudFront
- **Payments:** Razorpay Test Mode
- **Live Classes:** LiveKit

## Project Architecture

The application uses separate backend microservices connected through a custom API Gateway.

| Component | Port |
| React Frontend | 5173 |
| API Gateway | 8000 |
| Auth Service | 3001 |
| Course Service | 3002 |
| Learning Service | 3003 |
| Media Service | 3004 |
| Live Class Service | 3005 |
| Payment Service | 3006 |
| Certificate Service | 3007 |

## Features

- Role-based access for students, instructors, and admins
- User registration, login, and logout
- Course creation and management
- Lesson creation and learning progress tracking
- Quizzes with automatic grading
- Payment integration using Razorpay test mode
- Live classes using LiveKit
- Video upload and background processing using BullMQ and FFmpeg
- HLS video streaming
- AWS S3 storage and CloudFront delivery
- Certificate generation after course completion
- Instructor earnings dashboard

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB
- Docker
- Redis
- FFmpeg
- AWS account and S3/CloudFront configuration for video delivery
- LiveKit credentials for live classes
- Razorpay test credentials for payment testing

## Environment Variables

Each service should have its own `.env` file containing the configuration it requires.

Typical configuration includes:

- MongoDB connection string
- JWT secret
- Service ports and internal service URLs
- Redis connection settings
- AWS S3 credentials and bucket configuration
- CloudFront distribution domain
- LiveKit API credentials
- Razorpay test API credentials
- Internal service authentication key

**Security:** Never commit `.env` files, passwords, private keys, or API secrets to GitHub.

## Running the Project


## Running the Project Locally

### Prerequisites

Install Node.js, npm, MongoDB, Docker, and FFmpeg. Redis must be running for video-processing jobs. Configure the required AWS, LiveKit, and Razorpay credentials in the appropriate service environment files.

### 1. Start Infrastructure

Start MongoDB and Redis before starting the services. If Redis is configured through Docker, start your existing Redis container.

### 2. Start the Backend Services

Open a separate terminal for each service. Navigate to the service folder, install dependencies, and start the development server.

Example for the Auth Service:

```bash
cd auth-service
npm install
npm run dev
```

Repeat for these folders:

- `course-service` — port 3002
- `learning-service` — port 3003
- `media-service` — port 3004
- `live-class-service` — port 3005
- `payment-service` — port 3006
- `certificate-service` — port 3007
- `api-gateway` — port 8000

Start the Auth Service on port 3001 as shown in the example. Each service must have its required environment variables configured.

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

### 4. Verify the Application

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8000`

Use the application's available features to verify authentication, courses, lessons, quizzes, payments, live classes, video streaming, and certificates.

## Video Processing Workflow

1. An authorized user uploads a video.
2. The Media Service creates a background job in BullMQ.
3. FFmpeg processes the video into HLS format.
4. Processed video files are uploaded to AWS S3.
5. CloudFront delivers the video for playback.

## Payment and Certificates

- Payments are tested using Razorpay test mode.
- Course completion and enrollment are verified before certificate generation.
- Certificates are generated for eligible students.

## Project Structure

LMS/
├── api-gateway/
├── auth-service/
├── course-service/
├── learning-service/
├── media-service/
├── live-class-service/
├── payment-service/
├── certificate-service/
├── frontend/
├── .gitignore
└── README.md

Each backend service has its own application code and configuration. The frontend contains the React application, while the API Gateway routes requests to the backend services.

## Project Status

Core authentication, course management, learning progress, quizzes, payments, certificates, live classes, and video processing have been implemented and tested during development.

## Future Improvements

- Expand automated test coverage.
- Improve error handling and monitoring.
- Add deployment configuration and production security hardening.
- Document API endpoints and service-specific setup instructions.
