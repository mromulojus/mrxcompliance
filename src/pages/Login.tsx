import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [roleFallback, setRoleFallback] = React.useState<"administrador" | "empresarial" | "operacional">("operacional");

  React.useEffect(() => {
    document.title = "Entrar - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Acesse o painel com seu usuário e papel.");
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast({ title: "Usuário obrigatório", variant: "destructive" });
      return;
    }
    if (username === "mrxbr" && password !== "1408") {
      toast({ title: "Senha inválida para superuser", variant: "destructive" });
      return;
    }
    login({ username, password, roleFallback });
    toast({ title: "Bem-vindo", description: `Você entrou como ${username}.` });
    navigate("/");
  };

  const isSuper = username === "mrxbr";

  return (
    <main className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acessar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-muted-foreground">Usuário</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu_usuario" />
            </label>
            {isSuper && (
              <label className="block">
                <span className="text-sm text-muted-foreground">Senha</span>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
              </label>
            )}
            {!isSuper && (
              <label className="block">
                <span className="text-sm text-muted-foreground">Papel</span>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={roleFallback}
                  onChange={(e) => setRoleFallback(e.target.value as any)}
                >
                  <option value="operacional">Operacional</option>
                  <option value="empresarial">Empresarial</option>
                  <option value="administrador">Administrador</option>
                </select>
              </label>
            )}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
