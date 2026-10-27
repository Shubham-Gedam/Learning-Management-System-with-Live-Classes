
# LMS API Documentation

## Base URLs

| Component | Base URL |
| API Gateway | http://localhost:8000 |
| Auth Service | http://localhost:3001 |
| Course Service | http://localhost:3002 |
| Learning Service | http://localhost:3003 |
| Media Service | http://localhost:3004 |
| Live Class Service | http://localhost:3005 |
| Payment Service | http://localhost:3006 |
| Certificate Service | http://localhost:3007 |

Frontend: http://localhost:5173

## Authentication

- Authentication uses JWT stored in an HTTP cookie.
- Register or log in before accessing protected endpoints.
- Send requests with credentials enabled when using the frontend or API client.
- Available roles: student, instructor, admin.

## API Modules

### 1. Auth Service
Purpose: user registration, login, logout and authentication.

Document these endpoints from your implemented routes:
- Register
- Login
- Logout
- Get current user, if implemented


## Auth Service

### 1. Register
- **Method:** POST
- **Path:** `/api/auth/register`
- **Purpose:** Register a new user.
- **Request body:** Check `registerController` for required fields.
- **Authentication:** Not usually required for registration.

### 2. Login
- **Method:** POST
- **Path:** `/api/auth/login`
- **Purpose:** Authenticate a user.
- **Request body:** Check `loginController` for required fields.
- **Response:** Check the controller for the response format and cookie settings.

### 3. Logout
- **Method:** POST
- **Path:** `/api/auth/logout`
- **Purpose:** Log out the current user.
- **Authentication:** Verify the controller and middleware requirements.

### 4. Internal User Lookup
- **Method:** GET
- **Path:** `/api/auth/internal/users/:userId`
- **Purpose:** Retrieve user details for internal service use.
- **Access:** Internal service authentication should be verified.

## Admin Routes

### 5. Get Admin Statistics
- **Method:** GET
- **Path:** `/api/admin/stats`
- **Purpose:** Retrieve admin dashboard statistics.
- **Authentication:** `adminMiddleware`.

### 6. Get Recent Users
- **Method:** GET
- **Path:** `/api/admin/recent-users`
- **Purpose:** Retrieve recent users.
- **Authentication:** `adminMiddleware`.

### 2. Course Service
Purpose: course creation, listing and management.

Document the implemented endpoints for:
- Create a course
- List courses
- Get course details
- Update or delete a course, if implemented

### 3. Learning Service
Purpose: enrollment, lessons, quizzes and progress tracking.

Document the implemented endpoints for:
- Enroll in a course
- Get enrolled courses
- Get course lessons
- Mark a lesson complete
- Create or publish a quiz
- Submit a quiz attempt
- Get learning progress

### 4. Media Service
Purpose: video upload and background processing.

Document the implemented endpoints for:
- Upload a video
- Check video-processing status
- Access processed HLS video, if implemented

Processing uses Redis, BullMQ and FFmpeg.

### 5. Live Class Service
Purpose: live-class sessions and LiveKit token generation.

Document the implemented endpoints for:
- Create or schedule a live class
- Generate a participant token
- Join a live class
- List classes, if implemented

### 6. Payment Service
Purpose: Razorpay test-mode payments.

Document the implemented endpoints for:
- Create payment order
- Verify payment

Use Razorpay test credentials only during development.

### 7. Certificate Service
Purpose: certificate eligibility verification and generation.

Document the implemented endpoints for:
- Check course-completion eligibility
- Generate a certificate
- List or retrieve certificates, if implemented

## API Gateway

**Base URL:** `http://localhost:8000`

### Health Check
- **Method:** GET
- **Path:** `/health`
- **Purpose:** Check Gateway status and configured service URLs.
- **Authentication:** Not required by the shown Gateway code.

### Proxy Routes

| Gateway Prefix | Target Service | Port |
| `/api/auth` | Auth Service | 3001 |
| `/api/admin` | Auth Service | 3001 |
| `/api/courses` | Course Service | 3002 |
| `/api/lessons` | Learning Service | 3003 |
| `/api/learning` | Learning Service | 3003 |
| `/api/quizzes` | Learning Service | 3003 |
| `/api/quiz-attempts` | Learning Service | 3003 |
| `/api/media` | Media Service | 3004 |
| `/api/live-classes` | Live Class Service | 3005 |
| `/api/payments` | Payment Service | 3006 |
| `/api/certificates` | Certificate Service | 3007 |

The Gateway forwards requests to configured services and enables credentialed CORS for the configured frontend origin.


## Course Service

**Base URL through Gateway:** `http://localhost:8000/api/courses`

| Method | Endpoint | Purpose | Access |
| GET | `/api/courses` | List courses | Public |
| GET | `/api/courses/admin/all` | List all courses for admin | Admin |
| GET | `/api/courses/:courseId` | Get a published course | Public |
| GET | `/api/courses/my` | Get instructor's own courses | Instructor/Admin |
| POST | `/api/courses` | Create a course | Instructor/Admin |
| PATCH | `/api/courses/:courseId` | Update a course | Instructor/Admin |
| DELETE | `/api/courses/:courseId` | Delete a course | Instructor/Admin |

### Health Check

- **Method:** GET
- **Path:** `http://localhost:3002/health`
- **Purpose:** Check whether the Course Service is running.

### Authentication and Authorization

Protected endpoints use cookie-based authentication through `authMiddleware`.

- Instructor/Admin: create, update, delete, and list own courses.
- Admin only: retrieve all courses through `/admin/all`.

### Notes

- Course IDs are passed using the `courseId` URL parameter.
- Request fields and response examples should be documented from the corresponding controller implementations.

## Learning Service

**Base URL through Gateway:** `http://localhost:8000`

### Enrollment and Progress — `/api/learning`

| Method | Endpoint | Purpose | Access |
| GET | `/api/learning/verify-enrollment` | Verify course enrollment internally | Internal service |
| POST | `/api/learning/enroll` | Enroll in a course | Authenticated user |
| GET | `/api/learning/my-courses` | Get logged-in user's enrollments | Authenticated user |
| GET | `/api/learning/:enrollmentId` | Get enrollment details | Authenticated user |
| PATCH | `/api/learning/:enrollmentId/complete-lesson` | Mark a lesson complete | Authenticated user |
| GET | `/api/learning/admin/stats` | Get enrollment statistics | Admin |

### Lessons — `/api/lessons`

| Method | Endpoint | Purpose | Access |
| GET | `/api/lessons/course/:courseId` | Get published lessons for a course | Public |
| POST | `/api/lessons` | Create a lesson | Instructor/Admin |
| PATCH | `/api/lessons/:lessonId/publish` | Publish or unpublish a lesson | Instructor/Admin |

### Quizzes — `/api/quizzes`

| Method | Endpoint | Purpose | Access |
| GET | `/api/quizzes/lesson/:lessonId` | Get published quizzes for a lesson | Public |
| POST | `/api/quizzes` | Create a quiz | Instructor/Admin |
| PATCH | `/api/quizzes/:quizId/publish` | Publish or unpublish a quiz | Instructor/Admin |

### Quiz Attempts — `/api/quiz-attempts`

| Method | Endpoint | Purpose | Access |
| POST | `/api/quiz-attempts/:quizId/submit` | Submit answers and receive an automatically graded result | Authenticated user |
| GET | `/api/quiz-attempts/:quizId/my-attempts` | Get the logged-in user's attempts | Authenticated user |

### Health Check

- **Method:** GET
- **Direct URL:** `http://localhost:3003/health`
- **Purpose:** Check whether the Learning Service is running.

### Authentication

Protected endpoints use cookie-based authentication through `authMiddleware`. Instructor/Admin routes use role-based authorization. The enrollment verification endpoint uses `internalServiceMiddleware`.

### Notes

- Route access should be confirmed against controller-level ownership and role checks.
- Request body fields and response examples should be documented from the controllers.
- Internal endpoints must only be accessible to authorized services.

## Media Service

**Base URL through Gateway:** `http://localhost:8000/api/media`

| Method | Endpoint | Purpose | Access |
| GET | `/api/media` | Get all media records | Public |
| GET | `/api/media/:mediaId` | Get media details | Public |
| GET | `/api/media/:mediaId/processing-status` | Check video-processing status | Authenticated user |
| POST | `/api/media/upload` | Upload a video for processing | Instructor/Admin |
| POST | `/api/media` | Create a media record | Instructor/Admin |
| DELETE | `/api/media/:mediaId` | Delete a media record | Instructor/Admin |
| PATCH | `/api/media/:mediaId/lesson` | Attach media to a lesson | Instructor/Admin |

### Video Upload

- **Method:** POST
- **Path:** `/api/media/upload`
- **Content type:** `multipart/form-data`
- **File field:** `video`
- **Authentication:** Required
- **Allowed roles:** Instructor/Admin
- **Purpose:** Upload a video for background processing.

### Video Processing

Video processing uses Redis, BullMQ and FFmpeg to convert uploaded videos into HLS format. The processing worker runs separately:

```bash
cd media-service
node src/workers/video.worker.js
```

Keep Redis, the Media Service and the worker running while testing uploads.

### Static File Paths

- `/uploads/videos`
- `/uploads/processed`

These paths are mounted as static directories in the Media Service. Actual file URLs depend on the uploaded and processed file paths.

### Health Check

- **Method:** GET
- **Direct URL:** `http://localhost:3004/health`
- **Purpose:** Check whether the Media Service is running.

### Notes

- Video upload uses the multipart field `video`.
- Processing status requires authentication.
- Verify the controller implementation for accepted file types, file-size limits, response format, and CloudFront/S3 playback URLs.
- The shown Media Service app has its CORS middleware commented out. Browser access through the Gateway may still work because the Gateway handles CORS, but direct browser requests to port 3004 may not.

## Live Class Service

**Base URL through Gateway:** `http://localhost:8000/api/live-classes`

| Method | Endpoint | Purpose | Access |
| GET | `/api/live-classes/upcoming` | View upcoming live classes | Public |
| GET | `/api/live-classes/my-classes` | View instructor's own classes | Instructor/Admin |
| POST | `/api/live-classes` | Schedule a live class | Instructor/Admin |
| PATCH | `/api/live-classes/:classId/status` | Update live-class status | Instructor/Admin |
| POST | `/api/live-classes/:classId/join-token` | Request a LiveKit join token | Authenticated user |

### Join a Live Class

- **Method:** POST
- **Path:** `/api/live-classes/:classId/join-token`
- **Authentication:** Required
- **Purpose:** Request a token for joining a live class.
- **Response:** Check `joinLiveClassController` for the exact token and LiveKit server URL fields.

### Health Check

- **Method:** GET
- **Direct URL:** `http://localhost:3005/health`
- **Purpose:** Check whether the Live Class Service is running.

### Authentication and Authorization

- Upcoming classes are publicly accessible.
- Scheduling, viewing own classes and updating class status require instructor/admin roles.
- Joining a class requires authentication.
- Verify enrollment and class ownership rules in the controller before documenting additional restrictions.

### Notes

LiveKit provides the live-class infrastructure. Document the exact request fields, response structure and status values from `liveClass.controller.js`.


## Payment Service

**Base URL through Gateway:** `http://localhost:8000/api/payments`

Payments use Razorpay Test Mode during development.

| Method | Endpoint | Purpose | Access |
| POST | `/api/payments/create-order` | Create a payment order | Student |
| POST | `/api/payments/verify-payment` | Verify payment details | Student |
| POST | `/api/payments/retry-enrollment` | Retry enrollment after payment | Student |
| GET | `/api/payments/instructor/earnings` | Retrieve instructor earnings | Instructor/Admin |

### Create Payment Order

- **Method:** POST
- **Path:** `/api/payments/create-order`
- **Authentication:** Required
- **Role:** Student
- **Purpose:** Create a Razorpay order for a course purchase.
- **Request and response fields:** Refer to `createOrder` in `payment.controller.js`.

### Verify Payment

- **Method:** POST
- **Path:** `/api/payments/verify-payment`
- **Authentication:** Required
- **Role:** Student
- **Purpose:** Verify payment details after checkout.
- **Security:** Payment verification must validate the signature server-side.

### Retry Enrollment

- **Method:** POST
- **Path:** `/api/payments/retry-enrollment`
- **Authentication:** Required
- **Role:** Student
- **Purpose:** Retry course enrollment following a payment flow.
- **Request and response fields:** Refer to `retryEnrollment` in `payment.controller.js`.

### Instructor Earnings

- **Method:** GET
- **Path:** `/api/payments/instructor/earnings`
- **Authentication:** Required
- **Roles:** Instructor/Admin
- **Purpose:** Retrieve earnings information for the instructor dashboard.
- **Note:** Verify the controller's calculations and access restrictions before treating earnings as production-ready.

### Health Check

- **Method:** GET
- **Direct URL:** `http://localhost:3006/health`
- **Purpose:** Check whether the Payment Service is running.

### Security Notes

- Use Razorpay test credentials for development.
- Never expose the Razorpay secret key in frontend code.
- Verify payment signatures on the backend.
- Never commit `.env` files or payment credentials to GitHub.

## Certificate Service

**Base URL through Gateway:** `http://localhost:8000/api/certificates`

| Method | Endpoint | Purpose | Access |
| POST | `/api/certificates/issue` | Issue a course-completion certificate | Authenticated user |
| GET | `/api/certificates/my-certificates` | Get logged-in user's certificates | Authenticated user |
| GET | `/api/certificates/verify/:certificateId` | Verify a certificate | Public |
| GET | `/api/certificates/:certificateId/download` | Download certificate PDF | Authenticated user |

### Issue Certificate

- **Method:** POST
- **Path:** `/api/certificates/issue`
- **Authentication:** Required
- **Purpose:** Request a certificate for a completed course.
- **Eligibility:** Course completion and enrollment should be verified by the backend.

### My Certificates

- **Method:** GET
- **Path:** `/api/certificates/my-certificates`
- **Authentication:** Required
- **Purpose:** Retrieve certificates belonging to the logged-in user.

### Verify Certificate

- **Method:** GET
- **Path:** `/api/certificates/verify/:certificateId`
- **Authentication:** Not required by the shown route.
- **Purpose:** Verify a certificate using its certificate ID.

### Download Certificate PDF

- **Method:** GET
- **Path:** `/api/certificates/:certificateId/download`
- **Authentication:** Required
- **Purpose:** Download a certificate in PDF format.

### Health Check

- **Method:** GET
- **Direct URL:** `http://localhost:3007/health`
- **Purpose:** Check whether the Certificate Service is running.

### Notes

- Refer to `certificate.controller.js` for exact request fields and response formats.
- Verify that users can only download certificates they are authorized to access.
- Keep internal service credentials and environment variables private.

## Common Development Notes

- Start MongoDB and Redis before testing the services that depend on them.
- Start all backend services and the API Gateway before using the frontend.
- Start the Media Service video worker in a separate terminal.
- Use HTTP-only cookies and send credentials with browser requests where required.
- Use test credentials for Razorpay during development.
- Do not commit `.env` files, private keys or API secrets.
- Confirm endpoint request bodies, response examples and error codes from the controllers before publishing the documentation.

> Important: Replace these module descriptions with the exact HTTP methods and paths from your route files. Do not document an endpoint as available until you verify it in the code.
