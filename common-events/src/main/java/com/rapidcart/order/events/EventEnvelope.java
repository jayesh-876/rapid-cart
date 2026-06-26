package com.rapidcart.order.events;

public record EventEnvelope<T>(
        String eventId,
        String eventType,
        long timestamp,
        T data
) {}
