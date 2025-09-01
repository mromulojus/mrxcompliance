# Configuração de Ambientes - Supabase Client

Este arquivo explica como o client do Supabase funciona dinamicamente em diferentes ambientes.

## Como Funciona

O `client.ts` detecta automaticamente o ambiente baseado em:

1. **Variáveis de ambiente** (prioridade máxima)
2. **Hostname atual** da aplicação
3. **Fallback** para produção

## Configurações por Ambiente

### 🚀 Produção
- **Hosts**: `mrxbr.app`, `www.mrxbr.app`
- **Projeto**: `pxpscjyeqmqqxzbttbep`
- **URL**: `https://pxpscjyeqmqqxzbttbep.supabase.co`

### 🛠️ Desenvolvimento Local
- **Hosts**: `localhost`, `127.0.0.1`, `0.0.0.0`
- **Projeto**: Mesmo da produção (compartilhado)
- **URL**: `https://pxpscjyeqmqqxzbttbep.supabase.co`

## Configuração Manual (Opcional)

Para sobrescrever a detecção automática, crie um arquivo `.env.local`:

```bash
# Para usar um projeto específico
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Logs de Debug

O client exibe logs no console indicando qual ambiente foi detectado:

- `🔧 Supabase: Detectado ambiente production (mrxbr.app)`
- `🔧 Supabase: Detectado ambiente development (localhost)`
- `⚠️ Supabase: Ambiente não detectado, usando configuração de produção`

## Vantagens

✅ **Zero configuração** - Funciona automaticamente em qualquer ambiente  
✅ **Flexível** - Permite override via variáveis de ambiente  
✅ **Transparente** - Logs mostram qual configuração está sendo usada  
✅ **Seguro** - Fallback para produção evita erros  

## Para Adicionar Novo Ambiente

Edite a seção `environments` em `client.ts`:

```typescript
staging: {
  hosts: ['staging.mrxbr.app'],
  url: "https://projeto-staging.supabase.co",
  anonKey: "chave-staging"
}
```
