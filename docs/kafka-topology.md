# Kafka Topics

```mermaid
flowchart LR

OrderService

InventoryService

PaymentService

NotificationService

OrderService -->|order-created| Kafka[(Kafka)]

Kafka --> InventoryService

InventoryService -->|inventory-reserved| Kafka

Kafka --> PaymentService

PaymentService -->|payment-completed| Kafka

Kafka --> OrderService

OrderService -->|order-completed| Kafka

Kafka --> NotificationService
```