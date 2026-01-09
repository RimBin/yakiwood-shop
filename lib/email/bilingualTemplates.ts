/**
 * Bilingual email template defaults (LT + EN)
 *
 * These are the app defaults and also serve as the seed content
 * for CMS-edited templates in Sanity.
 */

export type EmailLocale = 'lt' | 'en'

export interface EmailTemplateDefinition {
  id: string
  name: string
  description: string
  category: 'transactional' | 'marketing' | 'customer-service'
  subject: Record<EmailLocale, string>
  html: Record<EmailLocale, string>
}

// Brand colors from Yakiwood design system
const BRAND = {
  black: '#161616',
  white: '#FFFFFF',
  grey: '#E1E1E1',
  lightGrey: '#BBBBBB',
  darkGrey: '#535353',
  bgGrey: '#EAEAEA',
}

type TemplateVars = Record<string, any>

type TemplateContext = {
  [key: string]: any
  this?: any
}

function getPathValue(path: string, ctx: TemplateContext): unknown {
  const parts = path.split('.')
  let cur: any = ctx
  for (const part of parts) {
    if (cur == null) return ''
    cur = cur[part]
  }
  if (cur == null) return ''
  return cur
}

/**
 * Minimal template renderer:
 * - Variables: {{orderNumber}}
 * - Each blocks: {{#each items}}...{{/each}}
 *   Inside each, you can use {{this.name}} or {{name}}.
 */
export function renderTemplateString(template: string, vars: TemplateVars): string {
  const renderEach = (input: string, ctx: TemplateContext): string => {
    const eachRe = /{{#each\s+([a-zA-Z0-9_.]+)\s*}}([\s\S]*?){{\/each}}/g

    return input.replace(eachRe, (_m, collectionPath: string, inner: string) => {
      const collection = getPathValue(collectionPath, ctx)
      if (!Array.isArray(collection) || collection.length === 0) return ''

      return collection
        .map((item) => {
          const nextCtx: TemplateContext = { ...ctx, this: item }
          if (item && typeof item === 'object') {
            Object.assign(nextCtx, item)
          }
          const renderedInner = renderEach(inner, nextCtx)
          return renderVars(renderedInner, nextCtx)
        })
        .join('')
    })
  }

  const renderVars = (input: string, ctx: TemplateContext): string => {
    const varRe = /{{\s*([a-zA-Z0-9_.]+)\s*}}/g
    return input.replace(varRe, (_m, path: string) => {
      const value = getPathValue(path, ctx)
      return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
    })
  }

  const withEach = renderEach(template, vars)
  return renderVars(withEach, vars)
}

const emailWrapper = (locale: EmailLocale, content: string) => {
  const t = {
    lt: {
      tagline: 'Natūralus medžio grožis',
      contact: 'Kontaktai',
      phone: 'Tel.',
      rights: 'Visos teisės saugomos.',
    },
    en: {
      tagline: 'Natural Wood Beauty',
      contact: 'Contact Us',
      phone: 'Phone',
      rights: 'All rights reserved.',
    },
  }[locale]

  return `
<!DOCTYPE html>
<html lang="${locale}">
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
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND.black};">
              <h1 style="margin: 0; color: ${BRAND.white}; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Yakiwood</h1>
              <p style="margin: 5px 0 0; color: ${BRAND.grey}; font-size: 14px;">${t.tagline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: ${BRAND.bgGrey}; border-top: 1px solid ${BRAND.grey};">
              <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
                <strong>${t.contact}</strong>
              </p>
              <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; text-align: center; line-height: 1.6;">
                Email: <a href="mailto:info@yakiwood.lt" style="color: ${BRAND.black}; text-decoration: none;">info@yakiwood.lt</a><br>
                ${t.phone}: +370 XXX XXXXX<br>
                <a href="https://yakiwood.lt" style="color: ${BRAND.black}; text-decoration: none;">yakiwood.lt</a>
              </p>
              <p style="margin: 20px 0 0; color: ${BRAND.lightGrey}; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Yakiwood. ${t.rights}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

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
`

export const BILINGUAL_EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Sent after successful payment',
    category: 'transactional',
    subject: {
      lt: 'Yakiwood – Užsakymo patvirtinimas #{{orderNumber}}',
      en: 'Yakiwood - Order Confirmation #{{orderNumber}}',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Ačiū už jūsų užsakymą!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Jūsų užsakymas <strong>#{{orderNumber}}</strong> buvo sėkmingai apmokėtas ir perduotas gamybai.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Užsakymo informacija</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Užsakymo nr.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">#{{orderNumber}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Data:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{orderDate}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Suma:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{totalAmount}}</td>
          </tr>
        </table>
      </div>

      <h3 style="margin: 25px 0 15px; color: ${BRAND.black}; font-size: 18px; font-weight: 500;">Užsakyti produktai</h3>
      {{#each items}}
        <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
          <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">{{this.name}}</p>
          <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">Kiekis: {{this.quantity}} × €{{this.price}}</p>
        </div>
      {{/each}}

      ${button('Peržiūrėti užsakymą', 'https://yakiwood.lt/account/orders/{{orderNumber}}')}

      <p style="margin: 30px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Sąskaitą faktūrą rasite prisegtame faile. Apie pristatymą informuosime atskirai.
      </p>
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Thank you for your order!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Your order <strong>#{{orderNumber}}</strong> has been successfully paid and sent to production.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Order Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Order No.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">#{{orderNumber}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Date:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{orderDate}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Total:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{totalAmount}}</td>
          </tr>
        </table>
      </div>

      <h3 style="margin: 25px 0 15px; color: ${BRAND.black}; font-size: 18px; font-weight: 500;">Ordered Products</h3>
      {{#each items}}
        <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
          <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">{{this.name}}</p>
          <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">Quantity: {{this.quantity}} × €{{this.price}}</p>
        </div>
      {{/each}}

      ${button('View Order', 'https://yakiwood.lt/account/orders/{{orderNumber}}')}

      <p style="margin: 30px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        You will find the invoice in the attached files. We will inform you separately about shipping.
      </p>
    `
      ),
    },
  },

  {
    id: 'shipping-notification',
    name: 'Shipping Notification',
    description: 'Sent when order is shipped',
    category: 'transactional',
    subject: {
      lt: 'Yakiwood – Jūsų užsakymas #{{orderNumber}} išsiųstas!',
      en: 'Yakiwood - Your Order #{{orderNumber}} Has Shipped!',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų užsakymas pakeliui!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Užsakymas <strong>#{{orderNumber}}</strong> išsiųstas per {{carrier}}.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Siuntos sekimas</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Siuntos nr.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{trackingNumber}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Vežėjas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{carrier}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Numatomas pristatymas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{estimatedDelivery}}</td>
          </tr>
        </table>
      </div>

      ${button('Sekti siuntą', '{{trackingUrl}}')}
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your order is on the way!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Order <strong>#{{orderNumber}}</strong> has been shipped via {{carrier}}.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Tracking Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Tracking No.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{trackingNumber}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Carrier:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{carrier}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Estimated Delivery:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{estimatedDelivery}}</td>
          </tr>
        </table>
      </div>

      ${button('Track Shipment', '{{trackingUrl}}')}
    `
      ),
    },
  },

  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart',
    description: 'Reminder for incomplete purchases',
    category: 'marketing',
    subject: {
      lt: 'Yakiwood – Jūsų krepšelyje liko prekių',
      en: 'Yakiwood - You left items in your cart',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų krepšelis laukia!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Pastebėjome, kad krepšelyje palikote prekių. Sugrįžkite ir užbaikite pirkimą – prekės vis dar laukia!
      </p>

      <div style="margin: 25px 0;">
        {{#each items}}
          <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
            <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">{{this.name}}</p>
            <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">€{{this.price}}</p>
          </div>
        {{/each}}
      </div>

      <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
          Specialus pasiūlymas tik jums!
        </p>
        <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
          Panaudokite kodą ir gaukite {{discountPercent}}% nuolaidą:
        </p>
        <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
          {{discountCode}}
        </p>
      </div>

      ${button('Grįžti į krepšelį', 'https://yakiwood.lt/cart')}
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your cart is waiting!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We noticed you left some items in your cart. Come back and complete your order – the products are still waiting!
      </p>

      <div style="margin: 25px 0;">
        {{#each items}}
          <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
            <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">{{this.name}}</p>
            <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">€{{this.price}}</p>
          </div>
        {{/each}}
      </div>

      <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
          Special offer just for you!
        </p>
        <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
          Use code and get {{discountPercent}}% off:
        </p>
        <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
          {{discountCode}}
        </p>
      </div>

      ${button('Return to Cart', 'https://yakiwood.lt/cart')}
    `
      ),
    },
  },

  {
    id: 'back-in-stock',
    name: 'Back in Stock',
    description: 'Notify when product is available',
    category: 'marketing',
    subject: {
      lt: 'Yakiwood – {{productName}} vėl turime sandėlyje!',
      en: 'Yakiwood - {{productName}} Back in Stock!',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Gera žinia!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Laukta prekė <strong>{{productName}}</strong> vėl pasiekiama.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Prekė:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{productName}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Kaina:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{price}}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Ribotas kiekis – paskubėkite, kol neišpirkta!
      </p>

      ${button('Peržiūrėti prekę', '{{productUrl}}')}
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Good news!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        The awaited product <strong>{{productName}}</strong> is now available.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Product:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">{{productName}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Price:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{price}}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Limited quantity – hurry before it sells out again!
      </p>

      ${button('View Product', '{{productUrl}}')}
    `
      ),
    },
  },

  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Monthly updates and news',
    category: 'marketing',
    subject: {
      lt: 'Yakiwood naujienos – {{month}}',
      en: 'Yakiwood News - {{month}}',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">{{title}}</h2>
      {{content}}

      <h3 style="margin: 30px 0 20px; color: ${BRAND.black}; font-size: 20px; font-weight: 500;">Šio mėnesio produktai</h3>
      <table width="100%" cellpadding="10" cellspacing="0">
        <tr>
          {{#each featuredProducts}}
            <td width="50%" style="vertical-align: top;">
              <div style="border: 1px solid ${BRAND.grey}; border-radius: 12px; padding: 15px; text-align: center;">
                <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">{{this.name}}</p>
                <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 13px;">€{{this.price}}</p>
                <a href="{{this.url}}" style="color: ${BRAND.black}; text-decoration: underline; font-size: 13px;">Sužinoti daugiau →</a>
              </div>
            </td>
          {{/each}}
        </tr>
      </table>

      ${button('Apsilankyti svetainėje', 'https://yakiwood.lt')}

      <p style="margin: 30px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; text-align: center;">
        Nenorite gauti šių laiškų? <a href="{{unsubscribeUrl}}" style="color: ${BRAND.darkGrey}; text-decoration: underline;">Atsisakyti prenumeratos</a>
      </p>
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">{{title}}</h2>
      {{content}}

      <h3 style="margin: 30px 0 20px; color: ${BRAND.black}; font-size: 20px; font-weight: 500;">This Month's Products</h3>
      <table width="100%" cellpadding="10" cellspacing="0">
        <tr>
          {{#each featuredProducts}}
            <td width="50%" style="vertical-align: top;">
              <div style="border: 1px solid ${BRAND.grey}; border-radius: 12px; padding: 15px; text-align: center;">
                <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">{{this.name}}</p>
                <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 13px;">€{{this.price}}</p>
                <a href="{{this.url}}" style="color: ${BRAND.black}; text-decoration: underline; font-size: 13px;">Learn More →</a>
              </div>
            </td>
          {{/each}}
        </tr>
      </table>

      ${button('Visit Website', 'https://yakiwood.lt')}

      <p style="margin: 30px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; text-align: center;">
        Don't want to receive these emails? <a href="{{unsubscribeUrl}}" style="color: ${BRAND.darkGrey}; text-decoration: underline;">Unsubscribe</a>
      </p>
    `
      ),
    },
  },

  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Password reset link',
    category: 'transactional',
    subject: {
      lt: 'Yakiwood – Slaptažodžio atkūrimas',
      en: 'Yakiwood - Password Reset',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Slaptažodžio atkūrimas</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Gavome prašymą atkurti jūsų paskyros slaptažodį.
      </p>

      ${button('Atkurti slaptažodį', '{{resetUrl}}')}

      <div style="background-color: #FFF3CD; padding: 15px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #FFB020;">
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          Ši nuoroda galios <strong>{{expiryHours}} val.</strong> Jei neprašėte slaptažodžio atkūrimo, tiesiog ignoruokite šį laišką.
        </p>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; line-height: 1.6;">
        Jei mygtukas neveikia, nukopijuokite šią nuorodą į naršyklę:<br>
        <span style="color: ${BRAND.darkGrey}; word-break: break-all;">{{resetUrl}}</span>
      </p>
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Password Reset</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We received a request to reset your account password.
      </p>

      ${button('Reset Password', '{{resetUrl}}')}

      <div style="background-color: #FFF3CD; padding: 15px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #FFB020;">
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          This link will expire in <strong>{{expiryHours}} hours</strong>. If you didn't request a password reset, simply ignore this email.
        </p>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; line-height: 1.6;">
        If the button doesn't work, copy this link into your browser:<br>
        <span style="color: ${BRAND.darkGrey}; word-break: break-all;">{{resetUrl}}</span>
      </p>
    `
      ),
    },
  },

  {
    id: 'review-request',
    name: 'Review Request',
    description: 'Request product review after delivery',
    category: 'customer-service',
    subject: {
      lt: 'Yakiwood – Kaip jums patinka {{productName}}?',
      en: 'Yakiwood - How do you like {{productName}}?',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų nuomonė svarbi!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Tikimės, kad džiaugiatės nauju <strong>{{productName}}</strong>. Pasidalinkite savo patirtimi!
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px;">Įvertinkite produktą:</p>
        <div style="font-size: 32px; letter-spacing: 5px;">⭐⭐⭐⭐⭐</div>
      </div>

      ${button('Palikti atsiliepimą', '{{reviewUrl}}')}

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">Ačiū už atsiliepimą!</p>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          Palikite atsiliepimą ir gaukite <strong>50 lojalumo taškų</strong>, kuriuos galėsite panaudoti kitam pirkiniui.
        </p>
      </div>
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your opinion matters!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        We hope you're enjoying your new <strong>{{productName}}</strong>. Share your experience!
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px;">Rate the product:</p>
        <div style="font-size: 32px; letter-spacing: 5px;">⭐⭐⭐⭐⭐</div>
      </div>

      ${button('Leave a Review', '{{reviewUrl}}')}

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">Thank you for your review!</p>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          Leave a review and receive <strong>50 loyalty points</strong> that you can use for your next purchase.
        </p>
      </div>
    `
      ),
    },
  },

  {
    id: 'delivery-confirmation',
    name: 'Delivery Confirmation',
    description: 'Sent when order is delivered',
    category: 'transactional',
    subject: {
      lt: 'Yakiwood – Užsakymas #{{orderNumber}} pristatytas!',
      en: 'Yakiwood - Order #{{orderNumber}} Delivered!',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų užsakymas pristatytas!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Užsakymas <strong>#{{orderNumber}}</strong> sėkmingai pristatytas {{deliveryDate}}.
      </p>

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Turite klausimų?</h3>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
          Jei turite klausimų apie produktus ar pristatymą, susisiekite su mumis.
        </p>
      </div>

      <p style="margin: 25px 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        <strong>Grąžinimo taisyklės:</strong> prekes galite grąžinti per 14 dienų nuo gavimo.
      </p>

      ${button('Peržiūrėti užsakymą', 'https://yakiwood.lt/account/orders/{{orderNumber}}')}
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Your order has been delivered!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Order <strong>#{{orderNumber}}</strong> was successfully delivered on {{deliveryDate}}.
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

      ${button('View Order', 'https://yakiwood.lt/account/orders/{{orderNumber}}')}
    `
      ),
    },
  },

  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent after account creation',
    category: 'transactional',
    subject: {
      lt: 'Sveiki atvykę į Yakiwood!',
      en: 'Welcome to Yakiwood!',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Sveiki atvykę į Yakiwood!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Sveiki, <strong>{{name}}</strong>! Džiaugiamės, kad prisijungėte prie mūsų bendruomenės.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Ką pas mus rasite?</h3>
        <ul style="margin: 0; padding-left: 20px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.8;">
          <li>Autentiškas Shou Sugi Ban lentas</li>
          <li>Natūralius medienos paviršius</li>
          <li>Individualius sprendimus</li>
          <li>Profesionalias konsultacijas</li>
        </ul>
      </div>

      <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
          Dovana prisijungus!
        </p>
        <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
          Pirmosios pirkimo nuolaida {{welcomeDiscount}}%:
        </p>
        <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
          {{welcomeCode}}
        </p>
      </div>

      ${button('Pradėti apsipirkimą', 'https://yakiwood.lt/produktai')}
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Welcome to Yakiwood!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Hello, <strong>{{name}}</strong>! We're excited to have you join our community.
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

      <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
          Welcome gift!
        </p>
        <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
          First purchase discount {{welcomeDiscount}}%:
        </p>
        <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
          {{welcomeCode}}
        </p>
      </div>

      ${button('Start Shopping', 'https://yakiwood.lt/products')}
    `
      ),
    },
  },

  {
    id: 'refund-confirmation',
    name: 'Refund Confirmation',
    description: 'Sent when refund is processed',
    category: 'customer-service',
    subject: {
      lt: 'Yakiwood – Grąžinimas atliktas #{{orderNumber}}',
      en: 'Yakiwood - Refund Processed #{{orderNumber}}',
    },
    html: {
      lt: emailWrapper(
        'lt',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Pinigų grąžinimas atliktas</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Pinigų grąžinimas už užsakymą <strong>#{{orderNumber}}</strong> sėkmingai atliktas.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Grąžinimo informacija</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Suma:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{refundAmount}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Būdas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{refundMethod}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Apdorojimo laikas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{processingTime}}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Lėšos bus grąžintos į jūsų sąskaitą per {{processingTime}}. Atsiprašome už nepatogumus.
      </p>
    `
      ),
      en: emailWrapper(
        'en',
        `
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Refund Processed</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Your refund for order <strong>#{{orderNumber}}</strong> has been successfully processed.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Refund Information</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Amount:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">€{{refundAmount}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Method:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{refundMethod}}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Processing Time:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">{{processingTime}}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        The funds will be returned to your account within {{processingTime}}. We apologize for any inconvenience.
      </p>
    `
      ),
    },
  },
]

export function getBilingualEmailTemplate(id: string): EmailTemplateDefinition | undefined {
  return BILINGUAL_EMAIL_TEMPLATES.find((t) => t.id === id)
}

export function getBilingualEmailTemplatesByCategory(
  category: EmailTemplateDefinition['category']
): EmailTemplateDefinition[] {
  return BILINGUAL_EMAIL_TEMPLATES.filter((t) => t.category === category)
}

export function getSampleData(templateId: string): Record<string, any> {
  const samples: Record<string, any> = {
    'order-confirmation': {
      orderNumber: 'YW-2025-001',
      orderDate: '2025-12-30',
      totalAmount: '289.99',
      items: [
        { name: 'Shou Sugi Ban fasado lenta', quantity: 10, price: 25.99 },
        { name: 'Premium terasos lenta', quantity: 5, price: 32.0 },
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
        { name: 'Shou Sugi Ban fasado lenta', price: 25.99 },
        { name: 'Premium terasos lenta', price: 32.0 },
      ],
      discountCode: 'COMEBACK10',
      discountPercent: 10,
    },
    'back-in-stock': {
      productName: 'Shou Sugi Ban Premium Black',
      price: '29.99',
      productUrl: 'https://yakiwood.lt/produktai/shou-sugi-ban-premium',
    },
    newsletter: {
      title: 'Sausio naujienos ir nauji produktai',
      month: 'Sausis 2025',
      content:
        '<p style="margin: 0 0 15px; color: #535353; font-size: 15px; line-height: 1.6;">Sveiki! Šį mėnesį pristatome naują Shou Sugi Ban spalvų paletę ir specialius žiemos pasiūlymus.</p>',
      featuredProducts: [
        { name: 'Premium Black', price: '29.99', url: 'https://yakiwood.lt/produktai/premium-black' },
        { name: 'Natural Brown', price: '27.99', url: 'https://yakiwood.lt/produktai/natural-brown' },
      ],
      unsubscribeUrl: 'https://yakiwood.lt/newsletter/unsubscribe',
    },
    'password-reset': {
      resetUrl: 'https://yakiwood.lt/auth/reset-password?token=abc123def456',
      expiryHours: '24',
    },
    'review-request': {
      productName: 'Shou Sugi Ban Premium Black',
      reviewUrl: 'https://yakiwood.lt/produktai/shou-sugi-ban-premium/review',
    },
    'delivery-confirmation': {
      orderNumber: 'YW-2025-001',
      deliveryDate: '2025-01-03',
    },
    welcome: {
      name: 'Jonas',
      welcomeDiscount: '10',
      welcomeCode: 'WELCOME10',
    },
    'refund-confirmation': {
      orderNumber: 'YW-2025-001',
      refundAmount: '289.99',
      refundMethod: 'Mokėjimo kortelė',
      processingTime: '5–7 darbo dienos',
    },
  }
  return samples[templateId] || {}
}
