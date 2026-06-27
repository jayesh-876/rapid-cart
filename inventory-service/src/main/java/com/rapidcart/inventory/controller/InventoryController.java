package com.rapidcart.inventory.controller;

import com.rapidcart.inventory.dto.AddStockRequest;
import com.rapidcart.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}
