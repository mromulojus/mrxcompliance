import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SplashCursor } from '@/components/ui/splash-cursor';
import { SignInPage, type Testimonial } from '@/components/ui/sign-in';
const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://avatars.githubusercontent.com/u/99661785?s=200&v=4",
    name: "Italo Lima",
    handle: "@Hustapp",
    text: "A plataforma transformou nossa gestão de conformidade. Interface intuitiva e recursos poderosos."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    name: "João Santos",
    handle: "@joao_hr",
    text: "Excelente para gestão de colaboradores e auditoria. Relatórios detalhados e análises precisas."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    name: "Ana Costa",
    handle: "@ana_debto",
    text: "Gestão de cobranças nunca foi tão eficiente. Dashboard completo e ferramentas profissionais."
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      setErrors({ submit: 'Nome de usuário e senha são obrigatórios' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isSignUp) {
        // For signup, we need additional fields - but since this is login component,
        // we'll redirect to signup mode
        return;
      } else {
        const { error } = await signIn(username, password);
        if (error) {
          setErrors({ submit: 'Erro no login. Verifique suas credenciais.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    setErrors({ submit: 'Login com Google ainda não implementado' });
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset
    setErrors({ submit: 'Recuperação de senha ainda não implementada' });
  };

  const handleCreateAccount = () => {
    setIsSignUp(true);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <SplashCursor />
      
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            <span className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              MRx COMPLIANCE
            </span>
          </span>
        }
        description="Gestão completa e inteligente de conformidade empresarial"
        heroImageSrc="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isSubmitting}
        errorMessage={errors.submit}
      />
    </div>
  );
}