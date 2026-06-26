package com.rapidcart.notification.kafka;

import com.rapidcart.notification.service.NotificationService;
import com.rapidcart.order.events.OrderCompletedEvent;
import com.rapidcart.order.events.PaymentCompletedEvent;
import com.rapidcart.order.events.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final NotificationService service;

    @KafkaListener(topics = "payment-completed", groupId = "notification-service")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent: orderId={}", event.orderId());
        service.sendPaymentSuccess(event);
    }

    @KafkaListener(topics = "payment-failed", groupId = "notification-service")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received PaymentFailedEvent: orderId={}, reason={}", event.orderId(), event.reason());
        service.sendPaymentFailure(event);
    }

    @KafkaListener(topics = "order-completed", groupId = "notification-service")
    public void handleOrderCompleted(OrderCompletedEvent event) {
        log.info("Received OrderCompletedEvent: orderId={}", event.orderId());
        service.sendOrderCompletion(event);
    }
}
