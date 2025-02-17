# Livestreaming Platform

## Table of Contents

1. [Introduction](#introduction)
2. [Technologies Used](#technologies-used)
3. [Setup Instructions](#setup-instructions)
4. [Processing Workflow](#processing-workflow)
5. [Directory Structure](#directory-structure)


---

## Introduction

The **Livestreaming Platform** is a real-time video streaming and interaction platform. It supports key features such as:

- Live streaming via the RTMP protocol.
- Converting RTMP to HLS for browser playback.
- Storing and managing recordings of live streams.
- Real-time chat interaction between the broadcaster and viewers.

---

## Technologies Used

### Backend

- **Node.js** : Handles application logic, RESTful APIs, and real-time chat using WebSocket.
- **Express.js** : Web framework for Node.js.
- **MySQL** : Relational database for storing user information, stream history, and other content.
- **Sequelize** : ORM for interacting with MySQL.
- **Socket.IO** : Real-time chat functionality.
- **Fluent-FFmpeg** : Video and audio format conversion.
- **Node-Media-Server** : Media streaming server supporting RTMP and HLS.

### Frontend

- **React.js** : JavaScript library for building user interfaces.
- **Vite** : Modern build tool for frontend.
- **Axios** : Making API calls from the frontend to the backend.
- **ShadcnUI** : 
### Streaming

- **Nginx** : Reverse proxy and streaming server for HLS/RTMP.
- **RTMP** : Real-time messaging protocol for video streaming.
- **HLS** : HTTP Live Streaming format for browser playback.

### Infrastructure

- **Docker/Docker Compose** : Containerization and deployment.
- **Healthcheck** : Automatic service status checks.

---

## Setup Instructions

### Requirements

- Docker and Docker Compose installed.
- Git to clone the source code.

### Steps to Set Up

1. **Clone the Repository:**    
```
    git clone https://github.com/LinhDangDev/livestreaming.git
    cd livestreaming
```
2. **Build and Run Services:**
```
 docker-compose up --build
```
1. **Access the Application:**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:3000`
    - HLS Streaming: `http://localhost:8080/live/<stream-name>.m3u8`
2. **Set Environment Variables:**
    - Environment variables are configured in `docker-compose.yml` and `.env` files.
	- Example:

```
	DB_HOST=mysql_db
	DB_USER=root
	DB_PASSWORD=root
	DB_NAME=streaming_db
	NGINX_HOST=nginx
	RTMP_PORT=1935
	HTTP_PORT=8080
```

## Processing Workflow

### 1. Live Streaming Workflow (RTMP → HLS)

4. **User Starts Streaming:**
    
    - The user uses OBS or any RTMP-compatible software to stream to the Nginx RTMP endpoint (`rtmp://<NGINX_HOST>:1935/live/<stream-key>`).
5. **Nginx Receives RTMP Stream:**
    
    - Nginx processes the RTMP stream using the `nginx-rtmp-module`.
    - The stream is converted to HLS (HTTP Live Streaming) and stored in the directory `/usr/local/nginx/html/live`.
6. **Frontend Plays HLS:**
    
    - The frontend uses an HTML5 player (e.g., Video.js or Hls.js) to play the HLS content from the URL `http://<NGINX_HOST>:8080/live/<stream-name>.m3u8`.
7. **Recording Management:**
    
    - Nginx records the entire stream to the directory `/usr/local/nginx/recordings`.
    - After the stream ends, Nginx sends a notification to the backend via the `exec_record_done` hook to store recording information in the database.

### 2. Real-Time Chat Interaction Workflow

1. **User Sends Message:**
    - The user sends a message from the frontend to the backend via WebSocket.
2. **Backend Processes Message:**
	- The backend receives the message, stores it in the database (if needed), and broadcasts the message to all clients in the same session using Socket.IO.
3. **Frontend Displays Message:**
	- The frontend receives the new message from the backend and updates the chat interface immediately.

### 3. User Management Workflow

4. **Registration/Login:**
     - Users register or log in through the backend's RESTful API.
5. **Authentication:**
    - The backend uses JWT (JSON Web Token) to authenticate users after login.
6. **Access Control:**
    - The backend checks user permissions before allowing actions such as starting a live stream or sending messages.

### Directory Structure
```
livestreaming/
├── Back_end/
│   ├── backendlivestreaming/
│   │   ├── app.js                  # Entry point of the backend
│   │   ├── config/                 # Configuration files
│   │   ├── controllers/            # Controller logic
│   │   ├── entity/                 # Entity models
│   │   ├── middleware/             # Middleware functions
│   │   ├── routes/                 # API routes
│   │   └── services/               # Service layer
│   ├── mysql/
│   │   └── init.sql                # SQL script to initialize the database
│   ├── nginx/
│   │   ├── nginx.conf              # Nginx HTTP configuration
│   │   └── rtmp.conf               # Nginx RTMP configuration
│   ├── ffmpeg/
│   │   └── Dockerfile              # FFmpeg Docker configuration
│   └── data/                       # Data storage directory
│       ├── hls/                    # HLS stream data
│       └── recordings/             # Recorded stream data
├── Front_end/
│   └── frontendstreaming/
│       ├── public/                 # Public assets
│       ├── src/                    # Source code for the frontend
│       │   ├── assets/             # Static assets
│       │   ├── components/         # React components
│       │   │   ├── screen/         # Screen components
│       │   │   │   ├── CreateRoomLive/
│       │   │   │   ├── JoiningRoomLive/
│       │   │   │   └── LiveStream/
│       │   │   ├── ui/             # UI components
│       │   │   └── ultilities/     # Utility functions
│       │   ├── lib/                # Library files
│       │   ├── services/           # Service layer
│       │   ├── styles/             # CSS and styling files
│       │   └── types/              # TypeScript definitions
│       ├── vite.config.js          # Vite configuration
│       └── node_modules/           # Dependencies
├── docker-compose.yml              # Docker Compose configuration
└── README.md                       # Project documentation
```

##### Detail Explaining
#### Backend
- **`backendlivestreaming/`** : Contains the backend application code.
	- **`app.js`** : Entry point of the backend application.
    - **`config/`** : Configuration files for the backend.
    - **`controllers/`** : Logic for handling API requests.
    - **`entity/`** : Models for the database entities.
    - **`middleware/`** : Middleware functions for request processing.
    - **`routes/`** : API route definitions.
    - **`services/`** : Service layer for business logic.
- **`mysql/`** : SQL initialization scripts.
    - **`init.sql`** : Script to create the initial database schema.
- **`nginx/`** : Nginx configuration files.
    - **`nginx.conf`** : HTTP configuration for Nginx.
    - **`rtmp.conf`** : RTMP configuration for Nginx.
- **`ffmpeg/`** : FFmpeg Docker configuration.
    - **`Dockerfile`** : Configuration for building the FFmpeg Docker image.
- **`data/`** : Directory for storing data.
    - **`hls/`** : Directory for HLS stream data.
    - **`recordings/`** : Directory for recorded stream data
#### Frontend
- **`frontendstreaming/`** : Contains the frontend application code.
    - **`public/`** : Directory for public assets.
    - **`src/`** : Source code for the frontend.
        - **`assets/`** : Static assets like images and fonts.
        - **`components/`** : React components.
            - **`screen/`** : Screen components for different views.
                - **`CreateRoomLive/`** : Component for creating a live room.
                - **`JoiningRoomLive/`** : Component for joining a live room.
                - **`LiveStream/`** : Component for viewing a live stream.
            - **`ui/`** : UI components for reusable elements.
            - **`ultilities/`** : Utility functions.
        - **`lib/`** : Library files.
        - **`services/`** : Service layer for frontend.
        - **`styles/`** : CSS and styling files.
        - **`types/`** : TypeScript definitions.
    - **`vite.config.js`** : Configuration file for Vite.
    - **`node_modules/`** : Directory for npm dependencies.
