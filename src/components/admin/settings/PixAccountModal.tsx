import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import {
  usePixConfigs,
  PixConfig,
  PixKeyType,
  validatePixKey,
  getKeyTypeLabel,
} from '@/hooks/usePixConfigs';

interface PixAccountModalProps {
  open: boolean;
  onClose: () => void;
  editingConfig: PixConfig | null;
}

const keyTypes: PixKeyType[] = ['cpf', 'cnpj', 'email', 'phone', 'evp'];

export function PixAccountModal({ open, onClose, editingConfig }: PixAccountModalProps) {
  const { createConfig, updateConfig, isCreating, isUpdating } = usePixConfigs();

  const [nickname, setNickname] = useState('');
  const [keyType, setKeyType] = useState<PixKeyType>('email');
  const [pixKey, setPixKey] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCity, setMerchantCity] = useState('São Paulo');
  const [isDefault, setIsDefault] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Reset form when modal opens/closes or editing config changes
  useEffect(() => {
    if (open) {
      if (editingConfig) {
        setNickname(editingConfig.nickname);
        setKeyType(editingConfig.key_type as PixKeyType);
        setPixKey(editingConfig.pix_key);
        setMerchantName(editingConfig.merchant_name);
        setMerchantCity(editingConfig.merchant_city);
        setIsDefault(editingConfig.is_default);
      } else {
        setNickname('');
        setKeyType('email');
        setPixKey('');
        setMerchantName('');
        setMerchantCity('São Paulo');
        setIsDefault(false);
      }
      setKeyError(null);
    }
  }, [open, editingConfig]);

  const getKeyPlaceholder = (): string => {
    const placeholders: Record<PixKeyType, string> = {
      cpf: '000.000.000-00',
      cnpj: '00.000.000/0001-00',
      email: 'email@exemplo.com',
      phone: '11999999999',
      evp: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    };
    return placeholders[keyType];
  };

  const handleKeyChange = (value: string) => {
    setPixKey(value);
    if (value.trim()) {
      const validation = validatePixKey(value, keyType);
      setKeyError(validation.valid ? null : validation.message || null);
    } else {
      setKeyError(null);
    }
  };

  const handleKeyTypeChange = (type: PixKeyType) => {
    setKeyType(type);
    setKeyError(null);
    // Re-validate if there's already a key
    if (pixKey.trim()) {
      const validation = validatePixKey(pixKey, type);
      setKeyError(validation.valid ? null : validation.message || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submit
    const validation = validatePixKey(pixKey, keyType);
    if (!validation.valid) {
      setKeyError(validation.message || 'Chave inválida');
      return;
    }

    const data = {
      nickname: nickname.trim() || 'Conta PIX',
      key_type: keyType,
      pix_key: pixKey.trim(),
      merchant_name: merchantName.trim(),
      merchant_city: merchantCity.trim(),
      is_default: isDefault,
    };

    if (editingConfig) {
      updateConfig({ id: editingConfig.id, input: data }, {
        onSuccess: () => onClose(),
      });
    } else {
      createConfig(data, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? 'Editar Conta PIX' : 'Nova Conta PIX'}
          </DialogTitle>
          <DialogDescription>
            {editingConfig 
              ? 'Atualize as informações da conta PIX' 
              : 'Cadastre uma nova chave PIX para receber pagamentos'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Apelido da Conta</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Conta Principal, Empresa, Pessoal..."
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Key Type */}
            <div className="space-y-2">
              <Label htmlFor="key-type">Tipo de Chave</Label>
              <Select value={keyType} onValueChange={(v) => handleKeyTypeChange(v as PixKeyType)}>
                <SelectTrigger id="key-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {keyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getKeyTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PIX Key */}
            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave PIX</Label>
              <Input
                id="pix-key"
                value={pixKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={getKeyPlaceholder()}
                className={keyError ? 'border-destructive' : ''}
                required
              />
              {keyError && (
                <p className="text-xs text-destructive">{keyError}</p>
              )}
            </div>
          </div>

          {/* Merchant Name */}
          <div className="space-y-2">
            <Label htmlFor="merchant-name">Nome do Beneficiário</Label>
            <Input
              id="merchant-name"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Nome como aparece no banco (sem acentos)"
              maxLength={25}
              required
            />
            <p className="text-xs text-muted-foreground">
              Máximo 25 caracteres, exatamente como está registrado no banco
            </p>
          </div>

          {/* Merchant City */}
          <div className="space-y-2">
            <Label htmlFor="merchant-city">Cidade</Label>
            <Input
              id="merchant-city"
              value={merchantCity}
              onChange={(e) => setMerchantCity(e.target.value)}
              placeholder="São Paulo"
              maxLength={15}
              required
            />
            <p className="text-xs text-muted-foreground">
              Máximo 15 caracteres, sem acentos
            </p>
          </div>

          {/* Is Default */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label htmlFor="is-default" className="text-sm font-normal cursor-pointer">
              Definir como conta padrão para cobranças
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !!keyError}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
