# Notification Service (RapidCart)

## Responsibilities
- Listens for payment and order events
- Sends mock notifications (email/SMS/push simulation)

## Consumes Events:
- PaymentCompletedEvent
- PaymentFailedEvent
- OrderCompletedEvent

## API:
GET /notification/health
