package com.rapidcart.inventory.kafka;

import com.rapidcart.inventory.service.InventoryService;
import com.rapidcart.order.events.OrderCreatedEvent;
import com.rapidcart.order.events.ReleaseInventoryEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventConsumer.class);

    private final InventoryService service;

    @KafkaListener(topics = "order-created", groupId = "inventory-service")
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent: orderId={}, productId={}", event.orderId(), event.productId());
        service.handleOrderCreated(event);
    }

    /**
     * SAGA compensating transaction listener.
     * Triggered when payment fails; restores inventory that was previously reserved.
     */
    @KafkaListener(topics = "release-inventory", groupId = "inventory-service")
    public void onReleaseInventory(ReleaseInventoryEvent event) {
        log.info("[SAGA] Received ReleaseInventoryEvent: orderId={}, productId={}, qty={}",
                event.orderId(), event.productId(), event.quantity());
        service.handleReleaseInventory(event);
    }
}
