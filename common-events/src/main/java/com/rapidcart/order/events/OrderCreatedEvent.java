package com.rapidcart.order.events;

public record OrderCreatedEvent(
        String productId,
        String orderId,
        String userId,
        int quantity,
        double amount
) {}
