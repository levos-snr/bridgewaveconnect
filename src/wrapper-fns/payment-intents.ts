import crypto from 'node:crypto';
import {stkPushRequest} from './stk-push';
import {
  STKPushSuccessfulCallbackBody,
  STKPushErrorCallbackBody,
  TransactionType
} from '../types/types';

export type PaymentIntentStatus =
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export interface PaymentIntent {
  id: string;
  amount: number;
  phone: string;
  accountReference: string;
  description: string;
  status: PaymentIntentStatus;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string | null;
  transactionDate?: string | null;
  rawCallback?: unknown;
  createdAt: string;
  updatedAt: string;
}

const intentsById = new Map<string, PaymentIntent>();
const intentsByCheckoutId = new Map<string, string>();
const idempotencyIndex = new Map<string, string>();

export type CreatePaymentIntentParams = {
  amount: number | string;
  phone: string;
  accountReference: string;
  description: string;
  callbackURL: string;
  idempotencyKey?: string;
  transactionTypeOverride?: TransactionType; // optional override if needed
};

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntent> {
  const {
    amount,
    phone,
    accountReference,
    description,
    callbackURL,
    idempotencyKey
  } = params;

  if (idempotencyKey && idempotencyIndex.has(idempotencyKey)) {
    const existingId = idempotencyIndex.get(idempotencyKey)!;
    return intentsById.get(existingId)!;
  }

  const stkRes = await stkPushRequest({
    phoneNumber: phone,
    amount: String(amount),
    callbackURL,
    transactionDesc: description,
    accountReference
  });

  const nowIso = new Date().toISOString();
  const intent: PaymentIntent = {
    id: crypto.randomUUID(),
    amount: typeof amount === 'string' ? Number(amount) : amount,
    phone,
    accountReference,
    description,
    status: 'requires_action',
    checkoutRequestId: stkRes.CheckoutRequestID,
    merchantRequestId: stkRes.MerchantRequestID,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  intentsById.set(intent.id, intent);
  if (intent.checkoutRequestId) {
    intentsByCheckoutId.set(intent.checkoutRequestId, intent.id);
  }
  if (idempotencyKey) {
    idempotencyIndex.set(idempotencyKey, intent.id);
  }

  return intent;
}

export function getPaymentIntent(id: string): PaymentIntent | undefined {
  return intentsById.get(id);
}

export function handleStkCallback(
  body: STKPushSuccessfulCallbackBody | STKPushErrorCallbackBody
): PaymentIntent | null {
  const checkoutRequestId = (body as any)?.Body?.stkCallback
    ?.CheckoutRequestID as string | undefined;
  if (!checkoutRequestId) return null;

  const intentId = intentsByCheckoutId.get(checkoutRequestId);
  if (!intentId) return null;

  const intent = intentsById.get(intentId)!;
  const nowIso = new Date().toISOString();

  const resultCode = (body as any)?.Body?.stkCallback?.ResultCode as
    | number
    | undefined;
  const resultDesc = (body as any)?.Body?.stkCallback?.ResultDesc as
    | string
    | undefined;

  if (typeof resultCode === 'number') {
    if (resultCode === 0) {
      const items = ((body as any)?.Body?.stkCallback?.CallbackMetadata?.Item ??
        []) as any[];
      const findVal = (k: string) =>
        items.find(
          (it: any) => it && Object.prototype.hasOwnProperty.call(it, k)
        )?.[k];

      intent.status = 'succeeded';
      intent.mpesaReceiptNumber = findVal('MpesaReceiptNumber') ?? null;
      intent.transactionDate = findVal('TransactionDate') ?? null;
      intent.updatedAt = nowIso;
      intent.rawCallback = body;
    } else {
      intent.status = 'failed';
      intent.updatedAt = nowIso;
      intent.rawCallback = body;
      if (resultDesc)
        intent.description = `${intent.description} | ${resultCode}: ${resultDesc}`;
    }
  } else {
    intent.status = 'failed';
    intent.updatedAt = nowIso;
    intent.rawCallback = body;
  }

  intentsById.set(intent.id, intent);
  return intent;
}
