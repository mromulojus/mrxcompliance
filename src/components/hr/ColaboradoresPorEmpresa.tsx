import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ChevronLeft, ChevronRight, User, Mail, Phone } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface ColaboradoresPorEmpresaProps {
  empresaId: string;
  empresaNome: string;
}

export function ColaboradoresPorEmpresa({ empresaId, empresaNome }: ColaboradoresPorEmpresaProps) {
  const { colaboradores } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar colaboradores por empresa e termo de busca
  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter(colaborador => {
      const matchesEmpresa = colaborador.empresa_id === empresaId;
      const matchesSearch = searchTerm === "" || 
        colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.cpf.includes(searchTerm) ||
        colaborador.cargo.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesEmpresa && matchesSearch;
    });
  }, [colaboradores, empresaId, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredColaboradores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentColaboradores = filteredColaboradores.slice(startIndex, endIndex);

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800';
      case 'INATIVO':
        return 'bg-gray-100 text-gray-800';
      case 'DEMITIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Colaboradores - {empresaNome}</h2>
          <p className="text-muted-foreground">
            {filteredColaboradores.length} colaboradores encontrados
          </p>
        </div>
      </div>

      {/* Campo de Busca com Autocomplete */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, CPF ou cargo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-muted-foreground">
              Mostrando resultados para "{searchTerm}"
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Colaboradores */}
      <div className="grid grid-cols-1 gap-4">
        {currentColaboradores.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                  : 'Esta empresa ainda não possui colaboradores cadastrados.'
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => handleSearch("")}
                  className="mt-4"
                >
                  Limpar busca
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          currentColaboradores.map((colaborador) => (
            <Card key={colaborador.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(colaborador.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{colaborador.nome}</h3>
                        <Badge className={getStatusColor(colaborador.status)}>
                          {colaborador.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{colaborador.email}</span>
                        </div>
                        
                        {colaborador.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{formatPhone(colaborador.telefone)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{colaborador.cargo}</div>
                    <div className="text-sm text-muted-foreground">{colaborador.departamento}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      CPF: {colaborador.cpf}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      {filteredColaboradores.length > itemsPerPage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredColaboradores.length)} de {filteredColaboradores.length} colaboradores
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}