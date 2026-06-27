package com.rapidcart.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotBlank(message = "productId is required") String productId,
        @NotBlank(message = "userId is required") String userId,
        @NotNull(message = "quantity is required") @Min(value = 1, message = "quantity must be at least 1") int quantity,
        @NotNull(message = "amount is required") @DecimalMin(value = "0.01", message = "amount must be greater than 0") double amount
) {}
