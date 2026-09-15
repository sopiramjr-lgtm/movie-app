package com.movie_app.movie_app_api.core.exception;

public class ResourceConflictException extends RuntimeException {
    public ResourceConflictException(String message) { super(message); }
}