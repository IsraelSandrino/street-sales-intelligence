# Database Schema

## Tabela: `leads`

Campos:

- `id`: identificador primario.
- `name`: nome do lead.
- `phone`: telefone normalizado.
- `latitude`: latitude capturada pelo dispositivo.
- `longitude`: longitude capturada pelo dispositivo.
- `created_at`: timestamp de criacao.
- `updated_at`: timestamp de atualizacao.

## Tabela: `products`

Campos:

- `id`: identificador primario.
- `name`: nome do produto.
- `category`: categoria curta.
- `price`: preco unitario.
- `active`: indica se o produto aparece na venda.
- `created_at`: timestamp de criacao.
- `updated_at`: timestamp de atualizacao.

## Tabela: `sales`

Campos:

- `id`: identificador primario.
- `lead_id`: referencia para `leads.id`.
- `total_amount`: total da venda.
- `sale_date`: data e hora da venda.
- `created_at`: timestamp de criacao.
- `updated_at`: timestamp de atualizacao.

## Tabela: `sale_items`

Campos:

- `id`: identificador primario.
- `sale_id`: referencia para `sales.id`.
- `product_id`: referencia para `products.id`.
- `quantity`: quantidade vendida.
- `unit_price`: preco unitario no momento da venda.
- `subtotal`: subtotal do item.
- `created_at`: timestamp de criacao.

## Contrato do frontend

- `Novo Lead` grava em `leads`.
- `Nova Venda` grava em `sales` e `sale_items`.
- `Resumo do dia` consulta `leads` e `sales`.

## Exemplo de DDL

Veja o arquivo `supabase/migrations/20260623000000_field_ops.sql` para o schema completo, RLS e seed inicial de produtos.
