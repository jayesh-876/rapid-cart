package com.rapidcart.inventory.service;

import com.rapidcart.common.exception.ResourceNotFoundException;
import com.rapidcart.common.exception.ValidationException;
import com.rapidcart.inventory.entity.ItemEntity;
import com.rapidcart.inventory.repository.ItemRepository;
import com.rapidcart.inventory.kafka.InventoryEventProducer;
import com.rapidcart.order.events.InventoryFailedEvent;
import com.rapidcart.order.events.InventoryReservedEvent;
import com.rapidcart.order.events.OrderCreatedEvent;
import com.rapidcart.order.events.ReleaseInventoryEvent;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private final ItemRepository repository;
    private final InventoryEventProducer producer;

    public List<ItemEntity> getAllItems() {
        return repository.findAll();
    }

    public void handleOrderCreated(OrderCreatedEvent event) {
        validateOrderCreatedEvent(event);
        String productId = event.productId();

        log.info("Checking inventory: orderId={}, productId={}", event.orderId(), productId);
        ItemEntity item = repository.findByProductId(productId)
                .orElseThrow(() -> {
                    log.error("Inventory not found: orderId={}, productId={}", event.orderId(), productId);
                    return new ResourceNotFoundException("Inventory not found for productId=" + productId);
                });

        if (item.getStock() >= event.quantity()) {
            int previousStock = item.getStock();
            item.setStock(item.getStock() - event.quantity());
            repository.save(item);
            log.info("Inventory reserved: orderId={}, productId={}, stock {} -> {}",
                    event.orderId(), productId, previousStock, item.getStock());

            producer.publishInventoryReserved(
                    new InventoryReservedEvent(event.orderId())
            );
            log.info("Published InventoryReservedEvent: orderId={}", event.orderId());
        } else {
            log.warn("Out of stock: orderId={}, productId={}, requested={}, available={}",
                    event.orderId(), productId, event.quantity(), item.getStock());
            producer.publishInventoryFailed(
                    new InventoryFailedEvent(event.orderId(), "Out of stock")
            );
            log.info("Published InventoryFailedEvent: orderId={}", event.orderId());
        }
    }

    /**
     * SAGA compensating transaction: called when payment fails.
     * Restores the previously reserved inventory so it becomes available again.
     */
    public void handleReleaseInventory(ReleaseInventoryEvent event) {
        log.info("[SAGA] Releasing inventory for failed payment: orderId={}, productId={}, qty={}",
                event.orderId(), event.productId(), event.quantity());

        ItemEntity item = repository.findByProductId(event.productId())
                .orElseGet(() -> {
                    log.warn("[SAGA] No inventory record found for productId={}, creating entry", event.productId());
                    ItemEntity newItem = new ItemEntity();
                    newItem.setProductId(event.productId());
                    newItem.setStock(0);
                    return newItem;
                });

        int previousStock = item.getStock();
        item.setStock(item.getStock() + event.quantity());
        repository.save(item);
        log.info("[SAGA] Inventory released: orderId={}, productId={}, stock {} -> {}",
                event.orderId(), event.productId(), previousStock, item.getStock());
    }

    public void addStock(String productId, int quantity) {
        validateProductIdAndQuantity(productId, quantity);
        log.info("Adding stock: productId={}, quantity={}", productId, quantity);
        ItemEntity item = repository.findByProductId(productId)
                .orElseGet(() -> {
                    log.info("No inventory found for productId={}, creating new item", productId);
                    ItemEntity newItem = new ItemEntity();
                    newItem.setProductId(productId);
                    newItem.setStock(0);
                    return newItem;
                });

        int oldStock = item.getStock();
        item.setStock(item.getStock() + quantity);
        repository.save(item);
        log.info("Stock updated: productId={}, stock {} -> {}", productId, oldStock, item.getStock());
    }

    private void validateOrderCreatedEvent(OrderCreatedEvent event) {
        if (event == null) {
            throw new ValidationException("Event payload is required");
        }
        if (event.productId() == null || event.productId().isBlank()) {
            throw new ValidationException("productId is required");
        }
        if (event.orderId() == null || event.orderId().isBlank()) {
            throw new ValidationException("orderId is required");
        }
        if (event.quantity() <= 0) {
            throw new ValidationException("quantity must be greater than 0");
        }
    }

    private void validateProductIdAndQuantity(String productId, int quantity) {
        if (productId == null || productId.isBlank()) {
            throw new ValidationException("productId is required");
        }
        if (quantity <= 0) {
            throw new ValidationException("quantity must be greater than 0");
        }
    }
}
