package com.rapidcart.order.events;

public record InventoryFailedEvent(
        String orderId,
        String reason
) {}
