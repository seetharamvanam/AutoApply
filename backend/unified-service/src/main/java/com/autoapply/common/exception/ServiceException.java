package com.autoapply.common.exception;

/**
 * Thrown when an internal dependency or operation fails.
 * Prefer a generic message and keep the root cause as the exception cause.
 */
public class ServiceException extends RuntimeException {
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}


