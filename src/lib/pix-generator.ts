// Gerador de código PIX EMV (BRCode)
// Baseado no padrão EMV QRCPS-MPM

interface PixPayload {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  transactionId?: string;
  description?: string;
}

const formatValue = (id: string, value: string): string => {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
};

const generateCRC16 = (payload: string): string => {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  const bytes = new TextEncoder().encode(payload);
  
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export const generatePixCode = ({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  transactionId = '***',
  description
}: PixPayload): string => {
  // Payload Format Indicator
  let payload = formatValue('00', '01');
  
  // Merchant Account Information
  // GUI do PIX
  const gui = formatValue('00', 'br.gov.bcb.pix');
  // Chave PIX
  const key = formatValue('01', pixKey);
  // Descrição (opcional)
  const desc = description ? formatValue('02', description) : '';
  
  payload += formatValue('26', gui + key + desc);
  
  // Merchant Category Code
  payload += formatValue('52', '0000');
  
  // Transaction Currency (986 = BRL)
  payload += formatValue('53', '986');
  
  // Transaction Amount (opcional)
  if (amount && amount > 0) {
    payload += formatValue('54', amount.toFixed(2));
  }
  
  // Country Code
  payload += formatValue('58', 'BR');
  
  // Merchant Name (máx 25 caracteres)
  const cleanName = merchantName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25);
  payload += formatValue('59', cleanName);
  
  // Merchant City (máx 15 caracteres)
  const cleanCity = merchantCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15);
  payload += formatValue('60', cleanCity);
  
  // Additional Data Field Template
  const txId = formatValue('05', transactionId.substring(0, 25));
  payload += formatValue('62', txId);
  
  // CRC16 placeholder
  payload += '6304';
  
  // Calculate and append CRC16
  const crc = generateCRC16(payload);
  payload = payload.slice(0, -4) + formatValue('63', crc);
  
  return payload;
};
