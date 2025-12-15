// Inventory Notifications
import { createClient } from '@/lib/supabase/server';
import type { InventoryItem, InventoryAlert } from '@/lib/inventory/types';

interface NotificationRecipient {
  email: string;
  name?: string;
}

export async function notifyLowStock(item: InventoryItem): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', item.product_id)
      .single();
    
    if (!product) {
      console.error('Product not found for low stock notification');
      return;
    }
    
    // Get admin users
    const recipients = await getAdminRecipients();
    
    if (recipients.length === 0) {
      console.warn('No admin recipients found for low stock notification');
      return;
    }
    
    // Send notification (implement email service)
    await sendEmail({
      to: recipients,
      subject: `⚠️ Low Stock Alert: ${product.name}`,
      template: 'low-stock',
      data: {
        productName: product.name,
        productSlug: product.slug,
        sku: item.sku,
        currentQuantity: item.quantity_available,
        reorderPoint: item.reorder_point,
        reorderQuantity: item.reorder_quantity,
        location: item.location,
      },
    });
    
    console.log(`Low stock notification sent for ${item.sku}`);
  } catch (error) {
    console.error('Failed to send low stock notification:', error);
  }
}

export async function notifyOutOfStock(item: InventoryItem): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', item.product_id)
      .single();
    
    if (!product) {
      console.error('Product not found for out of stock notification');
      return;
    }
    
    // Get admin users
    const recipients = await getAdminRecipients();
    
    if (recipients.length === 0) {
      console.warn('No admin recipients found for out of stock notification');
      return;
    }
    
    // Send notification
    await sendEmail({
      to: recipients,
      subject: `🚨 Out of Stock Alert: ${product.name}`,
      template: 'out-of-stock',
      data: {
        productName: product.name,
        productSlug: product.slug,
        sku: item.sku,
        reorderQuantity: item.reorder_quantity,
        location: item.location,
        lastRestocked: item.last_restocked_at,
      },
    });
    
    console.log(`Out of stock notification sent for ${item.sku}`);
  } catch (error) {
    console.error('Failed to send out of stock notification:', error);
  }
}

export async function notifyRestockNeeded(item: InventoryItem): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, slug')
      .eq('id', item.product_id)
      .single();
    
    if (!product) return;
    
    // Get admin users
    const recipients = await getAdminRecipients();
    
    if (recipients.length === 0) return;
    
    // Send notification
    await sendEmail({
      to: recipients,
      subject: `📦 Restock Recommended: ${product.name}`,
      template: 'restock-needed',
      data: {
        productName: product.name,
        sku: item.sku,
        currentQuantity: item.quantity_available,
        reorderPoint: item.reorder_point,
        recommendedQuantity: item.reorder_quantity,
      },
    });
    
    console.log(`Restock notification sent for ${item.sku}`);
  } catch (error) {
    console.error('Failed to send restock notification:', error);
  }
}

export async function notifyInventoryAdjustment(
  item: InventoryItem,
  adjustment: number,
  reason: string
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', item.product_id)
      .single();
    
    if (!product) return;
    
    // Get admin users
    const recipients = await getAdminRecipients();
    
    if (recipients.length === 0) return;
    
    // Send notification
    await sendEmail({
      to: recipients,
      subject: `📊 Inventory Adjustment: ${product.name}`,
      template: 'inventory-adjustment',
      data: {
        productName: product.name,
        sku: item.sku,
        adjustment,
        reason,
        newQuantity: item.quantity_available,
      },
    });
  } catch (error) {
    console.error('Failed to send adjustment notification:', error);
  }
}

async function getAdminRecipients(): Promise<NotificationRecipient[]> {
  try {
    const supabase = await createClient();
    
    const { data: users } = await supabase
      .from('users')
      .select('email, name')
      .eq('role', 'admin');
    
    if (!users) return [];
    
    return users.map(user => ({
      email: user.email,
      name: user.name,
    }));
  } catch (error) {
    console.error('Failed to get admin recipients:', error);
    return [];
  }
}

interface EmailOptions {
  to: NotificationRecipient[];
  subject: string;
  template: string;
  data: Record<string, any>;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Implement email service integration
  // Options:
  // 1. Resend (https://resend.com)
  // 2. SendGrid
  // 3. AWS SES
  // 4. Postmark
  
  console.log('Email would be sent:', {
    to: options.to.map(r => r.email).join(', '),
    subject: options.subject,
    template: options.template,
  });
  
  // Example with Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'inventory@yakiwood.com',
    to: options.to.map(r => r.email),
    subject: options.subject,
    react: EmailTemplates[options.template](options.data),
  });
  */
}

// Export email templates
export const EmailTemplates = {
  'low-stock': (data: any) => `
    <h2>Low Stock Alert</h2>
    <p>The following product is running low on stock:</p>
    <ul>
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>SKU:</strong> ${data.sku}</li>
      <li><strong>Current Quantity:</strong> ${data.currentQuantity}</li>
      <li><strong>Reorder Point:</strong> ${data.reorderPoint}</li>
      <li><strong>Recommended Reorder:</strong> ${data.reorderQuantity} units</li>
      ${data.location ? `<li><strong>Location:</strong> ${data.location}</li>` : ''}
    </ul>
    <p>Please restock this item soon to avoid running out.</p>
  `,
  
  'out-of-stock': (data: any) => `
    <h2>Out of Stock Alert</h2>
    <p><strong>URGENT:</strong> The following product is out of stock:</p>
    <ul>
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>SKU:</strong> ${data.sku}</li>
      <li><strong>Recommended Reorder:</strong> ${data.reorderQuantity} units</li>
      ${data.location ? `<li><strong>Location:</strong> ${data.location}</li>` : ''}
    </ul>
    <p>This product needs immediate restocking.</p>
  `,
  
  'restock-needed': (data: any) => `
    <h2>Restock Recommendation</h2>
    <p>Based on current stock levels, we recommend restocking:</p>
    <ul>
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>SKU:</strong> ${data.sku}</li>
      <li><strong>Current Quantity:</strong> ${data.currentQuantity}</li>
      <li><strong>Recommended Order:</strong> ${data.recommendedQuantity} units</li>
    </ul>
  `,
  
  'inventory-adjustment': (data: any) => `
    <h2>Inventory Adjustment</h2>
    <p>An inventory adjustment has been made:</p>
    <ul>
      <li><strong>Product:</strong> ${data.productName}</li>
      <li><strong>SKU:</strong> ${data.sku}</li>
      <li><strong>Adjustment:</strong> ${data.adjustment > 0 ? '+' : ''}${data.adjustment} units</li>
      <li><strong>Reason:</strong> ${data.reason}</li>
      <li><strong>New Quantity:</strong> ${data.newQuantity}</li>
    </ul>
  `,
};
