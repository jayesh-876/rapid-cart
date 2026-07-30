package com.rapidcart.inventory.kafka;

import com.rapidcart.order.events.InventoryFailedEvent;
import com.rapidcart.order.events.InventoryReservedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishInventoryReserved(InventoryReservedEvent event) {
        kafkaTemplate.send("inventory-reserved", event.orderId(), event).join();
    }

    public void publishInventoryFailed(InventoryFailedEvent event) {
        kafkaTemplate.send("inventory-failed", event.orderId(), event).join();
    }
}
