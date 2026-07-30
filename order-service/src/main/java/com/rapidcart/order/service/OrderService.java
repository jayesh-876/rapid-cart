package com.rapidcart.order.service;

import com.rapidcart.common.exception.ResourceNotFoundException;
import com.rapidcart.common.exception.ValidationException;
import com.rapidcart.order.dto.CreateOrderRequest;
import com.rapidcart.order.dto.OrderResponse;
import com.rapidcart.order.entity.OrderEntity;
import com.rapidcart.order.entity.OrderStatus;
import com.rapidcart.order.events.*;
import com.rapidcart.order.repository.OrderRepository;
import com.rapidcart.order.kafka.OrderEventProducer;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final String SAGA = "[SAGA]";

    private final OrderRepository orderRepository;
    private final OrderEventProducer producer;

    public OrderResponse createOrder(CreateOrderRequest request) {
        validateCreateOrderRequest(request);
        log.info("{} Creating order userId={} productId={} amount={}", SAGA, request.userId(), request.productId(), request.amount());
        String orderId = UUID.randomUUID().toString();

        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUserId(request.userId());
        order.setProductId(request.productId());
        order.setQuantity(request.quantity());
        order.setAmount(request.amount());
        order.setStatus(OrderStatus.CREATED);

        orderRepository.save(order);
        log.info("{} Order persisted orderId={} status={}", SAGA, orderId, order.getStatus());

        producer.publishOrderCreated(new OrderCreatedEvent(request.productId(), orderId, request.userId(), request.quantity(), request.amount()));
        log.info("{} Published OrderCreatedEvent orderId={}", SAGA, orderId);

        return new OrderResponse(orderId, order.getUserId(), order.getAmount(), order.getStatus().name());
    }

    public OrderResponse getOrder(String orderId) {
        OrderEntity order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found: " + orderId));

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getAmount(),
                order.getStatus().name()
        );
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getUserId(),
                        order.getAmount(),
                        order.getStatus().name()
                ))
                .toList();
    }

    public void handleInventoryReserved(String orderId) {
        log.info("{} Inventory reserved orderId={}", SAGA, orderId);
        updateStatus(orderId, OrderStatus.INVENTORY_RESERVED);
    }

    public void handleInventoryFailed(String orderId, String reason) {
        log.warn("{} Inventory reservation failed orderId={} reason={}", SAGA, orderId, reason);
        updateStatus(orderId, OrderStatus.INVENTORY_FAILED);
    }

    public void handlePaymentCompleted(String orderId) {
        log.info("{} Payment completed orderId={}", SAGA, orderId);
        updateStatus(orderId, OrderStatus.PAYMENT_COMPLETED);
        producer.publishOrderCompleted(new OrderCompletedEvent(orderId));
        log.info("{} Published OrderCompletedEvent orderId={}", SAGA, orderId);
    }

    public void handlePaymentFailed(String orderId, String reason) {
        log.warn("{} Payment failed orderId={} reason={}", SAGA, orderId, reason);
        updateStatus(orderId, OrderStatus.PAYMENT_FAILED);

        // SAGA compensating transaction: release the reserved inventory
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        producer.publishReleaseInventory(
                new ReleaseInventoryEvent(orderId, order.getProductId(), order.getQuantity())
        );
        log.info("{} Published ReleaseInventoryEvent orderId={} productId={} qty={}",
                SAGA, orderId, order.getProductId(), order.getQuantity());
    }

    private void updateStatus(String orderId, OrderStatus status) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        orderRepository.save(order);
        log.info("{} Status transition orderId={} {} -> {}", SAGA, orderId, previousStatus, status);
    }

    private void validateCreateOrderRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new ValidationException("Request body is required");
        }
        if (request.productId() == null || request.productId().isBlank()) {
            throw new ValidationException("productId is required");
        }
        if (request.userId() == null || request.userId().isBlank()) {
            throw new ValidationException("userId is required");
        }
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new ValidationException("quantity must be greater than 0");
        }
        if (request.amount() == null || request.amount() <= 0) {
            throw new ValidationException("amount must be greater than 0");
        }
    }
}
