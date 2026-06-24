# Project Brief

## Objetivo

Criar um MVP PWA mobile-first para operar vendas presenciais de forma extremamente rapida durante abordagens na rua.

## Experiencia principal

O usuario abre o app no celular e escolhe uma de tres tarefas:

1. Cadastrar um novo lead em segundos.
2. Registrar uma nova venda em segundos.
3. Ver o resumo do dia sem sair da operacao.

## Direcao de produto

- O PWA e a tela operacional principal.
- ClickUp e Notion, se existirem, ficam apenas como CRM ou acompanhamento posterior.
- Supabase e a fonte principal dos dados.
- O fluxo precisa ser executavel com uma mao e pouco atrito.

## Requisitos de UX

- Tela de lead extremamente curta.
- Tela de venda com busca de lead, selecao de produtos, quantidade e total automatico.
- Resumo com tres numeros apenas.
- Feedback imediato de sucesso ou erro.
- GPS automatico quando o navegador permitir.

## Fluxo de dados

1. Captura de `name`, `phone`, `latitude` e `longitude` no cadastro de lead.
2. Busca de lead existente por nome ou telefone na tela de venda.
3. Selecao de produtos ativos.
4. Registro de quantidade por item e calculo do subtotal.
5. Persistencia da venda em `sales` e dos itens em `sale_items`.
6. Consulta do resumo diario com base em `leads` e `sales`.

## Estado atual

- Frontend foi refatorado para o modelo operacional.
- A dependencia operacional de ClickUp saiu da tela principal.
- A base agora fica centrada em Supabase e nas tres telas do campo.
