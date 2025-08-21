import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import {
  Settings2,
  Activity,
  ListTree,
  Users,
  BookText,
} from "lucide-react";

export function OptionsMenu() {
  const { profile } = useAuth();

  // Apenas administradores e superusers têm acesso ao menu de opções
  if (!profile?.role || (profile.role !== 'administrador' && profile.role !== 'superuser')) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Opções</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Administração</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/admin/system-data" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Dados do Sistema</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/structure" className="flex items-center gap-2">
            <ListTree className="h-4 w-4" />
            <span>Estrutura</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/docs" className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            <span>Documentação</span>
          </Link>
        </DropdownMenuItem>
        {profile?.role === "superuser" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/admin/activity-log"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                <span>Log de Atividades</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OptionsMenu;

