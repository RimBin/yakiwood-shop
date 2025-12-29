# SMTP Email Konfigūracija (alternatyva Resend)

Jei nenorite naudoti Resend, galite siųsti el. laiškus per bet kokį SMTP serverį (Gmail, Outlook, custom SMTP).

## 1. Įdiekite Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## 2. Pridėkite SMTP kredencialus į .env.local

```env
# Vietoj Resend, naudokite SMTP:
SMTP_HOST=smtp.gmail.com           # Gmail pvz.
SMTP_PORT=587                       # arba 465
SMTP_USER=jusu.pastas@gmail.com
SMTP_PASSWORD=jusu-app-password    # Ne paprastas slaptažodis!
SMTP_FROM=Yakiwood <info@yakiwood.lt>
```

### Gmail App Password:
1. Eikite į https://myaccount.google.com/security
2. Įjunkite 2-Step Verification
3. Eikite į "App passwords"
4. Sukurkite naują App password ("Mail" kategorijai)
5. Nukopijuokite 16 simbolių kodą

### Kiti SMTP provideriai:
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **Custom SMTP**: jūsų serverio nustatymai

## 3. Sukurkite SMTP email utility

Sukurkite failą `lib/email/smtp.ts`:

```typescript
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmailViaSMTP(options: EmailOptions) {
  // Sukuriame SMTP transportą
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Siunčiame el. laišką
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Yakiwood <noreply@yakiwood.lt>',
    to: options.to,
    subject: options.subject,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    html: options.html,
    attachments: options.attachments,
  });

  return info;
}

// Testuoti SMTP ryšį
export async function testSMTPConnection() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
```

## 4. Pakeiskite webhook email logiką

Atnaujinkite `app/api/webhooks/stripe/route.ts`:

```typescript
// Vietoj šio:
function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

// Naudokite šitą:
import { sendEmailViaSMTP } from '@/lib/email/smtp';

// Ir vietoj Resend siuntimo:
const { data, error } = await resend.emails.send({
  from: 'Yakiwood <info@yakiwood.lt>',
  to: customerEmail,
  subject: `Order Confirmation - ${orderNumber}`,
  html: emailHtml,
  attachments: [...]
});

// Naudokite:
await sendEmailViaSMTP({
  to: customerEmail,
  subject: `Užsakymo patvirtinimas - ${orderNumber}`,
  html: emailHtml,
  attachments: [{
    filename: `invoice-${orderNumber}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  }]
});
```

## 5. Pilnas webhook pavyzdys su SMTP

```typescript
// app/api/webhooks/stripe/route.ts

import { sendEmailViaSMTP } from '@/lib/email/smtp';

export async function POST(req: NextRequest) {
  // ... (stripe webhook logika)
  
  if (event.type === 'checkout.session.completed') {
    // ... (order creation)
    
    // Generate invoice PDF
    const pdfBuffer = await invoicePdf.generate();
    
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #161616; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f5f5f5; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dėkojame už užsakymą!</h1>
            </div>
            <div class="content">
              <p>Sveiki, ${customerName},</p>
              <p>Jūsų užsakymas <strong>${orderNumber}</strong> buvo sėkmingai apdorotas.</p>
              <p><strong>Suma:</strong> €${total.toFixed(2)}</p>
              <p>Sąskaita faktūra pridėta prie šio laiško.</p>
              <p>Jūsų užsakymas bus apdorotas per 1-2 darbo dienas.</p>
            </div>
            <div class="footer">
              <p>Yakiwood | info@yakiwood.lt | +370 XXX XXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Send email via SMTP
    try {
      await sendEmailViaSMTP({
        to: customerEmail,
        subject: `Užsakymo patvirtinimas - ${orderNumber}`,
        html: emailHtml,
        attachments: [{
          filename: `saskaita-${orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
      
      console.log('✅ Order confirmation email sent via SMTP');
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Order still created, just email failed
    }
  }
}
```

## 6. Testuokite SMTP

Sukurkite test route `app/api/test-smtp/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendEmailViaSMTP, testSMTPConnection } from '@/lib/email/smtp';

export async function GET() {
  // Test connection
  const connected = await testSMTPConnection();
  
  if (!connected) {
    return NextResponse.json({ 
      error: 'SMTP connection failed' 
    }, { status: 500 });
  }
  
  // Send test email
  try {
    await sendEmailViaSMTP({
      to: process.env.SMTP_USER!, // Send to yourself
      subject: 'Yakiwood - SMTP Test',
      html: '<h1>SMTP veikia!</h1><p>Jūsų SMTP konfigūracija veikia teisingai.</p>',
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Test email sent successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
```

Testuokite: http://localhost:3000/api/test-smtp

## 7. Privalumai ir trūkumai

### SMTP privalumai:
✅ Nemokamas (su Gmail, Outlook)  
✅ Nekuriame papildomos paskyros  
✅ Naudojame esamą el. paštą  
✅ Veikia su bet kokiu SMTP provideriu  

### SMTP trūkumai:
❌ Gmail: 500 email/dieną limitas  
❌ Lėtesnis nei Resend API  
❌ Gali būti blokiruojamas kaip spam  
❌ Reikia App password (Gmail)  

### Resend privalumai:
✅ 100 email/dieną nemokamai  
✅ 3000 email/mėn (paid plan)  
✅ Greitas API  
✅ Geresnė deliverability  
✅ Email analytics  
✅ Domain verification  

## 8. Rekomendacija

**Development:** Naudokite SMTP su Gmail  
**Production:** Naudokite Resend arba SendGrid

**Hibridinis variantas:**
```typescript
// lib/email/send.ts
export async function sendEmail(options: EmailOptions) {
  // Development - SMTP
  if (process.env.NODE_ENV === 'development') {
    return sendEmailViaSMTP(options);
  }
  
  // Production - Resend
  return sendEmailViaResend(options);
}
```

## 9. Troubleshooting

**"Authentication failed":**
- Patikrinkite SMTP_USER ir SMTP_PASSWORD
- Gmail: naudokite App Password, ne paprastą slaptažodį
- Įsitikinkite kad 2-Factor Authentication įjungtas

**"Connection timeout":**
- Patikrinkite SMTP_HOST ir SMTP_PORT
- Firewall gali blokuoti SMTP portą
- Bandykite port 465 vietoj 587

**"Email goes to spam":**
- Naudokite tikrą from email (ne noreply@...)
- Pridėkite SPF/DKIM records
- Verifikuokite domeną (paid plan)

**Gmail daily limit exceeded:**
- Gmail free: 500 email/dieną
- G Suite: 2000 email/dieną
- Perjunkite į Resend/SendGrid

## 10. NPM scripts

Pridėkite į `package.json`:

```json
{
  "scripts": {
    "email:test": "curl http://localhost:3000/api/test-smtp"
  }
}
```

Testuokite:
```bash
npm run dev
npm run email:test
```

---

**Išvada:** SMTP yra geras variantas pradėti, bet production rekomenduoju Resend (nemokamai iki 100 email/dieną).
