package com.rapidcart.order.events;

public record ReleaseInventoryEvent(
        String orderId,
        String productId,
        int quantity
) {}
