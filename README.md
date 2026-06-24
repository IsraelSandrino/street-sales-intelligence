# street-sales-intelligence

PWA mobile-first para operar vendas de rua com foco em velocidade e baixa friccao.

## Estrutura

- `apps/web`: frontend React + Vite + TypeScript.
- `docs/project-brief.md`: direcao do produto e escopo do MVP.
- `docs/database-schema.md`: contrato das tabelas `leads`, `products`, `sales` e `sale_items`.
- `supabase/migrations/20260623000000_field_ops.sql`: schema sugerido para o Supabase.

## Fluxo atual

1. O usuario abre o PWA no celular.
2. Usa a tela `Novo Lead` para cadastrar nome, telefone e GPS quando disponivel.
3. Usa a tela `Nova Venda` para buscar um lead, selecionar produtos e salvar a venda.
4. Usa a tela `Resumo` para ver leads do dia, vendas do dia e receita total.
5. O Supabase e a fonte principal de dados.

## Como rodar localmente

1. Entre em `apps/web`.
2. Crie o arquivo `.env` com base em `.env.example`.
3. Instale dependencias com `npm install` se necessario.
4. Execute `npm run dev:mobile`.
5. Em outro terminal, execute `ngrok http 5173`.
6. No celular, abra a URL HTTPS gerada pelo ngrok.
7. Se precisar de GPS, mantenha a URL do ngrok aberta porque ela fornece secure context.

## Observacao para testes moveis

- `localhost` no celular aponta para o proprio aparelho, nao para a maquina que roda o Vite.
- `http://<ip-local>:5173` pode abrir o app, mas nao e o melhor caminho para GPS porque nao garante secure context.
- O caminho mais pratico para teste em celular e `Vite` local + `ngrok` na porta `5173`.
- Se quiser manter a mesma URL por mais tempo, use um dominio reservado do ngrok ou mantenha o mesmo terminal/tunel aberto durante os testes.
