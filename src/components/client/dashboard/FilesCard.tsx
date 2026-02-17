import { Link } from 'react-router-dom';
import { FolderOpen, FileImage, FileText, FileArchive, Download, ArrowRight, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileItem {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  projeto: string;
  data: string;
  tamanho: string;
}

interface FilesCardProps {
  files: FileItem[];
}

const getFileIcon = (tipo: string) => {
  if (tipo.includes('image')) return FileImage;
  if (tipo.includes('pdf')) return FileText;
  if (tipo.includes('zip') || tipo.includes('rar')) return FileArchive;
  return File;
};

export function FilesCard({ files }: FilesCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Seus Arquivos
        </CardTitle>
        <Link to="/client/arquivos">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {(!files || files.length === 0) ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              Seus arquivos entregues aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.slice(0, 5).map((file) => {
              const Icon = getFileIcon(file.tipo);
              return (
                <div 
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.projeto} • {file.tamanho}
                    </p>
                  </div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
