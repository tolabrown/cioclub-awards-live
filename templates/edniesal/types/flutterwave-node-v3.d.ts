declare module 'flutterwave-node-v3' {
  interface FlutterwaveOptions {
    tx_ref: string;
    amount: number;
    currency: string;
    redirect_url: string;
    customer: {
      email: string;
      phonenumber?: string;
      name: string;
    };
    customizations?: {
      title?: string;
      description?: string;
      logo?: string;
    };
    meta?: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface FlutterwaveResponse {
    status: string;
    message?: string;
    data?: {
      id?: string | number;
      link?: string;
      status?: string;
      tx_ref?: string;
      amount?: number;
      currency?: string;
      [key: string]: unknown;
    };
  }

  class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    Payment: {
      initiate(options: FlutterwaveOptions): Promise<FlutterwaveResponse>;
    };
    Transaction: {
      verify(options: { id: string | number }): Promise<FlutterwaveResponse>;
    };
  }

  export = Flutterwave;
}
