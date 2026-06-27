package com.rapidcart.order.controller;

import com.rapidcart.order.dto.CreateOrderRequest;
import com.rapidcart.order.dto.OrderResponse;
import com.rapidcart.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
@Tag(name = "Orders", description = "Order Management APIs")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Create Order", description = "Creates a new order and starts Saga workflow")
    @PostMapping
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @Operation(summary = "Get Order By Id")
    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(@PathVariable("orderId") String orderId) {
        return orderService.getOrder(orderId);
    }

    @Operation(summary = "Get All Orders")
    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }
}
