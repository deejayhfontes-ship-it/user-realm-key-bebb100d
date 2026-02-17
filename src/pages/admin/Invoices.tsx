import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, Plus, Trash2, Eye, Download, Loader2, Copy, 
  Search, Filter, CheckCircle, Clock, AlertCircle, XCircle, QrCode, FileCheck 
} from "lucide-react";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/useInvoices";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { InvoiceData, InvoiceRow } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const emptyInvoice: InvoiceData = {
  invoiceNumber: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  billTo: { name: "", company: "", address: "", email: "" },
  shipTo: { name: "", event: "", location: "", phone: "", email: "" },
  items: [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
  showNotes: true,
  discount: 0,
  taxRate: 0,
  notes: "",
  pix: { pixKey: "", merchantName: "", merchantCity: "", enabled: false },
  wise: { username: "", enabled: false },
};

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
  paid: { label: "Pago", icon: CheckCircle, className: "bg-green-500/20 text-green-600 border-green-500/30" },
  overdue: { label: "Vencido", icon: AlertCircle, className: "bg-red-500/20 text-red-600 border-red-500/30" },
  cancelled: { label: "Cancelado", icon: XCircle, className: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
};

const Invoices = () => {
  const navigate = useNavigate();
  const { invoices, isLoading, generateInvoiceNumber, createInvoice, deleteInvoice, updateStatus } = useInvoices();
  const { notas } = useNotasFiscais();
  const [activeTab, setActiveTab] = useState("list");
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(emptyInvoice);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "new") {
      generateInvoiceNumber.mutate(undefined, {
        onSuccess: (number) => {
          setInvoiceData({ ...emptyInvoice, invoiceNumber: number });
        },
      });
    }
  }, [activeTab]);

  const handleSave = async () => {
    if (!invoiceData.billTo.name || !invoiceData.shipTo.name) {
      toast.error("Preencha os campos obrigatórios (Bill To e Ship To)");
      return;
    }

    await createInvoice.mutateAsync(invoiceData);
    setActiveTab("list");
    setInvoiceData(emptyInvoice);
  };

  const handleGeneratePDF = async (invoice?: InvoiceRow) => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    toast.loading("Gerando PDF...", { id: "pdf-loading" });

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight + 20],
      });

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);

      const clientName = invoice ? invoice.bill_to_name : invoiceData.billTo.name;
      const invNumber = invoice ? invoice.invoice_number : invoiceData.invoiceNumber;
      const fileName = `Invoice_${invNumber}_${clientName.replace(/\s+/g, "_")}.pdf`;
      
      pdf.save(fileName);
      toast.success("PDF gerado com sucesso!", { id: "pdf-loading" });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF", { id: "pdf-loading" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewInvoice = (invoice: InvoiceRow) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const rowToInvoiceData = (row: InvoiceRow): InvoiceData => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    date: row.date,
    dueDate: row.due_date || "",
    billTo: {
      name: row.bill_to_name,
      company: row.bill_to_company || "",
      address: row.bill_to_address || "",
      email: row.bill_to_email || "",
    },
    shipTo: {
      name: row.ship_to_name,
      event: row.ship_to_event || "",
      location: row.ship_to_location || "",
      phone: row.ship_to_phone || "",
      email: row.ship_to_email || "",
    },
    items: row.items.map((item, idx) => ({
      id: item.id || `${idx}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      serviceDate: item.serviceDate,
    })),
    showNotes: true,
    discount: row.discount / 100,
    taxRate: row.tax_rate,
    notes: row.notes || "",
    pix: row.pix_config || { pixKey: "", merchantName: "", merchantCity: "", enabled: false },
    wise: row.wise_config || { username: "", enabled: false },
    status: row.status,
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.bill_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.ship_to_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Faturas (Invoices)
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie faturas e cobranças
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Faturas</TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-1" /> Nova Fatura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card className="soft-card">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="soft-card">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma fatura encontrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Bill To</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>NF</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const status = statusConfig[invoice.status];
                      const StatusIcon = status.icon;
                      const notaVinculada = notas.find(n => n.invoice_id === invoice.id);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">#{invoice.invoice_number}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("pt-BR") : "-"}
                          </TableCell>
                          <TableCell>{invoice.bill_to_name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            R$ {(invoice.total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className={status.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                              {invoice.pix_code && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  <QrCode className="h-3 w-3 mr-1" />
                                  PIX
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {notaVinculada ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className="bg-primary/10 text-primary border-primary/20 cursor-pointer"
                                    onClick={() => navigate('/admin/notas-fiscais')}
                                  >
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    {notaVinculada.numero}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {notaVinculada.tipo} - {notaVinculada.status === 'autorizada' ? 'Autorizada' : notaVinculada.status}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => navigate('/admin/notas-fiscais')}
                              >
                                <FileCheck className="h-3 w-3 mr-1" />
                                Emitir
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setTimeout(() => handleGeneratePDF(invoice), 100);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteInvoice.mutate(invoice.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Criar Nova Fatura</h2>
              <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSave} className="flex-1" disabled={createInvoice.isPending}>
                  {createInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar Fatura
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGeneratePDF()}
                  disabled={isGeneratingPDF}
                  className="flex-1"
                >
                  {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Gerar PDF
                </Button>
              </div>
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              <h2 className="text-xl font-bold mb-4">Preview</h2>
              <div className="transform scale-[0.6] origin-top-left">
                <div ref={invoiceRef}>
                  <InvoicePreview data={invoiceData} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fatura #{selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['pending', 'paid', 'overdue', 'cancelled'] as const).map((status) => {
                  const config = statusConfig[status];
                  return (
                    <Button
                      key={status}
                      variant={selectedInvoice.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateStatus.mutate({ id: selectedInvoice.id, status });
                        setSelectedInvoice({ ...selectedInvoice, status });
                      }}
                    >
                      {config.label}
                    </Button>
                  );
                })}
              </div>
              
              {/* Show PIX payment info prominently if pending and has PIX */}
              {selectedInvoice.status === 'pending' && selectedInvoice.pix_code && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Esta fatura tem um código PIX gerado. O QR Code está visível no preview abaixo.
                  </p>
                </div>
              )}
              
              <div ref={invoiceRef}>
                <InvoicePreview 
                  data={rowToInvoiceData(selectedInvoice)} 
                  savedPixCode={selectedInvoice.pix_code}
                  showInteractivePixPayment={selectedInvoice.status === 'pending'}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden ref for PDF generation */}
      {!viewModalOpen && activeTab !== "new" && selectedInvoice && (
        <div className="fixed -left-[9999px] top-0" aria-hidden="true">
          <div ref={invoiceRef} className="bg-white" style={{ width: '800px' }}>
            <InvoicePreview data={rowToInvoiceData(selectedInvoice)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
