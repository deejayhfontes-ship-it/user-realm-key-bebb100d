import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function ClientFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 h-12 bg-card border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px] h-12 bg-card border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-0 shadow-lg">
          <SelectItem value="all" className="rounded-xl">Todos</SelectItem>
          <SelectItem value="active" className="rounded-xl">Ativos</SelectItem>
          <SelectItem value="inactive" className="rounded-xl">Inativos</SelectItem>
          <SelectItem value="blocked" className="rounded-xl">Bloqueados</SelectItem>
          <SelectItem value="expired" className="rounded-xl">Expirados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}