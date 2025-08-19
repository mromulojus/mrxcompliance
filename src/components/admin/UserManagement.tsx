import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserDepartmentsModal } from "@/components/admin/UserDepartmentsModal";

type DatabaseRole = "superuser" | "administrador" | "empresarial" | "operacional";

type UserRecord = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: DatabaseRole;
  is_active: boolean;
  created_at: string;
  empresa_ids: string[];
};

type UserManagementProps = {
  users: UserRecord[];
  onUserChange: () => void;
  canCreateUsers?: boolean;
  canDeleteUsers?: boolean;
};

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUserChange,
  canCreateUsers = false,
  canDeleteUsers = false,
}) => {
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [activeUserId, setActiveUserId] = useState<string | undefined>();
  const [newPassword, setNewPassword] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);

  const activeUser = useMemo(() => users.find((u) => u.id === activeUserId), [users, activeUserId]);

  const openFor = (userId: string, action: "edit" | "delete" | "change-password" | "departments") => {
    setActiveUserId(userId);
    if (action === "edit") setEditOpen(true);
    if (action === "delete") setDeleteOpen(true);
    if (action === "change-password") setPasswordOpen(true);
    if (action === "departments") setDepartmentsOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteOpen(false);
    toast({ title: "Usuário excluído", description: "Ação simulada para build.", variant: "default" });
    onUserChange();
  };

  const handleConfirmEdit = () => {
    setEditOpen(false);
    toast({ title: "Usuário atualizado", description: "Ação simulada para build.", variant: "default" });
    onUserChange();
  };

  const handleConfirmPassword = () => {
    setPasswordOpen(false);
    setNewPassword("");
    toast({ title: "Senha alterada", description: "Ação simulada para build.", variant: "default" });
  };

  return (
    <div className="flex items-center gap-2">
      {canCreateUsers && (
        <Button type="button" onClick={() => toast({ title: "Criar usuário", description: "Ação simulada para build." })}>
          Novo Usuário
        </Button>
      )}

      {/* Hidden trigger buttons to be clicked programmatically by the Users page */}
      {users.map((u) => (
        <div key={u.id} className="sr-only">
          <button data-user-id={u.id} data-action="edit" onClick={() => openFor(u.id, "edit")}>edit</button>
          <button data-user-id={u.id} data-action="delete" onClick={() => openFor(u.id, "delete")} disabled={!canDeleteUsers}>
            delete
          </button>
          <button data-user-id={u.id} data-action="change-password" onClick={() => openFor(u.id, "change-password")}>
            change-password
          </button>
          <button data-user-id={u.id} data-action="departments" onClick={() => openFor(u.id, "departments")}>
            departments
          </button>
        </div>
      ))}

      {/* Edit user dialog (minimal placeholder) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{activeUser?.username}</div>
            <Button type="button" variant="outline" onClick={() => setDepartmentsOpen(true)}>
              Vincular Departamentos
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
          </DialogHeader>
          <div className="text-sm">Tem certeza que deseja excluir {activeUser?.username}?</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={!canDeleteUsers}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmPassword} disabled={!newPassword}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Departments association */}
      <UserDepartmentsModal
        open={departmentsOpen}
        onOpenChange={setDepartmentsOpen}
        userId={activeUserId}
        selectedDepartmentIds={selectedDepartments}
        onSelectedChange={setSelectedDepartments}
        onSaved={onUserChange}
      />
    </div>
  );
};

export default UserManagement;