import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  FileX, 
  Upload, 
  Plus, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  Download,
  Edit,
  Trash2,
  History
} from 'lucide-react';
import { ItemAuditoria, type AuditoriaEmpresa as IAuditoriaEmpresa, ITENS_AUDITORIA_PADRAO, StatusAuditoria, HistoricoMovimento } from '@/types/auditoria';
import { toast } from 'sonner';
import { HistoricoAuditoria } from './HistoricoAuditoria';

interface AuditoriaEmpresaProps {
  empresaId: string;
  nomeEmpresa: string;
}

export function AuditoriaEmpresa({ empresaId, nomeEmpresa }: AuditoriaEmpresaProps) {
  const [auditoria, setAuditoria] = useState<IAuditoriaEmpresa | null>(null);
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemAuditoria | null>(null);
  const [historicoAberto, setHistoricoAberto] = useState<ItemAuditoria | null>(null);
  const [novoItem, setNovoItem] = useState({
    categoria: '',
    documento: ''
  });

  // Inicializar auditoria se não existir
  useEffect(() => {
    // Simular carregamento de dados da auditoria
    const auditoriaExistente = localStorage.getItem(`auditoria-${empresaId}`);
    
    if (auditoriaExistente) {
      setAuditoria(JSON.parse(auditoriaExistente));
    } else {
      // Criar nova auditoria com itens padrão
        const novaAuditoria: IAuditoriaEmpresa = {
        empresa_id: empresaId,
        itens: ITENS_AUDITORIA_PADRAO.map((item, index) => ({
          ...item,
          id: `item-${index + 1}`,
          historico: []
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAuditoria(novaAuditoria);
      localStorage.setItem(`auditoria-${empresaId}`, JSON.stringify(novaAuditoria));
    }
  }, [empresaId]);

  const salvarAuditoria = (novaAuditoria: IAuditoriaEmpresa) => {
    const auditoriaAtualizada = {
      ...novaAuditoria,
      updated_at: new Date().toISOString()
    };
    setAuditoria(auditoriaAtualizada);
    localStorage.setItem(`auditoria-${empresaId}`, JSON.stringify(auditoriaAtualizada));
  };

  const atualizarItem = (itemId: string, updates: Partial<ItemAuditoria>, adicionarHistorico: boolean = true) => {
    if (!auditoria) return;

    const itensAtualizados = auditoria.itens.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, ...updates };
        
        if (adicionarHistorico) {
          const novoHistorico: HistoricoMovimento = {
            id: `hist-${Date.now()}`,
            data: new Date().toISOString(),
            usuario: 'Usuário Atual',
            tipo: updates.status ? 'STATUS_MUDANCA' : 
                  updates.data_vencimento ? 'VENCIMENTO_ALTERADO' : 'STATUS_MUDANCA',
            descricao: updates.status ? `Status alterado para: ${updates.status}` :
                      updates.data_vencimento ? `Vencimento alterado para: ${updates.data_vencimento}` :
                      'Item atualizado'
          };
          
          itemAtualizado.historico = [...(item.historico || []), novoHistorico];
        }
        
        return itemAtualizado;
      }
      return item;
    });

    salvarAuditoria({
      ...auditoria,
      itens: itensAtualizados
    });

    toast.success('Item atualizado com sucesso!');
  };

  const adicionarNovoItem = () => {
    if (!auditoria || !novoItem.categoria || !novoItem.documento) {
      toast.error('Categoria e documento são obrigatórios');
      return;
    }

    const novoItemCompleto: ItemAuditoria = {
      id: `item-${Date.now()}`,
      categoria: novoItem.categoria,
      documento: novoItem.documento,
      status: 'NAO_SOLICITADO',
      historico: [{
        id: `hist-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: 'Usuário Atual',
        tipo: 'COMENTARIO',
        descricao: 'Item criado'
      }]
    };

    salvarAuditoria({
      ...auditoria,
      itens: [...auditoria.itens, novoItemCompleto]
    });

    setNovoItem({ categoria: '', documento: '' });
    setShowNovoItem(false);
    toast.success('Novo item adicionado com sucesso!');
  };

  const removerItem = (itemId: string) => {
    if (!auditoria) return;

    const itensAtualizados = auditoria.itens.filter(item => item.id !== itemId);
    
    salvarAuditoria({
      ...auditoria,
      itens: itensAtualizados
    });

    toast.success('Item removido com sucesso!');
  };

  const handleUploadArquivo = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload (em produção, usar Supabase Storage)
      const fakeUrl = URL.createObjectURL(file);
      
      // Buscar o item atual para incluir histórico correto
      const itemAtual = auditoria?.itens.find(item => item.id === itemId);
      const novoHistorico: HistoricoMovimento = {
        id: `hist-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: 'Usuário Atual',
        tipo: 'ARQUIVO_UPLOAD',
        descricao: `Arquivo "${file.name}" enviado`
      };

      atualizarItem(itemId, {
        arquivo_url: fakeUrl,
        arquivo_nome: file.name,
        status: 'ENTREGUE',
        data_entrega: new Date().toISOString().split('T')[0],
        historico: [...(itemAtual?.historico || []), novoHistorico]
      }, false);
      
      toast.success('Arquivo enviado com sucesso!');
    }
  };

  const getStatusBadge = (status: StatusAuditoria) => {
    switch (status) {
      case 'NAO_SOLICITADO':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <FileX className="h-3 w-3 mr-1" />
            Não Solicitado
          </Badge>
        );
      case 'SOLICITADO':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Solicitado
          </Badge>
        );
      case 'ENTREGUE':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Entregue
          </Badge>
        );
    }
  };

  const editarItem = (item: ItemAuditoria) => {
    setEditingItem(item);
  };

  const salvarEdicaoItem = () => {
    if (!editingItem) return;
    
    atualizarItem(editingItem.id, {
      documento: editingItem.documento
    });
    
    setEditingItem(null);
  };

  const abrirHistorico = (item: ItemAuditoria) => {
    setHistoricoAberto(item);
  };

  const adicionarComentarioHistorico = (comentario: string) => {
    if (!historicoAberto) return;

    const novoHistorico: HistoricoMovimento = {
      id: `hist-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: 'Usuário Atual',
      tipo: 'COMENTARIO',
      descricao: 'Comentário adicionado',
      comentario
    };

    atualizarItem(historicoAberto.id, {
      historico: [...(historicoAberto.historico || []), novoHistorico]
    }, false);
  };

  if (!auditoria) {
    return <div>Carregando auditoria...</div>;
  }

  const itensEntregues = auditoria.itens.filter(item => item.documento && item.status === 'ENTREGUE').length;
  const itensSolicitados = auditoria.itens.filter(item => item.documento && item.status === 'SOLICITADO').length;
  const totalItens = auditoria.itens.filter(item => item.documento && item.documento.trim() !== '').length; // Excluir títulos de categoria
  const percentualCompleto = totalItens > 0 ? Math.round((itensEntregues / totalItens) * 100) : 0;

  // Agrupar por categoria
  const categorias = auditoria.itens.reduce((acc, item) => {
    if (item.categoria && !item.documento) {
      // É um título de categoria
      acc[item.categoria] = [];
    }
    return acc;
  }, {} as Record<string, ItemAuditoria[]>);

  let categoriaAtual = '';
  auditoria.itens.forEach(item => {
    if (item.categoria && !item.documento) {
      categoriaAtual = item.categoria;
    } else if (item.documento) {
      categorias[categoriaAtual]?.push(item);
    }
  });

  // Obter lista de categorias para o select
  const categoriasDisponiveis = Object.keys(categorias);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItens}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{itensSolicitados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{itensEntregues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{percentualCompleto}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs por categoria */}
      <Tabs defaultValue={Object.keys(categorias)[0]} className="w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            {Object.keys(categorias).map((categoria) => (
              <TabsTrigger key={categoria} value={categoria} className="text-xs">
                {categoria.split('.')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <Dialog open={showNovoItem} onOpenChange={setShowNovoItem}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item de Auditoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select 
                    value={novoItem.categoria} 
                    onValueChange={(value) => setNovoItem(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasDisponiveis.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Documento/Política</label>
                  <Input
                    value={novoItem.documento}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, documento: e.target.value }))}
                    placeholder="Nome do documento ou política"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={adicionarNovoItem}>Adicionar</Button>
                  <Button variant="outline" onClick={() => setShowNovoItem(false)}>Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {Object.entries(categorias).map(([categoria, itens]) => (
          <TabsContent key={categoria} value={categoria}>
            <Card>
              <CardHeader>
                <CardTitle>{categoria}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento/Política</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Data Entrega</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Histórico</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {editingItem?.id === item.id ? (
                            <Input
                              value={editingItem.documento}
                              onChange={(e) => setEditingItem(prev => prev ? {...prev, documento: e.target.value} : null)}
                              className="w-full"
                            />
                          ) : (
                            item.documento
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={item.status}
                            onValueChange={(value) => atualizarItem(item.id, { status: value as StatusAuditoria })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NAO_SOLICITADO">Não Solicitado</SelectItem>
                              <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                              <SelectItem value="ENTREGUE">Entregue</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.data_entrega || ''}
                            onChange={(e) => atualizarItem(item.id, { data_entrega: e.target.value })}
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.data_vencimento || ''}
                            onChange={(e) => atualizarItem(item.id, { data_vencimento: e.target.value })}
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirHistorico(item)}
                            className="flex items-center gap-1"
                          >
                            <History className="h-3 w-3" />
                            Histórico ({item.historico?.length || 0})
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {item.arquivo_url ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.arquivo_nome}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : null}
                            <div>
                              <input
                                type="file"
                                id={`file-${item.id}`}
                                className="hidden"
                                onChange={(e) => handleUploadArquivo(item.id, e)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                                className="flex items-center gap-1"
                              >
                                <Upload className="h-3 w-3" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {editingItem?.id === item.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={salvarEdicaoItem}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItem(null)}
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editarItem(item)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removerItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog de edição */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Item de Auditoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Documento/Política</label>
                <Input
                  value={editingItem.documento}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, documento: e.target.value} : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={salvarEdicaoItem}>Salvar</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Histórico de Auditoria */}
      {historicoAberto && (
        <HistoricoAuditoria
          isOpen={!!historicoAberto}
          onClose={() => setHistoricoAberto(null)}
          documento={historicoAberto.documento}
          historico={historicoAberto.historico || []}
          onAdicionarComentario={adicionarComentarioHistorico}
        />
      )}
    </div>
  );
}