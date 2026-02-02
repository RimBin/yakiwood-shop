/**
 * Email Templates for E-commerce
 * Admin-friendly templates with Yakiwood brand styling
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'transactional' | 'marketing' | 'customer-service';
  subject: (vars: Record<string, string>) => string;
  html: (vars: Record<string, any>) => string;
}

// Brand colors from Yakiwood design system
const BRAND = {
  black: '#161616',
  white: '#FFFFFF',
  grey: '#E1E1E1',
  lightGrey: '#BBBBBB',
  darkGrey: '#535353',
  bgGrey: '#EAEAEA',
};

// Base email wrapper with Yakiwood styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yakiwood</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bgGrey}; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgGrey};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.white}; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND.black};">
              <h1 style="margin: 0; color: ${BRAND.white}; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Yakiwood</h1>
              <p style="margin: 5px 0 0; color: ${BRAND.grey}; font-size: 14px;">Natural Wood Beauty</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: ${BRAND.bgGrey}; border-top: 1px solid ${BRAND.grey};">
              <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
                <strong>Contact Us</strong>
              </p>
              <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; text-align: center; line-height: 1.6;">
                Email: <a href="mailto:shop@yakiwood.co.uk" style="color: ${BRAND.black}; text-decoration: none;">shop@yakiwood.co.uk</a><br>
                Phone: +370 675 64733<br>
                <a href="https://shop.yakiwood.co.uk" style="color: ${BRAND.black}; text-decoration: none;">shop.yakiwood.co.uk</a>
              </p>
              <p style="margin: 20px 0 0; color: ${BRAND.lightGrey}; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Yakiwood. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Button component
const button = (text: string, url: string, primary = true) => `
<table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
  <tr>
    <td style="border-radius: 100px; background-color: ${primary ? BRAND.black : BRAND.grey};">
      <a href="${url}" style="display: inline-block; padding: 16px 32px; color: ${primary ? BRAND.white : BRAND.black}; text-decoration: none; font-size: 16px; font-weight: 500; letter-spacing: -0.3px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // 1. ORDER CONFIRMATION
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Sent after successful payment',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Order Confirmation #${vars.orderNumber}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Thank you for your order!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Your order <strong>#${vars.orderNumber}</strong> has been successfully paid and sent to production.
      </p>
      
      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Order Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Order No.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">#${vars.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Date:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.orderDate}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Total:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€${vars.totalAmount}</td>
          </tr>
        </table>
      </div>

      ${vars.items ? `
        <h3 style="margin: 25px 0 15px; color: ${BRAND.black}; font-size: 18px; font-weight: 500;">Ordered Products</h3>
        ${vars.items.map((item: any) => `
          <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
            <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">${item.name}</p>
            <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">
              Quantity: ${item.quantity} × €${item.price}
            </p>
          </div>
        `).join('')}
      ` : ''}

      ${button('View Order', `https://yakiwood.lt/account/orders/${vars.orderNumber}`)}

      <p style="margin: 30px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        You will find the invoice in the attached files. We will inform you separately about shipping.
      </p>
    `),
  },

  // 2. SHIPPING NOTIFICATION
  {
    id: 'shipping-notification',
    name: 'Shipping Notification',
    description: 'Sent when order is shipped',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Your Order #${vars.orderNumber} Has Shipped!`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your order is on the way!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Order <strong>#${vars.orderNumber}</strong> has been shipped via ${vars.carrier}.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Tracking Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Tracking No.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.trackingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Carrier:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.carrier}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Estimated Delivery:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.estimatedDelivery}</td>
          </tr>
        </table>
      </div>

      ${button('Track Shipment', vars.trackingUrl)}
    `),
  },

  // 3. ABANDONED CART
  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart',
    description: 'Reminder for incomplete purchases',
    category: 'marketing',
    subject: () => 'Yakiwood - You left items in your cart 🌲',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your cart is waiting!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We noticed you left some items in your cart. Come back and complete your order – the products are still waiting!
      </p>

      ${vars.items ? `
        <div style="margin: 25px 0;">
          ${vars.items.map((item: any) => `
            <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
              <div>
                <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">${item.name}</p>
                <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">€${item.price}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${vars.discountCode ? `
        <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
          <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
            🎁 Special offer just for you!
          </p>
          <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
            Use code and get ${vars.discountPercent}% off:
          </p>
          <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
            ${vars.discountCode}
          </p>
        </div>
      ` : ''}

      ${button('Return to Cart', 'https://yakiwood.lt/cart')}
    `),
  },

  // 4. BACK IN STOCK
  {
    id: 'back-in-stock',
    name: 'Back in Stock',
    description: 'Notify when product is available',
    category: 'marketing',
    subject: (vars) => `Yakiwood - ${vars.productName} Back in Stock! ✨`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Good news!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        The awaited product <strong>${vars.productName}</strong> is now available in our warehouse.
      </p>

      ${vars.productImage ? `
        <div style="text-align: center; margin: 25px 0;">
          <img src="${vars.productImage}" alt="${vars.productName}" style="max-width: 100%; height: auto; border-radius: 12px;" />
        </div>
      ` : ''}

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Product:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.productName}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Price:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€${vars.price}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        ⚠️ Limited quantity – hurry before it sells out again!
      </p>

      ${button('View Product', vars.productUrl)}
    `),
  },

  // 5. NEWSLETTER
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Monthly updates and news',
    category: 'marketing',
    subject: (vars) => `Yakiwood News - ${vars.month}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">${vars.title}</h2>
      
      ${vars.content}

      ${vars.featuredProducts ? `
        <h3 style="margin: 30px 0 20px; color: ${BRAND.black}; font-size: 20px; font-weight: 500;">This Month's Products</h3>
        <table width="100%" cellpadding="10" cellspacing="0">
          <tr>
            ${vars.featuredProducts.slice(0, 2).map((product: any) => `
              <td width="50%" style="vertical-align: top;">
                <div style="border: 1px solid ${BRAND.grey}; border-radius: 12px; padding: 15px; text-align: center;">
                  ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                  <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">${product.name}</p>
                  <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 13px;">€${product.price}</p>
                  <a href="${product.url}" style="color: ${BRAND.black}; text-decoration: underline; font-size: 13px;">Learn More →</a>
                </div>
              </td>
            `).join('')}
          </tr>
        </table>
      ` : ''}

      ${button('Visit Website', 'https://yakiwood.lt')}

      <p style="margin: 30px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; text-align: center;">
        Don't want to receive these emails? <a href="${vars.unsubscribeUrl}" style="color: ${BRAND.darkGrey}; text-decoration: underline;">Unsubscribe</a>
      </p>
    `),
  },

  // 6. PASSWORD RESET
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Password reset link',
    category: 'transactional',
    subject: () => 'Yakiwood - Password Reset',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Password Reset</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We received a request to reset your account password.
      </p>

      ${button('Reset Password', vars.resetUrl)}

      <div style="background-color: #FFF3CD; padding: 15px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #FFB020;">
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          ⚠️ This link will expire in <strong>${vars.expiryHours} hours</strong>. If you didn't request a password reset, simply ignore this email.
        </p>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; line-height: 1.6;">
        If the button doesn't work, copy this link into your browser:<br>
        <span style="color: ${BRAND.darkGrey}; word-break: break-all;">${vars.resetUrl}</span>
      </p>
    `),
  },

  // 7. REVIEW REQUEST
  {
    id: 'review-request',
    name: 'Review Request',
    description: 'Request product review after delivery',
    category: 'customer-service',
    subject: (vars) => `Yakiwood - How do you like ${vars.productName}?`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your opinion matters! 💭</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We hope you're enjoying your new <strong>${vars.productName}</strong>. Share your experience!
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px;">Rate the product:</p>
        <div style="font-size: 32px; letter-spacing: 5px;">⭐⭐⭐⭐⭐</div>
      </div>

      ${button('Leave a Review', vars.reviewUrl)}

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">🎁 Thank you for your review!</p>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          Leave a review and receive <strong>50 loyalty points</strong> that you can use for your next purchase.
        </p>
      </div>
    `),
  },

  // 8. DELIVERY CONFIRMATION
  {
    id: 'delivery-confirmation',
    name: 'Delivery Confirmation',
    description: 'Sent when order is delivered',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Order #${vars.orderNumber} Delivered!`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your order has been delivered! 🎉</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Order <strong>#${vars.orderNumber}</strong> was successfully delivered on ${vars.deliveryDate}.
      </p>

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Questions?</h3>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
          If you have any questions about the products or delivery, feel free to contact us.
        </p>
      </div>

      <p style="margin: 25px 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        <strong>Return Policy:</strong> You can return items within 14 days of receipt.
      </p>

      ${button('View Order', `https://yakiwood.lt/account/orders/${vars.orderNumber}`)}
    `),
  },

  // 9. WELCOME EMAIL
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent after account creation',
    category: 'transactional',
    subject: () => 'Welcome to Yakiwood! 🌲',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Welcome to Yakiwood!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Hello, <strong>${vars.name}</strong>! We're excited to have you join our community.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">What can you find with us?</h3>
        <ul style="margin: 0; padding-left: 20px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.8;">
          <li>Authentic Shou Sugi Ban boards</li>
          <li>Natural wood finishes</li>
          <li>Customized solutions</li>
          <li>Professional consultants</li>
        </ul>
      </div>

      ${vars.welcomeDiscount ? `
        <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
          <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
            🎁 Welcome gift!
          </p>
          <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
            First purchase discount ${vars.welcomeDiscount}%:
          </p>
          <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
            ${vars.welcomeCode}
          </p>
        </div>
      ` : ''}

      ${button('Start Shopping', 'https://yakiwood.lt/products')}
    `),
  },

  // 10. REFUND CONFIRMATION
  {
    id: 'refund-confirmation',
    name: 'Refund Confirmation',
    description: 'Sent when refund is processed',
    category: 'customer-service',
    subject: (vars) => `Yakiwood - Refund Processed #${vars.orderNumber}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Refund Processed</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Your refund for order <strong>#${vars.orderNumber}</strong> has been successfully processed.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Refund Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Amount:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€${vars.refundAmount}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Method:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.refundMethod}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Processing Time:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.processingTime}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        The funds will be returned to your account within ${vars.processingTime}. We apologize for any inconvenience.
      </p>
    `),
  },
];

/**
 * Get template by ID
 */
export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getEmailTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get sample data for template preview
 */
export function getSampleData(templateId: string): Record<string, any> {
  const samples: Record<string, any> = {
    'order-confirmation': {
      orderNumber: 'YW-2025-001',
      orderDate: '2025-12-30',
      totalAmount: '289.99',
      items: [
        { name: 'Shou Sugi Ban Facade Board', quantity: 10, price: 25.99 },
        { name: 'Premium Terrace Board', quantity: 5, price: 32.00 },
      ],
    },
    'shipping-notification': {
      orderNumber: 'YW-2025-001',
      carrier: 'DPD',
      trackingNumber: 'DPD123456789LT',
      trackingUrl: 'https://dpd.lt/tracking/DPD123456789LT',
      estimatedDelivery: '2025-01-05',
    },
    'abandoned-cart': {
      items: [
        { name: 'Shou Sugi Ban Facade Board', price: 25.99 },
        { name: 'Premium Terrace Board', price: 32.00 },
      ],
      discountCode: 'COMEBACK10',
      discountPercent: 10,
    },
    'back-in-stock': {
      productName: 'Shou Sugi Ban Premium Black',
      price: '29.99',
      productUrl: 'https://yakiwood.lt/products/shou-sugi-ban-premium',
      productImage: '',
    },
    'newsletter': {
      title: 'January News and New Products',
      month: 'January 2025',
      content: '<p style="margin: 0 0 15px; color: #535353; font-size: 15px; line-height: 1.6;">Hello! This month we introduce a new Shou Sugi Ban color palette and special winter offers.</p>',
      featuredProducts: [
        { name: 'Premium Black', price: '29.99', url: 'https://yakiwood.lt/products/premium-black', image: '' },
        { name: 'Natural Brown', price: '27.99', url: 'https://yakiwood.lt/products/natural-brown', image: '' },
      ],
      unsubscribeUrl: 'https://yakiwood.lt/newsletter/unsubscribe',
    },
    'password-reset': {
      resetUrl: 'https://yakiwood.lt/auth/reset-password?token=abc123def456',
      expiryHours: '24',
    },
    'review-request': {
      productName: 'Shou Sugi Ban Premium Black',
      reviewUrl: 'https://yakiwood.lt/products/shou-sugi-ban-premium/review',
    },
    'delivery-confirmation': {
      orderNumber: 'YW-2025-001',
      deliveryDate: '2025-01-03',
    },
    'welcome': {
      name: 'John',
      welcomeDiscount: '10',
      welcomeCode: 'WELCOME10',
    },
    'refund-confirmation': {
      orderNumber: 'YW-2025-001',
      refundAmount: '289.99',
      refundMethod: 'Credit Card',
      processingTime: '5-7 business days',
    },
  };
  return samples[templateId] || {};
}
