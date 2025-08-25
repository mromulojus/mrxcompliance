import React from "react";
import { ArrowLeft, Star, Users, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrelloLayoutProps {
  boardName: string;
  boardId: string;
  isPrivate?: boolean;
  children: React.ReactNode;
  onBoardUpdate?: (updates: { name?: string; is_private?: boolean }) => void;
  members?: Array<{
    user_id: string;
    full_name?: string;
    username: string;
    avatar_url?: string;
  }>;
}

export const TrelloLayout: React.FC<TrelloLayoutProps> = ({
  boardName,
  boardId,
  isPrivate = false,
  children,
  onBoardUpdate,
  members = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      {/* Header */}
      <div className="flex items-center justify-between p-2 text-white">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tarefas')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quadros
          </Button>
          
          <div className="h-6 w-px bg-white/30" />
          
          <h1 className="text-lg font-semibold cursor-pointer hover:bg-white/20 px-2 py-1 rounded">
            {boardName}
          </h1>
          
          <Badge variant="secondary" className="text-xs">
            {isPrivate ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Privado
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Público
              </>
            )}
          </Badge>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Members */}
          {members.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member) => (
                  <Avatar key={member.user_id} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {(member.full_name || member.username)
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-500 text-white text-xs flex items-center justify-center">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Board menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                Adicionar aos favoritos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Configurações do quadro
              </DropdownMenuItem>
              <DropdownMenuItem>
                Atividade
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Arquivar quadro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};