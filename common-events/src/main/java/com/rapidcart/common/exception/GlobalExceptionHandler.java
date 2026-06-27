package com.rapidcart.common.exception;

import com.rapidcart.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (ex instanceof ResourceNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof ValidationException || ex instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
        }

        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            message = "Unexpected error occurred";
        }

        return buildError(status, status.getReasonPhrase(), message, request, List.of());
    }

    private ResponseEntity<ApiErrorResponse> buildError(HttpStatus status, String error, String message, HttpServletRequest request, List<String> details) {
        ApiErrorResponse body = ApiErrorResponse.of(
                status.value(),
                error,
                message,
                request.getRequestURI(),
                details
        );
        return ResponseEntity.status(status).body(body);
    }
}
