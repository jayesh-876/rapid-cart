package com.rapidcart.payment.kafka;

import com.rapidcart.order.events.InventoryReservedEvent;
import com.rapidcart.payment.service.PaymentProcessingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventConsumer.class);

    private final PaymentProcessingService service;

    @KafkaListener(topics = "inventory-reserved", groupId = "payment-service")
    public void handleInventoryReserved(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent: orderId={}", event.orderId());
        service.processPayment(event);
    }
}
