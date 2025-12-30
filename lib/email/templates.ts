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
<html lang="lt">
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
              <p style="margin: 5px 0 0; color: ${BRAND.grey}; font-size: 14px;">Natūralus medienos grožis</p>
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
                <strong>Kontaktai</strong>
              </p>
              <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; text-align: center; line-height: 1.6;">
                El. paštas: <a href="mailto:info@yakiwood.lt" style="color: ${BRAND.black}; text-decoration: none;">info@yakiwood.lt</a><br>
                Tel: +370 XXX XXXXX<br>
                <a href="https://yakiwood.lt" style="color: ${BRAND.black}; text-decoration: none;">yakiwood.lt</a>
              </p>
              <p style="margin: 20px 0 0; color: ${BRAND.lightGrey}; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Yakiwood. Visos teisės saugomos.
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
    name: 'Užsakymo patvirtinimas',
    description: 'Sent after successful payment',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Užsakymo patvirtinimas #${vars.orderNumber}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Dėkojame už jūsų užsakymą!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Jūsų užsakymas <strong>#${vars.orderNumber}</strong> buvo sėkmingai apmokėtas ir perduotas gamybai.
      </p>
      
      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Užsakymo informacija</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Užsakymo nr.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">#${vars.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Data:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.orderDate}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Suma:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">${vars.totalAmount} €</td>
          </tr>
        </table>
      </div>

      ${vars.items ? `
        <h3 style="margin: 25px 0 15px; color: ${BRAND.black}; font-size: 18px; font-weight: 500;">Užsakyti produktai</h3>
        ${vars.items.map((item: any) => `
          <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
            <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">${item.name}</p>
            <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">
              Kiekis: ${item.quantity} × ${item.price} €
            </p>
          </div>
        `).join('')}
      ` : ''}

      ${button('Peržiūrėti užsakymą', `https://yakiwood.lt/paskyra/uzsakymai/${vars.orderNumber}`)}

      <p style="margin: 30px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Sąskaitą faktūrą rasite prisegtuose failuose. Apie siuntimą informuosime atskirai.
      </p>
    `),
  },

  // 2. SHIPPING NOTIFICATION
  {
    id: 'shipping-notification',
    name: 'Siuntimo informacija',
    description: 'Sent when order is shipped',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Jūsų užsakymas #${vars.orderNumber} išsiųstas!`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų užsakymas keliauja!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Užsakymas <strong>#${vars.orderNumber}</strong> išsiųstas ${vars.carrier} kurjerių paslauga.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Sekimo informacija</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Sekimo nr.:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.trackingNumber}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Kurjeris:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.carrier}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Numatoma pristatymo data:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.estimatedDelivery}</td>
          </tr>
        </table>
      </div>

      ${button('Sekti siuntą', vars.trackingUrl)}
    `),
  },

  // 3. ABANDONED CART
  {
    id: 'abandoned-cart',
    name: 'Apleistas krepšelis',
    description: 'Reminder for incomplete purchases',
    category: 'marketing',
    subject: () => 'Yakiwood - Palikote produktų krepšelyje 🌲',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų krepšelis laukia!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Pastebėjome, kad palikote produktų savo krepšelyje. Grįžkite ir užbaikite užsakymą – produktai dar laukia!
      </p>

      ${vars.items ? `
        <div style="margin: 25px 0;">
          ${vars.items.map((item: any) => `
            <div style="border-bottom: 1px solid ${BRAND.grey}; padding: 15px 0;">
              <div>
                <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 15px; font-weight: 500;">${item.name}</p>
                <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px;">${item.price} €</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${vars.discountCode ? `
        <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
          <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
            🎁 Specialus pasiūlymas tik jums!
          </p>
          <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
            Naudokite kodą ir gaukite ${vars.discountPercent}% nuolaidą:
          </p>
          <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
            ${vars.discountCode}
          </p>
        </div>
      ` : ''}

      ${button('Grįžti prie krepšelio', 'https://yakiwood.lt/krepselis')}
    `),
  },

  // 4. BACK IN STOCK
  {
    id: 'back-in-stock',
    name: 'Prekė vėl sandėlyje',
    description: 'Notify when product is available',
    category: 'marketing',
    subject: (vars) => `Yakiwood - ${vars.productName} vėl sandėlyje! ✨`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Geros naujienos!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Lauktas produktas <strong>${vars.productName}</strong> vėl prieinamas mūsų sandėlyje.
      </p>

      ${vars.productImage ? `
        <div style="text-align: center; margin: 25px 0;">
          <img src="${vars.productImage}" alt="${vars.productName}" style="max-width: 100%; height: auto; border-radius: 12px;" />
        </div>
      ` : ''}

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Produktas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; font-weight: 500; text-align: right;">${vars.productName}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Kaina:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">${vars.price} €</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        ⚠️ Ribotas kiekis – paskubėkite, kol vėl neišsisėmė!
      </p>

      ${button('Peržiūrėti produktą', vars.productUrl)}
    `),
  },

  // 5. NEWSLETTER
  {
    id: 'newsletter',
    name: 'Naujienlaiškis',
    description: 'Monthly updates and news',
    category: 'marketing',
    subject: (vars) => `Yakiwood naujienos - ${vars.month}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">${vars.title}</h2>
      
      ${vars.content}

      ${vars.featuredProducts ? `
        <h3 style="margin: 30px 0 20px; color: ${BRAND.black}; font-size: 20px; font-weight: 500;">Šio mėnesio produktai</h3>
        <table width="100%" cellpadding="10" cellspacing="0">
          <tr>
            ${vars.featuredProducts.slice(0, 2).map((product: any) => `
              <td width="50%" style="vertical-align: top;">
                <div style="border: 1px solid ${BRAND.grey}; border-radius: 12px; padding: 15px; text-align: center;">
                  ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;" />` : ''}
                  <p style="margin: 0 0 5px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">${product.name}</p>
                  <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 13px;">${product.price} €</p>
                  <a href="${product.url}" style="color: ${BRAND.black}; text-decoration: underline; font-size: 13px;">Plačiau →</a>
                </div>
              </td>
            `).join('')}
          </tr>
        </table>
      ` : ''}

      ${button('Apsilankykite svetainėje', 'https://yakiwood.lt')}

      <p style="margin: 30px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; text-align: center;">
        Nebenorite gauti šių laiškų? <a href="${vars.unsubscribeUrl}" style="color: ${BRAND.darkGrey}; text-decoration: underline;">Atsisakyti prenumeratos</a>
      </p>
    `),
  },

  // 6. PASSWORD RESET
  {
    id: 'password-reset',
    name: 'Slaptažodžio atstatymas',
    description: 'Password reset link',
    category: 'transactional',
    subject: () => 'Yakiwood - Slaptažodžio atstatymas',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Slaptažodžio atstatymas</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Gavome prašymą atstatyti jūsų paskyros slaptažodį.
      </p>

      ${button('Atstatyti slaptažodį', vars.resetUrl)}

      <div style="background-color: #FFF3CD; padding: 15px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #FFB020;">
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          ⚠️ Ši nuoroda galios <strong>${vars.expiryHours} valandas</strong>. Jei neprašėte atstatyti slaptažodžio, tiesiog ignoruokite šį laišką.
        </p>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.lightGrey}; font-size: 12px; line-height: 1.6;">
        Jei mygtukas neveikia, nukopijuokite šią nuorodą į naršyklę:<br>
        <span style="color: ${BRAND.darkGrey}; word-break: break-all;">${vars.resetUrl}</span>
      </p>
    `),
  },

  // 7. REVIEW REQUEST
  {
    id: 'review-request',
    name: 'Atsiliepimo prašymas',
    description: 'Request product review after delivery',
    category: 'customer-service',
    subject: (vars) => `Yakiwood - Kaip jums patiko ${vars.productName}?`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų nuomonė svarbi! 💭</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Tikimės, kad džiaugiatės savo nauju <strong>${vars.productName}</strong>. Pasidalinkite savo įspūdžiais!
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 14px;">Įvertinkite produktą:</p>
        <div style="font-size: 32px; letter-spacing: 5px;">⭐⭐⭐⭐⭐</div>
      </div>

      ${button('Palikti atsiliepimą', vars.reviewUrl)}

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 14px; font-weight: 500;">🎁 Padėkime už atsiliepimą!</p>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 13px; line-height: 1.6;">
          Palikite atsiliepimą ir gaukite <strong>50 lojalumo taškų</strong>, kuriuos galėsite panaudoti kitam pirkimui.
        </p>
      </div>
    `),
  },

  // 8. DELIVERY CONFIRMATION
  {
    id: 'delivery-confirmation',
    name: 'Pristatymo patvirtinimas',
    description: 'Sent when order is delivered',
    category: 'transactional',
    subject: (vars) => `Yakiwood - Užsakymas #${vars.orderNumber} pristatytas!`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Jūsų užsakymas pristatytas! 🎉</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Užsakymas <strong>#${vars.orderNumber}</strong> sėkmingai pristatytas ${vars.deliveryDate}.
      </p>

      <div style="background-color: #E8F5E9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Kyla klausimų?</h3>
        <p style="margin: 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
          Jei turite kokių nors klausimų dėl produktų arba pristatymo, nedvejodami susisiekite su mumis.
        </p>
      </div>

      <p style="margin: 25px 0 15px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        <strong>Grąžinimo politika:</strong> Galite grąžinti prekes per 14 dienų nuo gavimo dienos.
      </p>

      ${button('Peržiūrėti užsakymą', `https://yakiwood.lt/paskyra/uzsakymai/${vars.orderNumber}`)}
    `),
  },

  // 9. WELCOME EMAIL
  {
    id: 'welcome',
    name: 'Pasveikinimo laiškas',
    description: 'Sent after account creation',
    category: 'transactional',
    subject: () => 'Sveiki atvykę į Yakiwood! 🌲',
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Sveiki atvykę į Yakiwood!</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Labas, <strong>${vars.name}</strong>! Džiaugiamės, kad prisijungėte prie mūsų bendruomenės.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Ką galite rasti pas mus?</h3>
        <ul style="margin: 0; padding-left: 20px; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.8;">
          <li>Autentiškos Shou Sugi Ban lentos</li>
          <li>Natūralios medienos apdaila</li>
          <li>Individualizuoti sprendimai</li>
          <li>Profesionalūs konsultantai</li>
        </ul>
      </div>

      ${vars.welcomeDiscount ? `
        <div style="background-color: #FFF9E6; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #FFD700;">
          <p style="margin: 0 0 10px; color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: center;">
            🎁 Dovana naujam nariui!
          </p>
          <p style="margin: 0 0 10px; color: ${BRAND.darkGrey}; font-size: 14px; text-align: center;">
            Pirmo pirkimo nuolaida ${vars.welcomeDiscount}%:
          </p>
          <p style="margin: 0; color: ${BRAND.black}; font-size: 20px; font-weight: 500; text-align: center; letter-spacing: 2px;">
            ${vars.welcomeCode}
          </p>
        </div>
      ` : ''}

      ${button('Pradėti apsipirkimą', 'https://yakiwood.lt/produktai')}
    `),
  },

  // 10. REFUND CONFIRMATION
  {
    id: 'refund-confirmation',
    name: 'Pinigų grąžinimo patvirtinimas',
    description: 'Sent when refund is processed',
    category: 'customer-service',
    subject: (vars) => `Yakiwood - Pinigų grąžinimas #${vars.orderNumber}`,
    html: (vars) => emailWrapper(`
      <h2 style="margin: 0 0 20px; color: ${BRAND.black}; font-size: 24px; font-weight: 500;">Pinigų grąžinimas apdorotas</h2>
      <p style="margin: 0 0 15px; color: ${BRAND.darkGrey}; font-size: 16px; line-height: 1.6;">
        Jūsų užsakymo <strong>#${vars.orderNumber}</strong> pinigų grąžinimas buvo sėkmingai apdorotas.
      </p>

      <div style="background-color: ${BRAND.bgGrey}; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${BRAND.black}; font-size: 16px; font-weight: 500;">Grąžinimo informacija</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Suma:</td>
            <td style="color: ${BRAND.black}; font-size: 16px; font-weight: 500; text-align: right;">${vars.refundAmount} €</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Būdas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.refundMethod}</td>
          </tr>
          <tr>
            <td style="color: ${BRAND.darkGrey}; font-size: 14px;">Laikas:</td>
            <td style="color: ${BRAND.black}; font-size: 14px; text-align: right;">${vars.processingTime}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 25px 0 0; color: ${BRAND.darkGrey}; font-size: 14px; line-height: 1.6;">
        Pinigai bus grąžinti į jūsų sąskaitą per ${vars.processingTime}. Atsiprašome dėl nepatogumų.
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
        { name: 'Shou Sugi Ban fasadinė lenta', quantity: 10, price: 25.99 },
        { name: 'Terasinė lenta Premium', quantity: 5, price: 32.00 },
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
        { name: 'Shou Sugi Ban fasadinė lenta', price: 25.99 },
        { name: 'Terasinė lenta Premium', price: 32.00 },
      ],
      discountCode: 'GRIZK10',
      discountPercent: 10,
    },
    'back-in-stock': {
      productName: 'Shou Sugi Ban Premium Juoda',
      price: '29.99',
      productUrl: 'https://yakiwood.lt/produktai/shou-sugi-ban-premium',
      productImage: '',
    },
    'newsletter': {
      title: 'Sausio naujienos ir nauji produktai',
      month: 'Sausis 2025',
      content: '<p style="margin: 0 0 15px; color: #535353; font-size: 15px; line-height: 1.6;">Sveiki! Šį mėnesį pristatome naują Shou Sugi Ban spalvų paletę ir specialius pasiūlymus žiemai.</p>',
      featuredProducts: [
        { name: 'Premium Juoda', price: '29.99', url: 'https://yakiwood.lt/produktai/premium-juoda', image: '' },
        { name: 'Natural Brown', price: '27.99', url: 'https://yakiwood.lt/produktai/natural-brown', image: '' },
      ],
      unsubscribeUrl: 'https://yakiwood.lt/newsletter/unsubscribe',
    },
    'password-reset': {
      resetUrl: 'https://yakiwood.lt/auth/reset-password?token=abc123def456',
      expiryHours: '24',
    },
    'review-request': {
      productName: 'Shou Sugi Ban Premium Juoda',
      reviewUrl: 'https://yakiwood.lt/produktai/shou-sugi-ban-premium/review',
    },
    'delivery-confirmation': {
      orderNumber: 'YW-2025-001',
      deliveryDate: '2025-01-03',
    },
    'welcome': {
      name: 'Jonas',
      welcomeDiscount: '10',
      welcomeCode: 'WELCOME10',
    },
    'refund-confirmation': {
      orderNumber: 'YW-2025-001',
      refundAmount: '289.99',
      refundMethod: 'Mokėjimo kortelė',
      processingTime: '5-7 darbo dienas',
    },
  };
  return samples[templateId] || {};
}
