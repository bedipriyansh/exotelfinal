CREATE DATABASE IF NOT EXISTS exotel_db;
USE exotel_db;

CREATE TABLE IF NOT EXISTS missed_calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    call_sid VARCHAR(64) UNIQUE NOT NULL,
    caller_number VARCHAR(20) NOT NULL,
    exotel_number VARCHAR(20) NOT NULL,
    call_status VARCHAR(32) NOT NULL,
    direction VARCHAR(16) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_call_sid (call_sid),
    INDEX idx_caller_number (caller_number),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
