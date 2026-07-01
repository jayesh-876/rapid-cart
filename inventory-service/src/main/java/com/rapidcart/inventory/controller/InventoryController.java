package com.rapidcart.inventory.controller;

import com.rapidcart.inventory.dto.AddStockRequest;
import com.rapidcart.inventory.entity.ItemEntity;
import com.rapidcart.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    @PostMapping("/add")
    public String addStock(@Valid @RequestBody AddStockRequest req) {
        service.addStock(req.productId(), req.quantity());
        return "Stock updated";
    }

    @GetMapping("/items")
    public List<ItemEntity> getAllItems() {
        return service.getAllItems();
    }
}
