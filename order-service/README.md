# Order Service (RapidCart)

## Responsibilities
- Accept order creation request
- Publish OrderCreatedEvent
- Listen to Inventory + Payment events
- Update order state in PostgreSQL
- Publish OrderCompletedEvent

## Tech Stack
- Spring Boot 3.2
- Kafka
- PostgreSQL
- JPA / Hibernate
- Java 21

## API
### POST /orders
```json
{
  "productId": "P1",
  "userId": "U123",
  "quantity": 1,
  "amount": 300.00
}
```
