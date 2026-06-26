package com.rapidcart.notification.service;

import com.rapidcart.order.events.OrderCompletedEvent;
import com.rapidcart.order.events.PaymentCompletedEvent;
import com.rapidcart.order.events.PaymentFailedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    public void sendPaymentSuccess(PaymentCompletedEvent event) {
        log.info("Notification sent: type=PAYMENT_SUCCESS, orderId={}", event.orderId());
    }

    public void sendPaymentFailure(PaymentFailedEvent event) {
        log.info("Notification sent: type=PAYMENT_FAILURE, orderId={}, reason={}", event.orderId(), event.reason());
    }

    public void sendOrderCompletion(OrderCompletedEvent event) {
        log.info("Notification sent: type=ORDER_COMPLETED, orderId={}", event.orderId());
    }
}
