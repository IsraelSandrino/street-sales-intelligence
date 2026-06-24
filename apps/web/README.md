# Web PWA

Frontend do MVP operacional para campo.

## Variaveis de ambiente

Crie `apps/web/.env` baseado em `apps/web/.env.example`.
O front usa apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Scripts

- `npm run dev`
- `npm run dev:mobile`
- `npm run build`
- `npm run lint`

## Fluxo operacional

- `Novo Lead`: cadastra nome, telefone e GPS quando possivel.
- `Nova Venda`: busca lead, seleciona produtos, informa quantidades e salva a venda.
- `Resumo`: mostra quantidade de leads, vendas e receita do dia.

## Banco de dados

O frontend assume as tabelas `leads`, `products`, `sales` e `sale_items` com RLS habilitado e permissao de leitura e escrita para a operacao de campo.

## Acesso no celular

- `localhost` no celular aponta para o proprio aparelho, nao para a maquina que esta rodando o Vite.
- Para testar pela rede local, abra a URL usando o IP do computador.
- Para GPS funcionar com mais consistencia, prefira um tunel HTTPS durante o desenvolvimento.

## Teste via ngrok

O Vite sobe em `http://localhost:5173` por padrao e, neste projeto, tambem aceita conexoes externas em `0.0.0.0`.

Fluxo mais simples para celular:

1. Entre em `apps/web`.
2. Rode `npm run dev:mobile`.
3. Em outro terminal, rode `ngrok http 5173`.
4. Abra no celular a URL HTTPS exibida pelo ngrok, por exemplo `https://abcd-1234.ngrok-free.app`.

## GPS no celular

- O navegador do celular so libera geolocalizacao em secure context.
- A URL do ngrok atende esse requisito porque e `https`.
- Se a tela mostrar `Abra o app em HTTPS para permitir a localizacao no celular.`, confirme que voce abriu a URL do ngrok, nao o IP local ou `localhost`.
- Se o usuario negar o acesso ao GPS, use o botao `Ativar localizacao` para tentar novamente.
