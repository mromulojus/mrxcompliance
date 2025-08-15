import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, Shield, Building2, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SplashCursor } from '@/components/ui/splash-cursor';
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signIn,
    signUp,
    user,
    loading
  } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: ''
  });
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, {
        replace: true
      });
    }
  }, [user, loading, navigate, location]);
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (activeTab === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = 'Nome completo é obrigatório';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      if (activeTab === 'login') {
        const {
          error
        } = await signIn(formData.username, formData.password);
        if (error) {
          setErrors({
            submit: 'Erro no login. Verifique suas credenciais.'
          });
        }
      } else {
        const {
          error
        } = await signUp(formData.username, formData.password, formData.fullName, formData.email);
        if (error) {
          setErrors({
            submit: 'Erro no cadastro. Tente novamente.'
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Splash Cursor Animation */}
      <SplashCursor />
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-accent/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative flex min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  MRx COMPLIANCE
                </h1>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Gestão completa e inteligente de conformidade empresarial
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Gestão Empresarial</h3>
                  <p className="text-sm text-muted-foreground">Controle total sobre suas empresas e estrutura organizacional</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Colaboradores</h3>
                  <p className="text-sm text-muted-foreground">Gerencie equipes, documentos e histórico profissional</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analytics Avançados</h3>
                  <p className="text-sm text-muted-foreground">Relatórios detalhados e insights para tomada de decisão</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Compliance Total</h3>
                  <p className="text-sm text-muted-foreground">Mantenha-se sempre em conformidade com as regulamentações</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile header */}
            <div className="text-center lg:hidden">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">MRx COMPLIANCE</h1>
              </div>
              <p className="text-muted-foreground">Gestão completa de conformidade</p>
            </div>

            {/* Auth Card */}
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-8">
                <CardTitle className="text-2xl font-bold">
                  {activeTab === 'login' ? 'Bem-vindo de volta' : 'Criar nova conta'}
                </CardTitle>
                <CardDescription className="text-base">
                  {activeTab === 'login' ? 'Entre com suas credenciais para acessar o sistema' : 'Preencha os dados para criar sua conta'}
                </CardDescription>
              </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Cadastro</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Error Alert */}
                {errors.submit && <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>}

                <TabsContent value="login" className="space-y-4 mt-0">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="username" type="text" placeholder="seu_usuario" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} className={`pl-10 ${errors.username ? 'border-destructive' : ''}`} />
                    </div>
                    {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Nome de Usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-username" type="text" placeholder="seu_usuario" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} className={`pl-10 ${errors.username ? 'border-destructive' : ''}`} />
                    </div>
                    {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" type="text" placeholder="Seu nome completo" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`} />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email (opcional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" placeholder="Confirme sua senha" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`} />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </TabsContent>

                {/* Submit Button */}
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" disabled={isSubmitting}>
                  {isSubmitting ? <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {activeTab === 'login' ? 'Entrando...' : 'Criando conta...'}
                    </div> : activeTab === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
                </Button>
              </form>
            </Tabs>

            <div className="mt-8">
              <Separator className="bg-border/50" />
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Ao fazer login, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                  {' '}e{' '}
                  <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>;
}