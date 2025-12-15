import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Renders a React email component to an HTML string
 * 
 * @param component - React component to render
 * @returns HTML string suitable for email clients
 */
export function renderEmailToHTML(component: React.ReactElement): string {
  const html = renderToStaticMarkup(component);
  
  // Add DOCTYPE for better email client compatibility
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n${html}`;
}

/**
 * Order confirmation data interface
 */
interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    finish?: string;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: string;
}

/**
 * Sends an order confirmation email using Resend
 * 
 * @param orderData - Order details to include in the email
 * @returns Promise with the result of the email send operation
 */
export async function sendOrderConfirmation(
  orderData: OrderConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yakiwood.lt';

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured in environment variables');
    }

    // Dynamically import the email component to avoid bundling issues
    const { default: OrderConfirmationEmail } = await import('./OrderConfirmation');
    
    // Render the email component to HTML
    const emailHtml = renderEmailToHTML(
      React.createElement(OrderConfirmationEmail, orderData)
    );

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: orderData.customerEmail,
        subject: `Užsakymo patvirtinimas #${orderData.orderNumber} - Yakiwood`,
        html: emailHtml,
        // Optional: Add text version for better deliverability
        text: `
Ačiū už jūsų užsakymą!

Sveiki, ${orderData.customerName}!

Jūsų užsakymas patvirtintas ir pradėtas ruošti.

Užsakymo numeris: #${orderData.orderNumber}
Užsakymo data: ${orderData.orderDate}
${orderData.estimatedDelivery ? `Numatoma pristatymo data: ${orderData.estimatedDelivery}` : ''}

Iš viso: €${orderData.total.toFixed(2)}

Pristatymo adresas:
${orderData.shippingAddress.street}
${orderData.shippingAddress.postalCode} ${orderData.shippingAddress.city}
${orderData.shippingAddress.country}

Turite klausimų? Susisiekite su mumis:
El. paštas: info@yakiwood.lt
Telefonas: +370 XXX XXXXX

--
Yakiwood
https://yakiwood.lt
        `.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to send email: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * const result = await sendOrderConfirmation({
 *   orderNumber: 'ORD-2025-001',
 *   customerName: 'Jonas Jonaitis',
 *   customerEmail: 'jonas@example.com',
 *   orderDate: '2025-12-15',
 *   items: [
 *     {
 *       name: 'Lentos medienos',
 *       quantity: 2,
 *       price: 89.00,
 *       color: 'Juoda',
 *       finish: 'Matinė',
 *       image: 'https://example.com/image.jpg'
 *     }
 *   ],
 *   subtotal: 178.00,
 *   shipping: 15.00,
 *   total: 193.00,
 *   shippingAddress: {
 *     street: 'Gedimino pr. 1',
 *     city: 'Vilnius',
 *     postalCode: '01103',
 *     country: 'Lietuva'
 *   },
 *   estimatedDelivery: '2025-12-20'
 * });
 * 
 * if (result.success) {
 *   console.log('Email sent successfully:', result.messageId);
 * } else {
 *   console.error('Failed to send email:', result.error);
 * }
 * ```
 */
