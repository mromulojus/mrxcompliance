import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Autenticação - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Sistema aberto - acesse diretamente.");
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">MRx Compliance</CardTitle>
          <p className="text-muted-foreground">Sistema aberto para acesso direto</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Este sistema está configurado para acesso sem autenticação.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Acessar Sistema
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;