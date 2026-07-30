package com.rapidcart.inventory.service;

import com.rapidcart.inventory.kafka.InventoryEventProducer;
import com.rapidcart.inventory.repository.ItemRepository;
import com.rapidcart.order.events.InventoryFailedEvent;
import com.rapidcart.order.events.OrderCreatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ItemRepository repository;

    @Mock
    private InventoryEventProducer producer;

    private InventoryService service;

    @BeforeEach
    void setUp() {
        service = new InventoryService(repository, producer);
    }

    @Test
    void missingInventoryPublishesFailureEvent() {
        when(repository.findByProductId("P1")).thenReturn(Optional.empty());

        service.handleOrderCreated(new OrderCreatedEvent("P1", "O1", "U1", 1, 100.0));

        ArgumentCaptor<InventoryFailedEvent> event = ArgumentCaptor.forClass(InventoryFailedEvent.class);
        verify(producer).publishInventoryFailed(event.capture());
        verify(repository, never()).save(any());

        assertThat(event.getValue().orderId()).isEqualTo("O1");
        assertThat(event.getValue().reason()).contains("Inventory not found");
    }
}
