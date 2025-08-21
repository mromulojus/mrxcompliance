import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  full_name: string;
  username: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, username, password }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email} (${full_name})`);

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à MRx Compliance</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f1f5f9;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .tagline {
            color: #64748b;
            font-size: 16px;
        }
        .welcome-title {
            color: #1e293b;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }
        .welcome-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            text-align: center;
        }
        .credentials-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 30px 0;
        }
        .credentials-title {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .credential-item {
            margin: 12px 0;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        .credential-label {
            font-weight: 600;
            color: #475569;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background: #1e293b;
            color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            word-break: break-all;
        }
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
            transition: all 0.2s;
        }
        .features {
            margin: 40px 0;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin: 12px 0;
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
        }
        .feature-icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .footer-links {
            margin: 16px 0;
        }
        .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 12px;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
        }
        .security-note strong {
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MRx Compliance</div>
            <div class="tagline">Plataforma de Compliance e Gestão Empresarial</div>
        </div>

        <h1 class="welcome-title">🎉 Bem-vindo(a), ${full_name}!</h1>
        
        <p class="welcome-text">
            Parabéns! Você acaba de ganhar acesso à nossa plataforma de compliance e gestão empresarial. 
            Estamos muito felizes em tê-lo(a) conosco!
        </p>

        <div class="credentials-box">
            <div class="credentials-title">
                🔐 Suas credenciais de acesso
            </div>
            <div class="credential-item">
                <div class="credential-label">Usuário:</div>
                <div class="credential-value">${username}</div>
            </div>
            <div class="credential-item">
                <div class="credential-label">Email:</div>
                <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
                <div class="credential-label">Senha temporária:</div>
                <div class="credential-value">${password}</div>
            </div>
        </div>

        <div class="security-note">
            <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere sua senha no primeiro acesso. 
            Você pode fazer isso em seu perfil após o login.
        </div>

        <div style="text-align: center;">
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://pxpscjyeqmqqxzbttbep.supabase.co'}/auth/confirm" class="login-button">
                🚀 Acessar a Plataforma
            </a>
        </div>

        <div class="features">
            <h3 style="color: #1e293b; margin-bottom: 20px;">🌟 O que você pode fazer na plataforma:</h3>
            <ul class="feature-list">
                <li class="feature-item">
                    <div class="feature-icon">📊</div>
                    <span>Acompanhar indicadores e métricas em tempo real</span>
                </li>
                <li class="feature-item">
                    <div class="feature-icon">📋</div>
                    <span>Gerenciar tarefas e projetos empresariais</span>
                </li>
                <li class="feature-item">
                    <div class="feature-icon">🏢</div>
                    <span>Administrar informações das empresas</span>
                </li>
                <li class="feature-item">
                    <div class="feature-icon">⚖️</div>
                    <span>Acessar ferramentas de compliance e jurídico</span>
                </li>
                <li class="feature-item">
                    <div class="feature-icon">📞</div>
                    <span>Utilizar o canal de denúncias e ouvidoria</span>
                </li>
                <li class="feature-item">
                    <div class="feature-icon">💼</div>
                    <span>Gerenciar colaboradores e RH</span>
                </li>
            </ul>
        </div>

        <div class="footer">
            <p>Este email foi enviado automaticamente pelo sistema MRx Compliance.</p>
            <div class="footer-links">
                <a href="#">Suporte</a> • 
                <a href="#">Política de Privacidade</a> • 
                <a href="#">Termos de Uso</a>
            </div>
            <p style="margin-top: 20px;">
                <strong>MRx Compliance</strong><br>
                Sua plataforma completa de gestão empresarial e compliance
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "MRx Compliance <noreply@mrxcompliance.com>",
      to: [email],
      subject: "🎉 Bem-vindo à MRx Compliance - Acesso Liberado!",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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