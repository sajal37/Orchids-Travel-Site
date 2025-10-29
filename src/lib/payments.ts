import { logger, metrics } from "@/lib/monitoring";

// PCI Compliance Service for handling payment processing securely
export class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}
  
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }
  
  // Validate payment data according to PCI DSS standards
  validatePaymentData(paymentData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for required fields
    if (!paymentData.cardNumber) {
      errors.push("Card number is required");
    }
    
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      errors.push("Card expiration date is required");
    }
    
    if (!paymentData.cvc) {
      errors.push("Card CVC is required");
    }
    
    // Validate card number format (basic Luhn algorithm check would be implemented in production)
    if (paymentData.cardNumber && !this.isValidCardNumber(paymentData.cardNumber)) {
      errors.push("Invalid card number format");
    }
    
    // Validate expiration date
    if (paymentData.expiryMonth && paymentData.expiryYear) {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      const expiryYear = parseInt(paymentData.expiryYear, 10);
      const expiryMonth = parseInt(paymentData.expiryMonth, 10);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        errors.push("Card has expired");
      }
    }
    
    // Validate CVC format
    if (paymentData.cvc && !/^\d{3,4}$/.test(paymentData.cvc)) {
      errors.push("Invalid CVC format");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Basic card number validation (Luhn algorithm)
  private isValidCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Check if all digits
    if (!/^\d+$/.test(cleaned)) {
      return false;
    }
    
    // Basic length check
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }
    
    // Luhn algorithm implementation
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost side
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  // Mask sensitive payment data for logging
  maskPaymentData(paymentData: any): any {
    if (!paymentData) return paymentData;
    
    const masked = { ...paymentData };
    
    if (masked.cardNumber) {
      // Mask all but last 4 digits
      const cardStr = masked.cardNumber.toString();
      masked.cardNumber = "****-****-****-" + cardStr.slice(-4);
    }
    
    if (masked.cvc) {
      masked.cvc = "***";
    }
    
    if (masked.cardholderName) {
      // Only show first initial and last name
      const nameParts = masked.cardholderName.split(" ");
      if (nameParts.length > 1) {
        masked.cardholderName = nameParts[0][0] + ". " + nameParts[nameParts.length - 1];
      }
    }
    
    return masked;
  }
  
  // Process payment with PCI compliance
  async processPayment(paymentData: any, userId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Log masked payment data for audit trail
      const maskedData = this.maskPaymentData(paymentData);
      logger.info("Payment processing initiated", {
        userId,
        paymentData: maskedData
      });
      
      // Validate payment data
      const validation = this.validatePaymentData(paymentData);
      if (!validation.valid) {
        logger.warn("Payment validation failed", {
          userId,
          errors: validation.errors
        });
        
        metrics.increment("payments.validation.failed");
        return {
          success: false,
          error: "Invalid payment data: " + validation.errors.join(", ")
        };
      }
      
      // In a real implementation, this would integrate with a PCI-compliant payment processor
      // like Stripe, PayPal, etc. that handles the actual card data processing
      
      // Simulate payment processing
      const transactionId = "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      
      // Log successful payment
      logger.info("Payment processed successfully", {
        userId,
        transactionId,
        amount: paymentData.amount
      });
      
      metrics.increment("payments.processed");
      metrics.increment("payments.amount", paymentData.amount || 0);
      
      return {
        success: true,
        transactionId
      };
    } catch (error) {
      logger.error("Payment processing failed", error as Error, {
        userId
      });
      
      metrics.increment("payments.failed");
      return {
        success: false,
        error: "Payment processing failed"
      };
    }
  }
  
  // Refund a transaction
  async refundPayment(transactionId: string, userId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      logger.info("Payment refund initiated", {
        userId,
        transactionId,
        amount
      });
      
      // In a real implementation, this would call the payment processor's refund API
      
      // Simulate refund processing
      const refundId = "ref_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      
      logger.info("Payment refunded successfully", {
        userId,
        transactionId,
        refundId,
        amount
      });
      
      metrics.increment("payments.refunded");
      
      return {
        success: true,
        refundId
      };
    } catch (error) {
      logger.error("Payment refund failed", error as Error, {
        userId,
        transactionId
      });
      
      metrics.increment("payments.refunds.failed");
      return {
        success: false,
        error: "Payment refund failed"
      };
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();

// Middleware for securing payment endpoints
export async function withPaymentSecurity(handler: Function) {
  return async function (request: Request, ...args: any[]) {
    try {
      // Add security headers for payment processing
      const headers = new Headers(request.headers);
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      // Create a new request with security headers
      const securedRequest = new Request(request, { headers });
      
      // Call the handler with the secured request
      return await handler(securedRequest, ...args);
    } catch (error) {
      logger.error("Payment security middleware error", error as Error);
      throw error;
    }
  };
}