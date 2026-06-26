package com.rapidcart.order.kafka;

import com.rapidcart.order.events.*;
import com.rapidcart.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final OrderService service;

    @KafkaListener(topics = "inventory-reserved", groupId = "order-service")
    public void onInventoryReserved(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent: orderId={}", event.orderId());
        service.handleInventoryReserved(event.orderId());
    }

    @KafkaListener(topics = "inventory-failed", groupId = "order-service")
    public void onInventoryFailed(InventoryFailedEvent event) {
        log.info("Received InventoryFailedEvent: orderId={}, reason={}", event.orderId(), event.reason());
        service.handleInventoryFailed(event.orderId(), event.reason());
    }

    @KafkaListener(topics = "payment-completed", groupId = "order-service")
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent: orderId={}", event.orderId());
        service.handlePaymentCompleted(event.orderId());
    }

    @KafkaListener(topics = "payment-failed", groupId = "order-service")
    public void onPaymentFailed(PaymentFailedEvent event) {
        log.info("Received PaymentFailedEvent: orderId={}, reason={}", event.orderId(), event.reason());
        service.handlePaymentFailed(event.orderId(), event.reason());
    }
}
