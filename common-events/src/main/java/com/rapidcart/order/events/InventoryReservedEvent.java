package com.rapidcart.order.events;

public record InventoryReservedEvent(
        String orderId
) {}
