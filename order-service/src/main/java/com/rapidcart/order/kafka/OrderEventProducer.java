package com.rapidcart.order.kafka;

import com.rapidcart.order.events.*;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        kafkaTemplate.send("order-created", event.orderId(), event);
    }

    public void publishOrderCompleted(OrderCompletedEvent event) {
        kafkaTemplate.send("order-completed", event.orderId(), event);
    }

    public void publishReleaseInventory(ReleaseInventoryEvent event) {
        kafkaTemplate.send("release-inventory", event.orderId(), event);
    }
}
