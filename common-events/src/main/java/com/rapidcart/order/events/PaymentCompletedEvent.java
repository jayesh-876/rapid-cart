package com.rapidcart.order.events;

public record PaymentCompletedEvent(
        String orderId
) {}
