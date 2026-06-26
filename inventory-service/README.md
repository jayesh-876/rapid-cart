# Inventory Service (RapidCart)

## Responsibilities
- Handle OrderCreatedEvent
- Check stock availability
- Publish InventoryReservedEvent or InventoryFailedEvent
- Provide admin stock API

## API
### Add Stock
POST /inventory/add
```json
{
  "productId": "P1",
  "quantity": 10
}
