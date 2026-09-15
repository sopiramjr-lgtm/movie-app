package com.movie_app.movie_app_api.core.exception;

public class FileStorageException extends RuntimeException {
    public FileStorageException(String message) { super(message); }
    public FileStorageException(String message, Throwable cause) { super(message, cause); }
}