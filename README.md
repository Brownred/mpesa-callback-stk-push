# MPESA Callback Service

A Node.js API service for handling MPESA payment callbacks.

## Features

- Process MPESA payment requests
- Handle MPESA callbacks
- Store transaction data using PostgreSQL and Prisma ORM

## Prerequisites

- Node.js 18+ 
- PostgreSQL database

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your database credentials and other configurations
5. Generate Prisma client:
   ```
   npm run build
   ```
6. Run migrations (if needed):
   ```
   npx prisma migrate deploy
   ```

## Development

To run the service in development mode:

```
npm run dev
```

## Production Deployment

To deploy to production:

1. Make sure your environment variables are properly set
2. Build the application:
   ```
   npm run build
   ```
3. Start the service:
   ```
   npm start
   ```

## API Endpoints

### Initiate Transaction

```
POST /initiate
```

Request body:
```json
{
  "checkoutRequestId": "ws_CO_191220191020363925",
  "merchantRequestId": "29115-34620561-1",
  "productId": "PROD12345",
  "phoneNumber": "254712345678",
  "amount": 1000
}
```

### MPESA Callback

```
POST /callback
```

Request body (success):
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1000
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "NLJ7RT61SV"
          },
          {
            "Name": "TransactionDate",
            "Value": 20191219102115
          },
          {
            "Name": "PhoneNumber",
            "Value": 254712345678
          }
        ]
      }
    }
  }
}
```

## License

ISC 