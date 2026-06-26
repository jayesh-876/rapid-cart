package com.rapidcart.inventory.repository;

import com.rapidcart.inventory.entity.ItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    Optional<ItemEntity> findByProductId(String productId);
}
