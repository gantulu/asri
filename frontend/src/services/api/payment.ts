import { edgeFunctionRequest } from "./client";

export type PaymentCredentials = {
  phone: string;
  password: string;
};

export type CreatePaymentInput = PaymentCredentials & {
  paymentAmount: number;
  paymentMethod: string;
  productDetails: string;
  email: string;
  customerVaName: string;
  itemDetails?: unknown[];
  additionalParam?: string;
  merchantUserInfo?: string;
  phoneNumber?: string;
  expiryPeriod?: number;
  customerDetail?: unknown;
  accountLink?: unknown;
  creditCardDetail?: unknown;
};

export type CreatePaymentResponse = {
  orderId: string;
  merchantOrderId: string;
  amount: number;
  status: string;
  reference: string | null;
  paymentUrl: string | null;
  vaNumber: string | null;
  qrString: string | null;
  appUrl: string | null;
};

export function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResponse> {
  return edgeFunctionRequest<CreatePaymentResponse>("duitku", "/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type PaymentMethodsInput = PaymentCredentials & {
  amount: number;
};

export function getPaymentMethods(input: PaymentMethodsInput): Promise<unknown> {
  return edgeFunctionRequest("duitku", "/payment-methods", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type PaymentStatusInput = PaymentCredentials & {
  merchantOrderId: string;
};

export function getPaymentStatus(input: PaymentStatusInput): Promise<unknown> {
  return edgeFunctionRequest("duitku", "/status", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
