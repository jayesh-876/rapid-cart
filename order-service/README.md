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
- Java 17

## API
### POST /orders
```json
{
  "userId": "U123",
  "amount": 300.00
}
