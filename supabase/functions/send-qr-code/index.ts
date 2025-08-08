import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QRCodeEmailRequest {
  toEmail: string;
  companyName: string;
  qrCodeUrl: string;
  linkUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toEmail, companyName, qrCodeUrl, linkUrl }: QRCodeEmailRequest = await req.json();

    console.log("Sending QR code email to:", toEmail);

    // Generate QR Code SVG data URL
    const qrCodeSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          QR Code Placeholder
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10" fill="gray">
          Escaneie para acessar
        </text>
      </svg>
    `;

    const emailResponse = await resend.emails.send({
      from: "MRx Compliance <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Canal de Denúncias - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Canal de Denúncias - ${companyName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; margin-bottom: 10px;">Canal de Denúncias</h1>
              <h2 style="color: #6b7280; font-weight: normal; margin-top: 0;">${companyName}</h2>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Escaneie o QR Code abaixo ou clique no link para acessar o canal de denúncias anônimas.
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <div style="display: inline-block; padding: 15px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${qrCodeSvg}
              </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                Ou acesse diretamente pelo link:
              </p>
              <a href="${linkUrl}" 
                 style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Acessar Canal de Denúncias
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                Este é um canal confidencial para reportar irregularidades.<br>
                Sua identidade será mantida em sigilo.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("QR Code email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-qr-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);