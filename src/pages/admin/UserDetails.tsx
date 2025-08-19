import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type DatabaseRole = "operacional" | "empresarial" | "administrador" | "superuser";

type Profile = {
  user_id: string;
  username: string;
  full_name: string | null;
  role: DatabaseRole;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  empresa_ids: string[] | null;
  avatar_url?: string | null;
};

type Empresa = { id: string; nome: string };

const roleLabels: Record<DatabaseRole, string> = {
  operacional: "Operacional",
  empresarial: "Empresarial",
  administrador: "Administrador",
  superuser: "Superuser"
};

const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    document.title = "Detalhes do Usuário - MRx Compliance";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data: prof, error } = await supabase
          .from("profiles")
          .select("user_id, username, full_name, role, is_active, created_at, updated_at, empresa_ids, avatar_url")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        setProfile(prof as unknown as Profile);

        const ids = (prof?.empresa_ids as string[] | null) || [];
        if (ids.length > 0) {
          const { data: empData } = await supabase
            .from("empresas")
            .select("id, nome")
            .in("id", ids);
          setEmpresas(empData || []);
        } else {
          setEmpresas([]);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const empresasResumo = useMemo(() => {
    if (!profile) return "";
    if (!profile.empresa_ids || profile.empresa_ids.length === 0) return "Sem vínculo";
    if (empresas.length === 0) return `${profile.empresa_ids.length} empresas`;
    return empresas.map((e) => e.nome).join(", ");
  }, [profile, empresas]);

  if (loading) {
    return (
      <main>
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <div className="py-16 text-center">
          <p className="mb-4">Usuário não encontrado.</p>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name ?? profile.username} />
                <AvatarFallback>
                  {profile.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">
                  {profile.full_name || profile.username}
                </div>
                <div className="text-sm text-muted-foreground">{profile.username}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="uppercase">{roleLabels[profile.role]}</Badge>
              <Badge variant={profile.is_active ? "default" : "destructive"}>
                {profile.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell className="font-mono">{profile.user_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>{profile.full_name || "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>{profile.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Papel</TableCell>
                  <TableCell className="uppercase">{roleLabels[profile.role]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>{profile.is_active ? "Ativo" : "Inativo"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Empresas</TableCell>
                  <TableCell>{empresasResumo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Criado em</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
                </TableRow>
                {profile.updated_at && (
                  <TableRow>
                    <TableCell>Atualizado em</TableCell>
                    <TableCell>{new Date(profile.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default UserDetails;

