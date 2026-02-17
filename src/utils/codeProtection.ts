export function enableCodeProtection() {
  // Limpar console
  console.clear();
  
  // Desabilitar clique direito
  const preventContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };
  document.addEventListener('contextmenu', preventContextMenu);

  // Desabilitar atalhos de desenvolvedor
  const preventDevShortcuts = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C (Inspetor)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S (Salvar página)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }

    return true;
  };
  document.addEventListener('keydown', preventDevShortcuts);

  // Aviso estilizado no console
  console.log(
    '%c⚠️ MODO PROTEGIDO',
    'color: #c4ff0d; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
  );
  console.log(
    '%cFerramentas de desenvolvedor desabilitadas.',
    'color: #999; font-size: 14px;'
  );
  console.log(
    '%cPara habilitar: Admin → Configurações → Segurança',
    'color: #666; font-size: 12px;'
  );

  // Retornar função para limpar listeners
  return () => {
    document.removeEventListener('contextmenu', preventContextMenu);
    document.removeEventListener('keydown', preventDevShortcuts);
  };
}

export function disableCodeProtection() {
  console.clear();
  console.log(
    '%c🔓 MODO DESENVOLVEDOR',
    'color: #c4ff0d; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
  );
  console.log(
    '%cFerramentas de desenvolvedor habilitadas.',
    'color: #4ade80; font-size: 14px;'
  );
}
