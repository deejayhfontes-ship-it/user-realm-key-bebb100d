-- Add PIX code and txid fields to invoices table for payment tracking
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS pix_code TEXT,
ADD COLUMN IF NOT EXISTS pix_txid TEXT,
ADD COLUMN IF NOT EXISTS pix_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pix_config_id UUID REFERENCES public.pix_configs(id);

-- Add comment for documentation
COMMENT ON COLUMN public.invoices.pix_code IS 'Generated PIX EMV code (copia e cola)';
COMMENT ON COLUMN public.invoices.pix_txid IS 'PIX transaction ID for payment tracking';
COMMENT ON COLUMN public.invoices.pix_generated_at IS 'Timestamp when PIX code was generated';
COMMENT ON COLUMN public.invoices.pix_config_id IS 'Reference to the PIX account used for generation';