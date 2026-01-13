declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: any) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
      color?: string;
    };
  }

  interface RazorpayCheckout {
    open(options: RazorpayOptions): Promise<any>;
  }

  const RazorpayCheckout: RazorpayCheckout;
  export default RazorpayCheckout;
}