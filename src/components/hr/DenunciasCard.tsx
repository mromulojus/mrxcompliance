import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHR } from '@/context/HRContext';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DenunciasCard() {
  const { denunciasNaoTratadas } = useHR();
  const navigate = useNavigate();

  const handleVerDenuncias = () => {
    navigate('/denuncias/dashboard');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-orange-900">Denúncias Não Tratadas</CardTitle>
        <AlertTriangle className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-orange-900">{denunciasNaoTratadas.length}</div>
            <p className="text-xs text-orange-700 mt-1">
              Aguardando análise
            </p>
          </div>
          {denunciasNaoTratadas.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleVerDenuncias}
              className="border-orange-300 hover:bg-orange-100"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Todas
            </Button>
          )}
        </div>
        
        {denunciasNaoTratadas.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-orange-800">Últimas denúncias:</div>
            {denunciasNaoTratadas.slice(0, 3).map((denuncia) => (
              <div key={denuncia.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-mono">{denuncia.protocolo}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {denuncia.tipo.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}