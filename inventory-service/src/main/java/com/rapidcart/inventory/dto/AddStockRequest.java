package com.rapidcart.inventory.dto;

public record AddStockRequest(
        String productId,
        int quantity
) {}
