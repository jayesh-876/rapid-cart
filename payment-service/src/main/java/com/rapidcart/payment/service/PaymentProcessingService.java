package com.rapidcart.payment.service;

import com.rapidcart.order.events.InventoryReservedEvent;
import com.rapidcart.order.events.PaymentCompletedEvent;
import com.rapidcart.order.events.PaymentFailedEvent;
import com.rapidcart.common.exception.ValidationException;
import com.rapidcart.payment.entity.PaymentRecord;
import com.rapidcart.payment.kafka.PaymentEventProducer;
import com.rapidcart.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.random.RandomGenerator;

@Service
@RequiredArgsConstructor
public class PaymentProcessingService {

    private static final Logger log = LoggerFactory.getLogger(PaymentProcessingService.class);
    private static final double PAYMENT_SUCCESS_RATE = 0.80;

    private final PaymentRepository repository;
    private final PaymentEventProducer producer;

    public void processPayment(InventoryReservedEvent event) {
        validateEvent(event);
        log.info("Processing payment: orderId={}", event.orderId());
        try {
            boolean paymentSuccess = RandomGenerator.getDefault().nextDouble() < PAYMENT_SUCCESS_RATE;

            PaymentRecord record = new PaymentRecord();
            record.setOrderId(event.orderId());

            if (paymentSuccess) {
                record.setStatus("SUCCESS");
                repository.save(record);
                log.info("Payment successful: orderId={}, paymentId={}", event.orderId(), record.getId());

                producer.publishPaymentCompleted(
                        new PaymentCompletedEvent(event.orderId())
                );
                log.info("Published PaymentCompletedEvent: orderId={}", event.orderId());
            } else {
                record.setStatus("FAILED");
                repository.save(record);
                log.warn("Payment failed: orderId={}, paymentId={}", event.orderId(), record.getId());

                producer.publishPaymentFailed(
                        new PaymentFailedEvent(event.orderId(), "Payment declined")
                );
                log.info("Published PaymentFailedEvent: orderId={}", event.orderId());
            }
        } catch (Exception ex) {
            log.error("Error processing payment: orderId={}", event.orderId(), ex);
            publishProcessingFailure(event, ex);
        }
    }

    private void validateEvent(InventoryReservedEvent event) {
        if (event == null) {
            throw new ValidationException("Event payload is required");
        }
        if (event.orderId() == null || event.orderId().isBlank()) {
            throw new ValidationException("orderId is required");
        }
    }

    private void publishProcessingFailure(InventoryReservedEvent event, Exception originalError) {
        try {
            producer.publishPaymentFailed(
                    new PaymentFailedEvent(event.orderId(), "Payment processing error")
            );
            log.info("Published PaymentFailedEvent after processing error: orderId={}", event.orderId());
        } catch (Exception publishError) {
            originalError.addSuppressed(publishError);
            throw new IllegalStateException("Unable to publish payment failure event", originalError);
        }
    }
}
