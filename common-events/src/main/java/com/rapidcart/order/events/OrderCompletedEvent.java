package com.rapidcart.order.events;

public record OrderCompletedEvent(
        String orderId
) {}
