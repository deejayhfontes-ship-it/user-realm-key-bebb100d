import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { Plus, Trash2, QrCode, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import QRCode from "react-qr-code";
import { useMemo, useState } from "react";
import { generatePixCode } from "@/lib/pix-generator";
import { toast } from "sonner";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm = ({ data, onChange }: InvoiceFormProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    onChange({
      ...data,
      items: data.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const discountAmount = data.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (data.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const pixCode = useMemo(() => {
    if (!data.pix?.enabled || !data.pix?.pixKey || !data.pix?.merchantName || !data.pix?.merchantCity) return "";
    
    return generatePixCode({
      pixKey: data.pix.pixKey,
      merchantName: data.pix.merchantName,
      merchantCity: data.pix.merchantCity,
      amount: total > 0 ? total : undefined,
      transactionId: `INV${data.invoiceNumber}`,
      description: `Fatura ${data.invoiceNumber}`,
    });
  }, [data.pix, total, data.invoiceNumber]);

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações da Fatura */}
      <Card className="soft-card">
        <CardHeader>
          <CardTitle className="text-lg">Informações da Fatura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Número da Fatura</Label>
              <Input
                id="invoiceNumber"
                value={data.invoiceNumber}
                readOnly
                className="mt-1 bg-muted/50"
              />
            </div>
            <div>
              <Label htmlFor="date">Data de Emissão</Label>
              <Input
                id="date"
                type="date"
                value={data.date}
                onChange={(e) => onChange({ ...data, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={data.dueDate || ""}
                onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill To e Ship To */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="soft-card">
          <CardHeader>
            <CardTitle className="text-lg">Bill To (Quem Paga)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome/Razão Social *</Label>
              <Input
                value={data.billTo.name}
                onChange={(e) =>
                  onChange({ ...data, billTo: { ...data.billTo, name: e.target.value } })
                }
                placeholder="Nome completo ou razão social"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                value={data.billTo.company}
                onChange={(e) =>
                  onChange({ ...data, billTo: { ...data.billTo, company: e.target.value } })
                }
                placeholder="Nome da empresa (opcional)"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Textarea
                value={data.billTo.address}
                onChange={(e) =>
                  onChange({ ...data, billTo: { ...data.billTo, address: e.target.value } })
                }
                placeholder="Endereço completo"
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={data.billTo.email}
                onChange={(e) =>
                  onChange({ ...data, billTo: { ...data.billTo, email: e.target.value } })
                }
                placeholder="email@exemplo.com"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="soft-card">
          <CardHeader>
            <CardTitle className="text-lg">Ship To (Destinatário)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do Destinatário *</Label>
              <Input
                value={data.shipTo.name}
                onChange={(e) =>
                  onChange({ ...data, shipTo: { ...data.shipTo, name: e.target.value } })
                }
                placeholder="Nome do cliente ou responsável"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Evento/Referência</Label>
              <Input
                value={data.shipTo.event}
                onChange={(e) =>
                  onChange({ ...data, shipTo: { ...data.shipTo, event: e.target.value } })
                }
                placeholder="Ex: Festival de Verão 2026"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Local/Cidade</Label>
              <Input
                value={data.shipTo.location}
                onChange={(e) =>
                  onChange({ ...data, shipTo: { ...data.shipTo, location: e.target.value } })
                }
                placeholder="Ex: São Paulo, Brasil"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={data.shipTo.phone}
                  onChange={(e) =>
                    onChange({ ...data, shipTo: { ...data.shipTo, phone: e.target.value } })
                  }
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={data.shipTo.email}
                  onChange={(e) =>
                    onChange({ ...data, shipTo: { ...data.shipTo, email: e.target.value } })
                  }
                  placeholder="email@exemplo.com"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens da Fatura */}
      <Card className="soft-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Itens da Fatura</CardTitle>
          <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-xl"
              >
                <div className="col-span-4">
                  <Label>Descrição</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Descrição do serviço"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data Serviço</Label>
                  <Input
                    type="date"
                    value={item.serviceDate || ""}
                    onChange={(e) => updateItem(item.id, "serviceDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Qtde</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Preço Unit. (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={data.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.discount}
                  onChange={(e) => onChange({ ...data, discount: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Taxa/Imposto (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.taxRate}
                  onChange={(e) => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-8 text-sm">
              <span>Subtotal: <strong>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              {discountAmount > 0 && <span className="text-destructive">Desconto: -R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
              {taxAmount > 0 && <span>Taxa: +R$ {taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
            </div>
            <div className="flex justify-end text-xl font-bold text-primary">
              Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card className="soft-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Observações</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-notes" className="text-sm font-normal">Incluir no PDF</Label>
            <Switch
              id="show-notes"
              checked={data.showNotes ?? true}
              onCheckedChange={(checked) => onChange({ ...data, showNotes: checked })}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Instruções de pagamento, termos, etc."
            rows={4}
            disabled={!data.showNotes}
            className={!data.showNotes ? "opacity-50" : ""}
          />
        </CardContent>
      </Card>

      {/* PIX */}
      <Card className="soft-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento PIX
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="pix-enabled" className="text-sm font-normal">Habilitar PIX</Label>
            <Switch
              id="pix-enabled"
              checked={data.pix?.enabled ?? false}
              onCheckedChange={(checked) => 
                onChange({ ...data, pix: { ...data.pix, enabled: checked } })
              }
            />
          </div>
        </CardHeader>
        {data.pix?.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Chave</Label>
                <Select defaultValue="email">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chave PIX</Label>
                <Input
                  value={data.pix?.pixKey ?? ""}
                  onChange={(e) =>
                    onChange({ ...data, pix: { ...data.pix, pixKey: e.target.value } })
                  }
                  placeholder="Sua chave PIX"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Beneficiário</Label>
                <Input
                  value={data.pix?.merchantName ?? ""}
                  onChange={(e) =>
                    onChange({ ...data, pix: { ...data.pix, merchantName: e.target.value.toUpperCase() } })
                  }
                  placeholder="NOME COMPLETO"
                  className="mt-1"
                  maxLength={25}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={data.pix?.merchantCity ?? ""}
                  onChange={(e) =>
                    onChange({ ...data, pix: { ...data.pix, merchantCity: e.target.value.toUpperCase() } })
                  }
                  placeholder="CIDADE"
                  className="mt-1"
                  maxLength={15}
                />
              </div>
            </div>

            {pixCode && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    {showQR ? "Ocultar QR Code" : "Mostrar QR Code"}
                  </Button>
                  <Button
                    onClick={handleCopy}
                    className="flex-1 gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar Código"}
                  </Button>
                </div>

                {showQR && (
                  <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-xl border">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCode value={pixCode} size={180} />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Escaneie o QR Code com o app do seu banco
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Código PIX (Copia e Cola):</Label>
                  <div className="mt-1 p-2 bg-muted/50 rounded text-xs font-mono break-all max-h-20 overflow-y-auto">
                    {pixCode}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Wise */}
      <Card className="soft-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-[#9fe870] text-[#1a2e05] px-2 py-0.5 rounded text-xs font-bold">WISE</span>
            Pagamento Internacional
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="wise-enabled" className="text-sm font-normal">Habilitar Wise</Label>
            <Switch
              id="wise-enabled"
              checked={data.wise?.enabled ?? false}
              onCheckedChange={(checked) => 
                onChange({ ...data, wise: { ...data.wise, enabled: checked } })
              }
            />
          </div>
        </CardHeader>
        {data.wise?.enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Username do Wise (sem @)</Label>
              <Input
                value={data.wise?.username ?? ""}
                onChange={(e) =>
                  onChange({ ...data, wise: { ...data.wise, username: e.target.value.toLowerCase().replace('@', '') } })
                }
                placeholder="seu_username"
                className="mt-1"
              />
            </div>

            {data.wise?.username && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Link de pagamento:</span>{" "}
                  <a 
                    href={`https://wise.com/pay/me/${data.wise.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:opacity-80"
                  >
                    wise.com/pay/me/{data.wise.username}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
