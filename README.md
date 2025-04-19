# MPESA Callback Service

A Node.js API service for handling MPESA payment callbacks and STK Push integration.

## Features

- Process MPESA payment requests with STK Push
- Handle MPESA callbacks
- Store transaction data using PostgreSQL and Prisma ORM

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- MPESA Daraja API credentials

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
4. Update the `.env` file with your database credentials and MPESA API credentials:
   ```
   # Database
   DATABASE_URL=your_database_url
   
   # Server
   PORT=3000
   
   # MPESA
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_PASSKEY=your_passkey
   MPESA_SHORTCODE=your_shortcode
   MPESA_CALLBACK_URL=https://your-domain.com/callback
   MPESA_ENV=sandbox # or production
   ```
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

### Initiate MPESA Payment (STK Push)

```
POST /initiate
```

Request body:
```json
{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "productId": "PROD12345",
  "accountReference": "Optional Reference",
  "transactionDesc": "Optional Description"
}
```

Response:
```json
{
  "success": true,
  "message": "Success. Request accepted for processing",
  "transaction": {
    "id": "transaction_id",
    "checkoutRequestId": "ws_CO_191220191020363925",
    "merchantRequestId": "29115-34620561-1",
    "status": "PENDING",
    "productId": "PROD12345",
    "phoneNumber": "254712345678",
    "amount": 1000,
    "createdAt": "2023-01-01T12:00:00.000Z"
  },
  "stkPushResponse": {
    "MerchantRequestID": "29115-34620561-1",
    "CheckoutRequestID": "ws_CO_191220191020363925",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  }
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