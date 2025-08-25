import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, Palette, Users, X } from 'lucide-react';
import { BoardModule } from '@/hooks/useTaskBoards';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BoardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BoardFormData) => Promise<void>;
  initialData?: Partial<BoardFormData>;
  title: string;
}

export interface BoardFormData {
  name: string;
  modulos: BoardModule[];
  background_color: string;
  background_image?: string;
  is_public: boolean;
  empresa_id?: string;
}

const moduleLabels: Record<BoardModule, string> = {
  vendas: 'Vendas (xGROWTH)',
  compliance: 'Compliance (Mrx)',
  juridico: 'Jurídico (MR Advocacia)',
  ouvidoria: 'Ouvidoria (Ouve.ai)',
  cobranca: 'Cobrança (Debto)',
  administrativo: 'Administrativo',
  geral: 'Geral'
};

const moduleColors: Record<BoardModule, string> = {
  vendas: '#10B981',
  compliance: '#3B82F6',
  juridico: '#8B5CF6',
  ouvidoria: '#F59E0B',
  cobranca: '#EF4444',
  administrativo: '#6B7280',
  geral: '#9CA3AF'
};

export function BoardFormModal({ isOpen, onClose, onSubmit, initialData, title }: BoardFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BoardFormData>({
    name: '',
    modulos: ['geral'],
    background_color: '#ffffff',
    is_public: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        modulos: initialData.modulos || ['geral'],
        background_color: initialData.background_color || '#ffffff',
        background_image: initialData.background_image,
        is_public: initialData.is_public ?? true,
        empresa_id: initialData.empresa_id,
      });
      if (initialData.background_image) {
        setImagePreview(initialData.background_image);
      }
    }
  }, [initialData]);

  const handleModuleToggle = (module: BoardModule) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.includes(module)
        ? prev.modulos.filter(m => m !== module)
        : [...prev.modulos, module]
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `board-backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tarefas-anexos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('tarefas-anexos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do quadro é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (formData.modulos.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos um módulo",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let backgroundImageUrl = formData.background_image;
      
      if (imageFile) {
        backgroundImageUrl = await handleImageUpload(imageFile);
      }

      await onSubmit({
        ...formData,
        background_image: backgroundImageUrl
      });
      
      onClose();
      setFormData({
        name: '',
        modulos: ['geral'],
        background_color: '#ffffff',
        is_public: true,
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erro ao salvar quadro:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar quadro",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Quadro */}
          <div>
            <Label htmlFor="name">Nome do Quadro</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do quadro"
              className="mt-1"
            />
          </div>

          {/* Seleção de Módulos */}
          <div>
            <Label>Módulos Vinculados</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {Object.entries(moduleLabels).map(([module, label]) => (
                <div key={module} className="flex items-center space-x-2">
                  <Checkbox
                    id={module}
                    checked={formData.modulos.includes(module as BoardModule)}
                    onCheckedChange={() => handleModuleToggle(module as BoardModule)}
                  />
                  <Label htmlFor={module} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: moduleColors[module as BoardModule] }}
                    />
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.modulos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.modulos.map(module => (
                  <Badge 
                    key={module} 
                    style={{ backgroundColor: moduleColors[module] }}
                    className="text-white"
                  >
                    {moduleLabels[module]}
                    <button
                      type="button"
                      onClick={() => handleModuleToggle(module)}
                      className="ml-2 hover:bg-white/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Personalização Visual */}
          <div className="space-y-4">
            <Label>Personalização Visual</Label>
            
            {/* Cor de Fundo */}
            <div>
              <Label htmlFor="background_color" className="text-sm">Cor de Fundo</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  id="background_color"
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Imagem de Fundo */}
            <div>
              <Label htmlFor="background_image" className="text-sm">Imagem de Fundo</Label>
              <div className="mt-1">
                <input
                  type="file"
                  id="background_image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('background_image')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher Imagem
                </Button>
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, background_image: undefined }));
                      }}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configurações de Privacidade */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Configurações de Acesso
            </Label>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
              />
              <Label htmlFor="is_public">
                Quadro público (todos podem ver)
              </Label>
            </div>
            {!formData.is_public && (
              <p className="text-sm text-muted-foreground mt-1">
                Você poderá gerenciar permissões específicas após criar o quadro
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}