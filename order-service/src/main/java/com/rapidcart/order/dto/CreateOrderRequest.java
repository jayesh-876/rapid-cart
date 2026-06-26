package com.rapidcart.order.dto;

public record CreateOrderRequest(
        String productId,
        String userId,
        int quantity,
        double amount
) {}
