package com.autoapply.common.exception;

/**
 * Thrown when the request is syntactically valid but semantically invalid.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}


