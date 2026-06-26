package com.rapidcart.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "orders")
public class OrderEntity {
    @Id
    private String id;
    private String userId;
    private String productId;
    private int quantity;
    private double amount;
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
}
