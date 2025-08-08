import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useSupabaseData, Empresa } from '@/hooks/useSupabaseData';

interface FormEmpresaProps {
  empresa?: Empresa;
  onSalvar?: () => void;
  onCancelar?: () => void;
}

export function FormEmpresa({ empresa, onSalvar, onCancelar }: FormEmpresaProps) {
  const { adicionarEmpresa, editarEmpresa } = useSupabaseData();
  
  const [form, setForm] = useState({
    nome: empresa?.nome || '',
    cnpj: empresa?.cnpj || '',
    endereco: empresa?.endereco || '',
    responsavel: empresa?.responsavel || '',
    email: empresa?.email || '',
    telefone: empresa?.telefone || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const newErrors: Record<string, string> = {};
    if (!form.nome) newErrors.nome = 'Nome é obrigatório';
    if (!form.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';
    if (!form.endereco) newErrors.endereco = 'Endereço é obrigatório';
    if (!form.responsavel) newErrors.responsavel = 'Nome do responsável é obrigatório';
    if (!form.email) newErrors.email = 'Email é obrigatório';
    if (!form.telefone) newErrors.telefone = 'Telefone é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (empresa) {
      editarEmpresa(empresa.id, form);
    } else {
      adicionarEmpresa(form);
    }
    
    onSalvar?.();
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {empresa ? 'Editar Empresa' : 'Nova Empresa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome da empresa"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="XX.XXX.XXX/XXXX-XX"
                className={errors.cnpj ? 'border-red-500' : ''}
              />
              {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Endereço completo da empresa"
              className={errors.endereco ? 'border-red-500' : ''}
            />
            {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="responsavel">Nome do Responsável *</Label>
              <Input
                id="responsavel"
                value={form.responsavel}
                onChange={(e) => handleChange('responsavel', e.target.value)}
                placeholder="Nome completo do responsável"
                className={errors.responsavel ? 'border-red-500' : ''}
              />
              {errors.responsavel && <p className="text-red-500 text-sm mt-1">{errors.responsavel}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@empresa.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="submit">
              {empresa ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}