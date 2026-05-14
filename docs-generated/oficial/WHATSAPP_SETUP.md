# Configuração da Evolution API v2

## 1. Instalação com Docker

```yaml
services:
  evolution:
    image: atendai/evolution-api:v2
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: "postgresql://..."
      AUTHENTICATION_API_KEY: "sua-chave-api"
    volumes:
      - evolution_data:/evolution/instances
```

```bash
docker compose up -d
```

## 2. Criar Instância

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-chave-api" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "saas-restaurante",
    "webhook": "https://app.seusite.com/api/webhooks/whatsapp",
    "webhookByEvents": true,
    "events": ["messages.upsert"]
  }'
```

## 3. Conectar WhatsApp

1. Acessar: `http://localhost:8080/instance/connect/saas-restaurante`
2. Escanear QR Code com o WhatsApp Business
3. Webhook configurado aponta para `/api/webhooks/whatsapp`

## 4. Variáveis de Ambiente

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=saas-restaurante
```

## 5. Testar

Enviar uma mensagem para o número conectado. O webhook deve receber e o bot deve responder.
