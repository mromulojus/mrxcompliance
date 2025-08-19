import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

type DepartmentRecord = {
  id: string;
  name: string;
  business_unit?: string | null;
};

type UserDepartmentsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string; // se fornecido, salva imediatamente no Supabase
  selectedDepartmentIds: string[]; // seleção atual
  onSelectedChange: (departmentIds: string[]) => void; // callback para atualizar seleção no pai
  onSaved?: () => void; // chamado após salvar no servidor (modo edição)
};

export const UserDepartmentsModal: React.FC<UserDepartmentsModalProps> = ({
  open,
  onOpenChange,
  userId,
  selectedDepartmentIds,
  onSelectedChange,
  onSaved,
}) => {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [working, setWorking] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedDepartmentIds);

  useEffect(() => {
    setLocalSelection(selectedDepartmentIds);
  }, [selectedDepartmentIds, open]);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!open) return;
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, business_unit, is_active")
        .eq("is_active", true)
        .order("name");
      if (!error && data) {
        setDepartments(data as any);
      } else {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, [open]);

  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => a.name.localeCompare(b.name));
  }, [departments]);

  const toggleDepartment = (deptId: string, checked: boolean) => {
    setLocalSelection((prev) => {
      if (checked) return prev.includes(deptId) ? prev : [...prev, deptId];
      return prev.filter((id) => id !== deptId);
    });
  };

  const handleSave = async () => {
    onSelectedChange(localSelection);
    if (!userId) {
      onOpenChange(false);
      return;
    }
    try {
      setWorking(true);
      // limitar o escopo de remoção/inserção aos departamentos ativos carregados (escopo do sistema)
      const scopedDeptIds = departments.map((d) => d.id);
      const { data: existing, error: existingErr } = await supabase
        .from("user_departments")
        .select("department_id")
        .eq("user_id", userId)
        .in("department_id", scopedDeptIds);
      if (existingErr) throw existingErr;
      const existingIds = (existing || []).map((e: any) => e.department_id as string);
      const toAdd = localSelection.filter((id) => !existingIds.includes(id));
      const toRemove = existingIds.filter((id) => !localSelection.includes(id));

      if (toRemove.length > 0) {
        await supabase
          .from("user_departments")
          .delete()
          .eq("user_id", userId)
          .in("department_id", toRemove);
      }

      if (toAdd.length > 0) {
        const rows = toAdd.map((id) => ({
          user_id: userId,
          department_id: id,
          role_in_department: "member",
          is_primary: false,
        }));
        await supabase.from("user_departments").insert(rows);
      }

      onOpenChange(false);
      onSaved?.();
    } catch (_e) {
      // silencioso; o chamador pode exibir toast se necessário
      onOpenChange(false);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vincular Departamentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {sortedDepartments.map((dept) => {
            const label = dept.business_unit ? `${dept.name} (${dept.business_unit})` : dept.name;
            const checked = localSelection.includes(dept.id);
            return (
              <div key={dept.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`dept-${dept.id}`}
                  checked={checked}
                  onChange={(e) => toggleDepartment(dept.id, e.target.checked)}
                />
                <Label htmlFor={`dept-${dept.id}`} className="text-sm">{label}</Label>
              </div>
            );
          })}
          {sortedDepartments.length === 0 && (
            <div className="text-xs text-muted-foreground">Nenhum departamento ativo.</div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={working}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={working}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDepartmentsModal;

