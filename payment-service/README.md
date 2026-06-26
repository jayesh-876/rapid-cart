# Payment Service (RapidCart)

## Responsibilities
- Listen to InventoryReservedEvent
- Process mock payment
- Publish PaymentCompletedEvent or PaymentFailedEvent

## Events
Consumes:
- InventoryReservedEvent

Produces:
- PaymentCompletedEvent
- PaymentFailedEvent

## API
### Health Check
GET /payment/health
