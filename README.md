# BridgeWaveConnect Documentation

## Overview

BridgeWaveConnect is a comprehensive TypeScript/JavaScript library designed to seamlessly integrate with the M-Pesa Daraja API. It provides robust connectivity solutions for mobile money transactions, empowering developers with streamlined access to M-Pesa's services.

## Table of Contents

1. [Installation](#installation)
2. [Environment Setup](#environment-setup)
3. [Core Features](#core-features)
4. [API Reference](#api-reference)
5. [React Components](#react-components)
6. [Next.js Components](#nextjs-components)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [Best Practices](#best-practices)

## Installation

Install BridgeWaveConnect using your preferred package manager:

```bash
# npm
npm install bridgewaveconnect

# yarn
yarn add bridgewaveconnect

# pnpm
pnpm install bridgewaveconnect
```

### Peer Dependencies

BridgeWaveConnect requires React 18 or 19 as a peer dependency:

```bash
npm install react@^18 || ^19 react-dom@^18 || ^19
```

## Environment Setup

Create a `.env` file in your project root with the following variables:

```env
NODE_ENV='development' # Set to "production" for live environment
MPESA_CONSUMER_KEY='your_consumer_key_here'
MPESA_CONSUMER_SECRET='your_consumer_secret_here'
MPESA_BUSINESS_SHORT_CODE='your_business_short_code'
MPESA_TRANSACTION_TYPE='CustomerPayBillOnline' # or 'CustomerBuyGoodsOnline'
MPESA_API_PASS_KEY='your_pass_key_here'
```

### Environment Variables Details

| Variable                    | Description                        | Sandbox Value                                                      |
| --------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `NODE_ENV`                  | Environment mode                   | `development`                                                      |
| `MPESA_CONSUMER_KEY`        | Consumer Key from Daraja portal    | Your sandbox key                                                   |
| `MPESA_CONSUMER_SECRET`     | Consumer Secret from Daraja portal | Your sandbox secret                                                |
| `MPESA_BUSINESS_SHORT_CODE` | Your business shortcode            | `174379`                                                           |
| `MPESA_TRANSACTION_TYPE`    | Transaction type                   | `CustomerPayBillOnline`                                            |
| `MPESA_API_PASS_KEY`        | API passkey for authentication     | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` |

## Core Features

### 1. Authentication & Access Token Management

- Automatic access token generation and caching
- Secure credential handling
- Environment-aware API endpoints

### 2. STK Push (Lipa na M-Pesa Online)

- Initiate payment requests to customers
- Query transaction status
- Handle payment callbacks

### 3. Business to Customer (B2C) Payments

- Send money to individual customers
- Support for salary payments, business payments, and promotions

### 4. Business to Business (B2B) Payments

- Transfer funds between businesses
- Support for buy goods and paybill transactions

### 5. QR Code Generation

- Generate dynamic QR codes for payments
- Support for multiple transaction types

### 6. Account Management

- Check account balance
- Query transaction status
- Reverse transactions

## API Reference

### Authentication

#### `generateAccessToken()`

Generates an OAuth access token for API authentication.

```typescript
import {generateAccessToken} from 'bridgewaveconnect';

const {access_token, expires_in} = await generateAccessToken();
```

**Returns:** `Promise<AccessTokenResponse>`

### STK Push Operations

#### `stkPushRequest(params)`

Initiates an M-Pesa STK Push payment request.

```typescript
import {stkPushRequest} from 'bridgewaveconnect';

const response = await stkPushRequest({
  BusinessShortCode: '174379',
  Amount: '100',
  PhoneNumber: '254712345678',
  CallBackURL: 'https://your-domain.com/callback',
  AccountReference: 'ORDER123',
  TransactionDesc: 'Payment for order'
});
```

**Parameters:** `STKPushRequestParam`

- `BusinessShortCode`: Your M-Pesa business shortcode
- `Amount`: Transaction amount (string)
- `PhoneNumber`: Customer phone number (format: 2547XXXXXXXX)
- `CallBackURL`: URL to receive transaction results
- `AccountReference`: Reference for the transaction (max 12 chars)
- `TransactionDesc`: Transaction description (max 13 chars)

**Returns:** `Promise<STKPushResponse>`

#### `getStateOfALNMOnlinePayment(params)`

Queries the status of an STK Push transaction.

```typescript
import {getStateOfALNMOnlinePayment} from 'bridgewaveconnect';

const status = await getStateOfALNMOnlinePayment({
  BusinessShortCode: '174379',
  CheckoutRequestID: 'ws_CO_DMZ_123212312_2342347678234'
});
```

### QR Code Operations

#### `fetchQrCode(params)`

Generates a scannable QR code for payments.

```typescript
import {fetchQrCode} from 'bridgewaveconnect';

const qrCode = await fetchQrCode({
  MerchantName: 'My Store',
  RefNo: 'INV123',
  Amount: 1000,
  TrxCode: 'BG', // Buy Goods
  CPI: '174379',
  Size: '200'
});
```

**Transaction Types (TrxCode):**

- `BG`: Pay Merchant (Buy Goods)
- `WA`: Withdraw Cash at Agent Till
- `PB`: Paybill or Business number
- `SM`: Send Money (Mobile number)
- `SB`: Send to Business

### B2C Operations

#### `b2cPaymentRequest(params)`

Initiates a Business to Customer payment.

```typescript
import {b2cPaymentRequest} from 'bridgewaveconnect';

const response = await b2cPaymentRequest({
  InitiatorName: 'testapi',
  SecurityCredential: 'encrypted_password',
  CommandID: 'SalaryPayment',
  Amount: 1000,
  PartyA: 174379,
  PartyB: 254712345678,
  Remarks: 'Salary payment',
  QueueTimeOutURL: 'https://your-domain.com/timeout',
  ResultURL: 'https://your-domain.com/result',
  Occasion: 'Salary'
});
```

**Command IDs:**

- `SalaryPayment`: Send to registered/unregistered customers
- `BusinessPayment`: Send to registered customers only
- `PromotionPayment`: Promotional payments to registered customers

### B2B Operations

#### `b2bPaymentRequest(params)`

Initiates a Business to Business payment.

```typescript
import {b2bPaymentRequest} from 'bridgewaveconnect';

const response = await b2bPaymentRequest({
  Initiator: 'testapi',
  SecurityCredential: 'encrypted_password',
  CommandID: 'BusinessPayBill',
  Amount: 1000,
  PartyA: 174379,
  PartyB: 654321,
  Remarks: 'Payment to supplier',
  QueueTimeOutURL: 'https://your-domain.com/timeout',
  ResultURL: 'https://your-domain.com/result',
  Occasion: 'Supplier payment'
});
```

### Account Management

#### `getAccountBalance(params)`

Queries the account balance.

```typescript
import {getAccountBalance} from 'bridgewaveconnect';

const balance = await getAccountBalance({
  Initiator: 'testapi',
  SecurityCredential: 'encrypted_password',
  CommandID: 'AccountBalance',
  PartyA: 174379,
  IdentifierType: '4',
  QueueTimeOutURL: 'https://your-domain.com/timeout',
  ResultURL: 'https://your-domain.com/result',
  Remarks: 'Balance check'
});
```

#### `getTransactionStatus(params)`

Queries the status of a transaction.

```typescript
import {getTransactionStatus} from 'bridgewaveconnect';

const status = await getTransactionStatus({
  Initiator: 'testapi',
  SecurityCredential: 'encrypted_password',
  'Command ID': 'TransactionStatusQuery',
  'Transaction ID': 'LHG31AA5TX',
  OriginatorConversationID: '12345-67890-1',
  PartyA: '174379',
  IdentifierType: '4',
  ResultURL: 'https://your-domain.com/result',
  QueueTimeOutURL: 'https://your-domain.com/timeout',
  Remarks: 'Status check',
  Occasion: 'Transaction status'
});
```

### C2B Operations

#### `registerC2BUrl(params)`

Registers validation and confirmation URLs for C2B transactions.

```typescript
import {registerC2BUrl} from 'bridgewaveconnect';

const response = await registerC2BUrl({
  ValidationURL: 'https://your-domain.com/validation',
  ConfirmationURL: 'https://your-domain.com/confirmation',
  ResponseType: 'Completed' // or 'Cancelled'
});
```

## React Components

### QrCodeDisplay

A React component for displaying M-Pesa QR codes.

```typescript
import { QrCodeDisplay } from 'bridgewaveconnect/react';

function PaymentComponent() {
  const [qrString, setQrString] = useState('');

  return (
    <QrCodeDisplay
      qrString={qrString}
      className="w-32 h-32"
    />
  );
}
```

**Props:**

- `qrString`: Base64 encoded QR code string
- `className`: Optional CSS classes for styling

## Next.js Components

### QrCodeDisplay (Server Component)

A Next.js server component that automatically generates and displays QR codes.

```typescript
import { QrCodeDisplay } from 'bridgewaveconnect/next';

async function PaymentPage() {
  return (
    <QrCodeDisplay
      scannableQRParams={{
        MerchantName: 'My Store',
        RefNo: 'INV123',
        Amount: 1000,
        TrxCode: 'BG',
        Size: '200'
      }}
      className="w-32 h-32"
    />
  );
}
```

**Props:**

- `scannableQRParams`: QR code parameters (excluding CPI)
- `className`: Optional CSS classes for styling

## Error Handling

BridgeWaveConnect provides comprehensive error handling with detailed error messages:

```typescript
try {
  const response = await stkPushRequest(params);
  console.log('Success:', response);
} catch (error) {
  console.error('Payment failed:', error.message);
  // Handle specific error scenarios
}
```

### Common Error Scenarios

1. **Invalid Credentials**: Check your consumer key and secret
2. **Insufficient Funds**: Account balance is too low
3. **Invalid Phone Number**: Ensure phone format is 2547XXXXXXXX
4. **Network Issues**: Check internet connectivity
5. **API Downtime**: M-Pesa services may be temporarily unavailable

## Examples

### Complete STK Push Flow

```typescript
import {stkPushRequest, getStateOfALNMOnlinePayment} from 'bridgewaveconnect';

async function processPayment(
  phoneNumber: string,
  amount: string,
  orderId: string
) {
  try {
    // Initiate payment
    const initResponse = await stkPushRequest({
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
      Amount: amount,
      PhoneNumber: phoneNumber,
      CallBackURL: 'https://your-domain.com/callback',
      AccountReference: orderId,
      TransactionDesc: 'Payment for order ' + orderId
    });

    console.log('Payment initiated:', initResponse.CheckoutRequestID);

    // Poll for payment status (optional)
    const checkStatus = async () => {
      const status = await getStateOfALNMOnlinePayment({
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
        CheckoutRequestID: initResponse.CheckoutRequestID
      });

      if (status.ResultCode === '0') {
        console.log('Payment successful:', status);
      } else {
        console.log('Payment failed:', status.ResultDesc);
      }
    };

    // Check status after a delay
    setTimeout(checkStatus, 5000);

    return initResponse;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
}
```

### B2C Salary Payment

```typescript
import {b2cPaymentRequest} from 'bridgewaveconnect';

async function processSalaryPayment(employeePhone: string, salary: number) {
  try {
    const response = await b2cPaymentRequest({
      InitiatorName: 'salary_disburser',
      SecurityCredential: getSecurityCredential(),
      CommandID: 'SalaryPayment',
      Amount: salary,
      PartyA: parseInt(process.env.MPESA_BUSINESS_SHORT_CODE!),
      PartyB: parseInt(employeePhone.replace('+', '')),
      Remarks: 'Monthly salary',
      QueueTimeOutURL: 'https://your-domain.com/timeout',
      ResultURL: 'https://your-domain.com/result',
      Occasion: 'Salary payment'
    });

    return response;
  } catch (error) {
    console.error('Salary payment failed:', error);
    throw error;
  }
}
```

### QR Code Payment Integration

```typescript
import {fetchQrCode} from 'bridgewaveconnect';

async function generatePaymentQR(amount: number, reference: string) {
  try {
    const qrResponse = await fetchQrCode({
      MerchantName: 'My Business',
      RefNo: reference,
      Amount: amount,
      TrxCode: 'BG',
      CPI: process.env.MPESA_BUSINESS_SHORT_CODE!,
      Size: '300'
    });

    return qrResponse.QRCode;
  } catch (error) {
    console.error('QR generation failed:', error);
    throw error;
  }
}
```

## Best Practices

### 1. Security

- Never expose credentials in client-side code
- Use environment variables for sensitive data
- Implement proper authentication on callback URLs
- Validate all incoming data

### 2. Error Handling

- Always wrap API calls in try-catch blocks
- Implement retry logic for transient failures
- Log errors for debugging purposes
- Provide user-friendly error messages

### 3. Performance

- Cache access tokens when possible
- Use appropriate timeout values
- Implement proper connection pooling
- Monitor API rate limits

### 4. Callback Handling

- Ensure callback URLs are publicly accessible
- Validate callback authenticity
- Process callbacks quickly to avoid timeouts
- Implement idempotency for duplicate callbacks

### 5. Testing

- Test with sandbox credentials first
- Mock API responses for unit tests
- Test error scenarios thoroughly
- Validate phone number formats

## TypeScript Support

BridgeWaveConnect is built with TypeScript and provides comprehensive type definitions:

```typescript
import type {
  STKPushResponse,
  B2CRequestResponse,
  ScannableQrCodeResponse,
  AccessTokenResponse
} from 'bridgewaveconnect';

// Full type safety for all API responses
const handleResponse = (response: STKPushResponse) => {
  // TypeScript will provide autocomplete and type checking
  console.log(response.CheckoutRequestID);
};
```

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/levos-snr/bridgewaveconnect/issues)
- **Documentation**: [View full documentation](https://github.com/levos-snr/bridgewaveconnect#readme)
- **M-Pesa Daraja Portal**: [Get API credentials](https://developer.safaricom.co.ke/)

## License

BridgeWaveConnect is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
