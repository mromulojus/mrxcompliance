import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Eye, Search, Trash2 } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Empresas = () => {
  const { empresas, colaboradores, loading } = useSupabaseData();
  const { removerEmpresa } = useHR();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Empresas - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Lista completa de empresas - MRx Compliance.");
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return empresas;
    return empresas.filter((e) =>
      [e.nome, e.cnpj, e.responsavel, e.email].some((v) => v?.toLowerCase().includes(term))
    );
  }, [empresas, q]);

  const countByEmpresa = useMemo(() => {
    const map: Record<string, { total: number; ativos: number }> = {};
    for (const e of empresas) map[e.id] = { total: 0, ativos: 0 };
    for (const c of colaboradores) {
      if (!map[c.empresa_id]) map[c.empresa_id] = { total: 0, ativos: 0 };
      map[c.empresa_id].total += 1;
      if (c.status === "ATIVO") map[c.empresa_id].ativos += 1;
    }
    return map;
  }, [empresas, colaboradores]);

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-sm text-muted-foreground">Acesse os detalhes de todas as empresas</p>
      </header>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ, responsável ou e-mail"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map((empresa) => {
          const stats = countByEmpresa[empresa.id] || { total: 0, ativos: 0 };
          const complianceKey = `auditoria-${empresa.id}`;
          let compliance = 0;
          try {
            const data = localStorage.getItem(complianceKey);
            if (data) {
              const auditoria = JSON.parse(data) as { itens: any[] };
              const docs = auditoria.itens.filter((i) => i.documento && i.documento.trim() !== "");
              const ok = docs.filter((i) => i.status === "ENTREGUE").length;
              compliance = docs.length ? Math.round((ok / docs.length) * 100) : 0;
            }
          } catch {}

          return (
            <Card key={empresa.id} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/empresa/${empresa.id}`)} className="gap-2">
                    <Eye className="h-4 w-4" /> Ver detalhes
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a empresa "{empresa.nome}"? 
                          Esta ação também removerá todos os colaboradores associados e não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removerEmpresa(empresa.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{empresa.endereco}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.ativos}</div>
                    <div className="text-xs text-muted-foreground">Ativos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{compliance}%</div>
                    <div className="text-xs text-muted-foreground">Compliance</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Compliance</span>
                    <span>{compliance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${compliance}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default Empresas;
