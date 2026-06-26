package com.rapidcart.order.dto;

public record OrderResponse(
        String orderId,
        String userId,
        double amount,
        String status
) {}
