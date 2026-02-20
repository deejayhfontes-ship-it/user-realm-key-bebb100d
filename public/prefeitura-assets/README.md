# Organização de Assets da Prefeitura

Você pode organizar os arquivos dentro da pasta `public/prefeitura-assets/` como preferir para facilitar sua localização.

## Sugestão de Estrutura
Recomendamos criar subpastas para cada secretaria e tipo de arquivo:

```
public/prefeitura-assets/
├── config.json              <-- Arquivo principal de configuração
├── saude/
│   ├── logos/               <-- Logos da saúde
│   │   ├── logo-oficial.png
│   │   └── logo-pb.png
│   ├── fontes/              <-- Fontes exclusivas
│   └── campanhas/           <-- Imagens de referência
├── educacao/
│   ├── logos/
│   └── ...
└── cultura/
    └── ...
```

## Como Atualizar o Agente
Sempre que você criar uma pasta nova, atualize o caminho no arquivo `config.json`.

**Exemplo:**
Se você moveu o logo da saúde para a pasta `logos`, altere no `config.json`:

```json
"saude": {
  "nome": "Secretaria de Saúde",
  "logoUrl": "/prefeitura-assets/saude/logos/logo-oficial.png" 
}
```

O agente encontrará o arquivo onde você indicar.
