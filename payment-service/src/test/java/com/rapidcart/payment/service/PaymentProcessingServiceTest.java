package com.rapidcart.payment.service;

import com.rapidcart.order.events.InventoryReservedEvent;
import com.rapidcart.order.events.PaymentFailedEvent;
import com.rapidcart.payment.entity.PaymentRecord;
import com.rapidcart.payment.kafka.PaymentEventProducer;
import com.rapidcart.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentProcessingServiceTest {

    @Mock
    private PaymentRepository repository;

    @Mock
    private PaymentEventProducer producer;

    private PaymentProcessingService service;

    @BeforeEach
    void setUp() {
        service = new PaymentProcessingService(repository, producer);
    }

    @Test
    void processingErrorPublishesFailureEvent() {
        when(repository.save(any(PaymentRecord.class))).thenThrow(new RuntimeException("database unavailable"));

        service.processPayment(new InventoryReservedEvent("O1"));

        ArgumentCaptor<PaymentFailedEvent> event = ArgumentCaptor.forClass(PaymentFailedEvent.class);
        verify(producer).publishPaymentFailed(event.capture());

        assertThat(event.getValue().orderId()).isEqualTo("O1");
        assertThat(event.getValue().reason()).isEqualTo("Payment processing error");
    }
}
