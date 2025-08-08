import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Calendar, Clock } from 'lucide-react';

interface PainelAvisosProps {
  empresaId: string;
}

export function PainelAvisos({ empresaId }: PainelAvisosProps) {
  // Buscar dados da auditoria para verificar documentos próximos ao vencimento
  const getAuditoriaData = () => {
    try {
      const data = localStorage.getItem(`auditoria-${empresaId}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const auditoria = getAuditoriaData();
  
  // Verificar documentos próximos ao vencimento (próximos 30 dias)
  const hoje = new Date();
  const proximosTrintaDias = new Date();
  proximosTrintaDias.setDate(hoje.getDate() + 30);

  const documentosVencendo = auditoria?.itens?.filter((item: any) => {
    if (!item.vencimento || item.status !== 'ENTREGUE') return false;
    
    const vencimento = new Date(item.vencimento);
    return vencimento >= hoje && vencimento <= proximosTrintaDias;
  }) || [];

  const documentosVencidos = auditoria?.itens?.filter((item: any) => {
    if (!item.vencimento) return false;
    
    const vencimento = new Date(item.vencimento);
    return vencimento < hoje;
  }) || [];

  const documentosPendentes = auditoria?.itens?.filter((item: any) => {
    return item.documento && item.documento.trim() !== '' && item.status !== 'ENTREGUE';
  }) || [];

  const temAvisos = documentosVencendo.length > 0 || documentosVencidos.length > 0 || documentosPendentes.length > 0;

  if (!temAvisos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <FileText className="h-5 w-5" />
            Painel de Avisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Nenhum aviso no momento. Todos os documentos estão em dia!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Painel de Avisos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Documentos Vencidos */}
        {documentosVencidos.length > 0 && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Documentos Vencidos</span>
                <Badge variant="destructive">{documentosVencidos.length}</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {documentosVencidos.slice(0, 3).map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{doc.documento}</span>
                    <span className="text-xs text-muted-foreground">
                      Venceu em {new Date(doc.vencimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                {documentosVencidos.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{documentosVencidos.length - 3} outros documentos vencidos
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Documentos Vencendo */}
        {documentosVencendo.length > 0 && (
          <Alert className="border-warning bg-warning/10">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Documentos Vencendo (próximos 30 dias)</span>
                <Badge className="bg-warning text-warning-foreground">{documentosVencendo.length}</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {documentosVencendo.slice(0, 3).map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{doc.documento}</span>
                    <span className="text-xs text-muted-foreground">
                      Vence em {new Date(doc.vencimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                {documentosVencendo.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{documentosVencendo.length - 3} outros documentos vencendo
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Documentos Pendentes */}
        {documentosPendentes.length > 0 && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Documentos Pendentes</span>
                <Badge variant="secondary">{documentosPendentes.length}</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {documentosPendentes.slice(0, 3).map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{doc.documento}</span>
                    <Badge variant="outline" className="text-xs">
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                {documentosPendentes.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{documentosPendentes.length - 3} outros documentos pendentes
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}