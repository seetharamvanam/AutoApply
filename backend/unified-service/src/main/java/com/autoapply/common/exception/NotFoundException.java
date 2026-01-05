package com.autoapply.common.exception;

/**
 * Thrown when a requested resource does not exist.
 *
 * Mapped to HTTP 404 by {@code com.autoapply.common.web.GlobalExceptionHandler}.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}


