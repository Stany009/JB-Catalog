export interface EnquiryData {
  name: string;
  phone?: string;
  email?: string;
  product?: string;
  message: string;
}

export function generateEmailHtml(data: EnquiryData, websiteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f8fa; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f8fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #0B2342; background: linear-gradient(135deg, #0B2342 0%, #0D5EA6 100%); padding: 30px 40px; text-align: center;">
              <img src="${websiteUrl}/logo-white.png" alt="JB Pools & Accessories" width="200" style="display: block; margin: 0 auto 15px;" />
              <p style="color: #35C6D9; font-size: 12px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Complete Swimming Pool Solutions</p>
            </td>
          </tr>
          
          <!-- Enquiry Title -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <h1 style="color: #0B2342; font-size: 20px; margin: 0 0 10px;">New Product Enquiry</h1>
              <p style="color: #666; font-size: 14px; margin: 0;">A customer has submitted an enquiry through the website.</p>
            </td>
          </tr>
          
          <!-- Enquiry Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                
                ${data.name ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
                    <p style="color: #0B2342; font-size: 14px; font-weight: 600; margin: 0;">${data.name}</p>
                  </td>
                </tr>` : ''}
                
                ${data.phone ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Phone</p>
                    <p style="color: #0B2342; font-size: 14px; margin: 0;">
                      <a href="tel:${data.phone}" style="color: #0D5EA6; text-decoration: none;">${data.phone}</a>
                    </p>
                  </td>
                </tr>` : ''}
                
                ${data.email ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                    <p style="color: #0B2342; font-size: 14px; margin: 0;">
                      <a href="mailto:${data.email}" style="color: #0D5EA6; text-decoration: none;">${data.email}</a>
                    </p>
                  </td>
                </tr>` : ''}
                
                ${data.product ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Product</p>
                    <p style="color: #0B2342; font-size: 14px; font-weight: 600; margin: 0;">${data.product}</p>
                  </td>
                </tr>` : ''}
                
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                    <p style="color: #0B2342; font-size: 14px; margin: 0; line-height: 1.6;">${data.message}</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Quick Reply Button -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              ${data.phone ? `
              <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${data.name},\n\nThank you for your enquiry about ${data.product || 'our products'}.\n\nJB Pools & Accessories`)}}" 
                 style="display: inline-block; background-color: #25D366; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Reply via WhatsApp
              </a>` : ''}
              
              ${data.email ? `
              <a href="mailto:${data.email}?subject=${encodeURIComponent(`Re: Your enquiry about ${data.product || 'JB Pools products'}`)}"
                 style="display: inline-block; background-color: #0D5EA6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-left: 10px;">
                Reply via Email
              </a>` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0B2342; padding: 20px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0 0 8px;">
                This enquiry was submitted through the JB Pools & Accessories website
              </p>
              <p style="color: #35C6D9; font-size: 11px; margin: 0;">
                <a href="${websiteUrl}" style="color: #35C6D9; text-decoration: none;">${websiteUrl}</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateWhatsAppLink(data: EnquiryData, websiteUrl: string): string {
  const message = `🏊 *JB Pools & Accessories*
━━━━━━━━━━━━━━━━━

*New Website Enquiry*

👤 Name: ${data.name}
${data.phone ? `📱 Phone: ${data.phone}` : ''}
${data.email ? `📧 Email: ${data.email}` : ''}
${data.product ? `\n📦 Product: ${data.product}` : ''}

💬 Message:
${data.message}

🌐 Source: ${websiteUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
