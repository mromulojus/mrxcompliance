import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserProfile } from '@/types/tarefas';

interface MultipleAssigneeDisplayProps {
  responsaveis?: UserProfile[];
  maxDisplay?: number;
}

export function MultipleAssigneeDisplay({ responsaveis = [], maxDisplay = 3 }: MultipleAssigneeDisplayProps) {
  if (!responsaveis || responsaveis.length === 0) {
    return null;
  }

  const visibleAssignees = responsaveis.slice(0, maxDisplay);
  const remainingCount = Math.max(0, responsaveis.length - maxDisplay);

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {visibleAssignees.map((responsavel, index) => (
          <Tooltip key={responsavel.user_id}>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage 
                  src={responsavel.avatar_url} 
                  alt={responsavel.full_name}
                />
                <AvatarFallback className="text-xs">
                  {responsavel.full_name
                    .split(' ')
                    .slice(0, 2)
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{responsavel.full_name}</p>
              <p className="text-xs text-muted-foreground">@{responsavel.username}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {responsaveis.slice(maxDisplay).map(responsavel => (
                  <p key={responsavel.user_id}>{responsavel.full_name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}