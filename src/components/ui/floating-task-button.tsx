import React from "react";
import { motion } from "framer-motion";
import { Plus, KanbanSquare, Save } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(1, "Informe um título"),
  description: z.string().optional(),
  module: z.enum(["Ouvidoria", "Auditoria", "Cobranças"]).default("Ouvidoria"),
  company: z.string().optional(),
  contextId: z.string().optional(),
  assignee: z.string().optional(),
  status: z.enum(["A Fazer", "Em Andamento", "Em Revisão", "Concluído"]).default("A Fazer"),
  priority: z.enum(["Alta", "Média", "Baixa"]).default("Média"),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FloatingTaskButton() {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "A Fazer", priority: "Média", module: "Ouvidoria" },
  });

  const formValues = watch();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !open) setOpen(true);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      // Aqui integrar com Supabase no futuro
      console.debug("Auto-saving task draft", formValues);
    }, 3000);
    return () => clearInterval(interval);
  }, [open, formValues]);

  const onSubmit = async (data: FormValues) => {
    console.log("Create task", data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Nova Tarefa"
        >
          <div className="absolute -top-2 -right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] shadow-sm">
            Nova Tarefa
          </div>
          <div className="grid place-items-center h-full w-full">
            <Logo variant="icon" size="sm" />
          </div>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5" /> Criar Tarefa
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" autoFocus placeholder="Ex.: Revisar contrato social" {...register("title")} />
          </div>

          <div>
            <Label>Módulo de origem</Label>
            <Select onValueChange={(v) => setValue("module", v as FormValues["module"]) }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ouvidoria">Ouvidoria</SelectItem>
                <SelectItem value="Auditoria">Auditoria</SelectItem>
                <SelectItem value="Cobranças">Cobranças</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Empresa</Label>
            <Input placeholder="Empresa (ex.: ACME S.A.)" {...register("company")} />
          </div>

          <div>
            <Label>Processo/Denúncia/Dívida</Label>
            <Input placeholder="#ID ou referência" {...register("contextId")} />
          </div>

          <div>
            <Label>Responsável</Label>
            <Input placeholder="Usuário responsável" {...register("assignee")} />
          </div>

          <div>
            <Label>Status</Label>
            <Select onValueChange={(v) => setValue("status", v as FormValues["status"]) }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A Fazer">A Fazer</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prioridade</Label>
            <Select onValueChange={(v) => setValue("priority", v as FormValues["priority"]) }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vencimento</Label>
            <Input type="date" {...register("dueDate")} />
          </div>

          <div className="md:col-span-2">
            <Label>Descrição</Label>
            <Textarea rows={4} placeholder="Detalhes da tarefa" {...register("description")} />
          </div>

          <div className="md:col-span-2">
            <Label>Anexos</Label>
            <Input type="file" multiple />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

