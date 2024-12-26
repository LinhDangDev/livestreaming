CREATE DATABASE IF NOT EXISTS streaming_db;
USE streaming_db;

-- Bảng streams
CREATE TABLE IF NOT EXISTS streams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    streamer_name VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng participants
CREATE TABLE IF NOT EXISTS participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role ENUM('streamer', 'viewer') NOT NULL,
    status ENUM('active', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- Bảng chat
CREATE TABLE IF NOT EXISTS chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    participant_id INT NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id)
);

-- Bảng attachments
CREATE TABLE IF NOT EXISTS attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

-- Bảng banned_participants
CREATE TABLE IF NOT EXISTS bannedparticipants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    participant_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    reason TEXT,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    banned_by INT NOT NULL,
    ban_end_time TIMESTAMP NULL,
    FOREIGN KEY (stream_id) REFERENCES streams(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id)
);

-- Bảng stream_recordings
CREATE TABLE IF NOT EXISTS stream_recordings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    duration INT,
    size BIGINT,
    status ENUM('recording', 'completed', 'failed') DEFAULT 'recording',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (stream_id) REFERENCES streams(id)
);
