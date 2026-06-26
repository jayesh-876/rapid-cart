package com.rapidcart.order.events;

public record PaymentFailedEvent(
        String orderId,
        String reason
) {}
