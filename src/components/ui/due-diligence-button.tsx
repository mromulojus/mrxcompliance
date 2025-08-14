import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DueDiligenceButtonProps {
  entityType: "empresa" | "devedor" | "colaborador";
  entityId: string;
  entityName: string;
  disabled?: boolean;
}

interface EnrichmentHistory {
  id: string;
  date: string;
  status: "success" | "pending" | "error";
  changes: string[];
  apiResponse: Record<string, any>;
}

export function DueDiligenceButton({ 
  entityType, 
  entityId, 
  entityName, 
  disabled = false 
}: DueDiligenceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [history, setHistory] = useState<EnrichmentHistory[]>([]);

  const handleDueDiligence = async () => {
    setIsRunning(true);
    setCurrentStatus("running");
    
    try {
      // Simular chamada da API de enriquecimento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simular resposta da API
      const mockResponse = {
        updated_fields: ["email", "telefone", "endereco"],
        data: {
          email: "contato@empresa.com",
          telefone: "(11) 99999-9999",
          endereco: "Rua Atualizada, 123"
        },
        confidence_score: 0.95
      };

      const newHistoryEntry: EnrichmentHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: "success",
        changes: ["Email atualizado", "Telefone verificado", "Endereço confirmado"],
        apiResponse: mockResponse
      };

      setHistory(prev => [newHistoryEntry, ...prev]);
      setCurrentStatus("success");
      
      toast.success("Due Diligence concluído com sucesso!");
      
    } catch (error) {
      setCurrentStatus("error");
      toast.error("Erro ao executar Due Diligence");
    } finally {
      setIsRunning(false);
      setTimeout(() => setCurrentStatus("idle"), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "error": return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default: return <Badge variant="outline">Não executado</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Due Diligence
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Due Diligence - {entityName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Execução</CardTitle>
              <CardDescription>
                Execute o enriquecimento de dados para atualizar informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentStatus)}
                  <span className="font-medium">
                    {currentStatus === "running" && "Executando..."}
                    {currentStatus === "success" && "Concluído com sucesso"}
                    {currentStatus === "error" && "Erro na execução"}
                    {currentStatus === "idle" && "Pronto para executar"}
                  </span>
                </div>
                {getStatusBadge(currentStatus)}
              </div>
              
              <Button 
                onClick={handleDueDiligence}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? "Executando..." : "Executar Due Diligence"}
              </Button>
            </CardContent>
          </Card>

          {/* Histórico de Enriquecimento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Enriquecimento</CardTitle>
              <CardDescription>
                Registro de todas as execuções e alterações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma execução registrada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.status)}
                          <span className="font-medium">
                            {new Date(entry.date).toLocaleString()}
                          </span>
                        </div>
                        {getStatusBadge(entry.status)}
                      </div>
                      
                      {entry.changes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Alterações realizadas:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {entry.changes.map((change, index) => (
                              <li key={index}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}