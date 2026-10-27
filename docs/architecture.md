
# LMS — System Architecture

```mermaid
flowchart TB
    U[Student / Instructor / Admin]
    FE[React + Vite + Redux Toolkit<br/>Port 5173]
    GW[Custom API Gateway<br/>Port 8000]

    AUTH[Auth Service<br/>3001]
    COURSE[Course Service<br/>3002]
    LEARN[Learning Service<br/>3003]
    MEDIA[Media Service<br/>3004]
    LIVE[Live Class Service<br/>3005]
    PAY[Payment Service<br/>3006]
    CERT[Certificate Service<br/>3007]

    REDIS[(Redis)]
    WORKER[BullMQ Worker + FFmpeg]
    S3[(AWS S3)]
    CF[CloudFront CDN]
    LK[LiveKit]
    RZ[Razorpay Test Mode]

    U --> FE
    FE --> GW

    GW --> AUTH
    GW --> COURSE
    GW --> LEARN
    GW --> MEDIA
    GW --> LIVE
    GW --> PAY
    GW --> CERT

    MEDIA --> REDIS
    REDIS --> WORKER
    WORKER --> S3
    S3 --> CF

    LIVE --> LK
    PAY --> RZ
```

## Architecture Notes

- The React frontend sends API requests through the custom API Gateway.
- The Gateway routes requests to the appropriate backend microservice.
- Redis and BullMQ manage background video-processing jobs.
- FFmpeg processes uploaded videos into HLS format.
- AWS S3 stores processed video files, and CloudFront delivers them.
- LiveKit powers live-class functionality.
- Razorpay Test Mode supports payment testing.
- Each backend service should use its configured database and environment variables.
