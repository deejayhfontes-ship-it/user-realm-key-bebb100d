import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Image,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { usePortfolio, PortfolioCase, PortfolioCaseInsert } from '@/hooks/usePortfolio';
import { ImageUploader, UploadedImage } from '@/components/admin/portfolio/ImageUploader';

const CATEGORIES = [
  'Social Media',
  'Identidade Visual',
  'Artes/Flyers',
  'Vídeo',
  'Motion Graphics',
  'Web Design',
  'Fotografia',
  'Embalagem',
  'Outros'
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  { value: 'published', label: 'Publicado', color: 'bg-green-500/20 text-green-400' },
  { value: 'archived', label: 'Arquivado', color: 'bg-orange-500/20 text-orange-400' },
];

interface FormData extends PortfolioCaseInsert {
  thumbnail_original_name?: string;
  file_size_kb?: number;
}

const emptyCase: FormData = {
  title: '',
  client_name: '',
  category: 'Social Media',
  description: '',
  thumbnail_url: '',
  gallery_urls: [],
  results: '',
  featured: false,
  order_index: 0,
  status: 'draft',
};

export default function Portfolio() {
  const { cases, isLoading, createCase, updateCase, deleteCase, toggleFeatured } = usePortfolio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<PortfolioCase | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyCase);
  const [galleryInput, setGalleryInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = statusFilter === 'all'
    ? cases
    : cases.filter(c => c.status === statusFilter);

  const handleOpenCreate = () => {
    setEditingCase(null);
    setFormData({ ...emptyCase, order_index: cases.length });
    setGalleryInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (portfolioCase: PortfolioCase) => {
    setEditingCase(portfolioCase);
    setFormData({
      title: portfolioCase.title,
      client_name: portfolioCase.client_name,
      category: portfolioCase.category,
      description: portfolioCase.description,
      thumbnail_url: portfolioCase.thumbnail_url,
      gallery_urls: portfolioCase.gallery_urls || [],
      results: portfolioCase.results || '',
      featured: portfolioCase.featured,
      order_index: portfolioCase.order_index,
      status: portfolioCase.status,
    });
    setGalleryInput((portfolioCase.gallery_urls || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const galleryUrls = galleryInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const dataToSave = {
      ...formData,
      gallery_urls: galleryUrls,
    };

    if (editingCase) {
      await updateCase.mutateAsync({ id: editingCase.id, data: dataToSave });
    } else {
      await createCase.mutateAsync(dataToSave);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCase.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await toggleFeatured.mutateAsync({ id, featured: !currentFeatured });
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await updateCase.mutateAsync({ id, data: { status: newStatus as 'draft' | 'published' } });
  };

  const handleImageUpload = (result: UploadedImage) => {
    setFormData({
      ...formData,
      thumbnail_url: result.url,
      thumbnail_original_name: result.originalName,
      file_size_kb: result.fileSizeKb,
    });
  };

  const handleImageRemove = () => {
    setFormData({
      ...formData,
      thumbnail_url: '',
      thumbnail_original_name: undefined,
      file_size_kb: undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : null;
  };

  // Stats
  const publishedCount = cases.filter(c => c.status === 'published').length;
  const featuredCount = cases.filter(c => c.featured).length;
  const draftCount = cases.filter(c => c.status === 'draft').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfólio</h1>
          <p className="text-muted-foreground">Gerencie os cases exibidos na página pública</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Case
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cases.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Destaques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent-foreground">{featuredCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{draftCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filtrar por status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-20">Thumb</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Destaque</TableHead>
                <TableHead className="text-right w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum case encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((portfolioCase) => (
                  <TableRow key={portfolioCase.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      {portfolioCase.thumbnail_url ? (
                        <img
                          src={portfolioCase.thumbnail_url}
                          alt={portfolioCase.title}
                          className="w-16 h-12 object-cover rounded-md"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                          <Image className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {portfolioCase.title}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {portfolioCase.client_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{portfolioCase.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(portfolioCase.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(portfolioCase.id, portfolioCase.featured)}
                      >
                        {portfolioCase.featured ? (
                          <Star className="w-4 h-4 text-primary fill-primary" />
                        ) : (
                          <StarOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(portfolioCase.id, portfolioCase.status)}
                          title={portfolioCase.status === 'published' ? 'Despublicar' : 'Publicar'}
                        >
                          {portfolioCase.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(portfolioCase)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(portfolioCase.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCase ? 'Editar Case' : 'Novo Case'}</DialogTitle>
            <DialogDescription>
              {editingCase ? 'Atualize as informações do case' : 'Adicione um novo projeto ao portfólio'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Imagem Principal *</Label>
              <ImageUploader
                value={formData.thumbnail_url}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                folder="thumbnails"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Projeto *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Campanha Verão 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_name">Nome do Cliente *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Ex: Loja XYZ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Projeto *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto, os desafios e as soluções..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gallery">Galeria de Imagens (URLs, uma por linha)</Label>
              <Textarea
                id="gallery"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                placeholder="https://imagem1.jpg&#10;https://imagem2.jpg&#10;https://imagem3.jpg"
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="results">Resultados Alcançados</Label>
              <Textarea
                id="results"
                value={formData.results || ''}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                placeholder="Ex: Aumento de 300% no engajamento, 50k impressões..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured" className="cursor-pointer">Destacar na Home</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="order">Ordem:</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.client_name || !formData.thumbnail_url || !formData.description}
            >
              {editingCase ? 'Salvar Alterações' : 'Criar Case'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Case</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este case? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
