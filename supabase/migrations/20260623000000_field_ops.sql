create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'geral',
  price numeric(12, 2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete restrict,
  total_amount numeric(12, 2) not null default 0,
  sale_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists products_active_idx on public.products (active, category, name);
create index if not exists sales_sale_date_idx on public.sales (sale_date desc);
create index if not exists sales_lead_id_idx on public.sales (lead_id);
create index if not exists sale_items_sale_id_idx on public.sale_items (sale_id);
create index if not exists sale_items_product_id_idx on public.sale_items (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_sales_updated_at on public.sales;
create trigger set_sales_updated_at
before update on public.sales
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "Anon can read leads" on public.leads;
drop policy if exists "Anon can insert leads" on public.leads;
drop policy if exists "Anon can read products" on public.products;
drop policy if exists "Anon can read sales" on public.sales;
drop policy if exists "Anon can insert sales" on public.sales;
drop policy if exists "Anon can read sale items" on public.sale_items;
drop policy if exists "Anon can insert sale items" on public.sale_items;

create policy "Anon can read leads"
on public.leads
for select
to anon
using (true);

create policy "Anon can insert leads"
on public.leads
for insert
to anon
with check (true);

create policy "Anon can read products"
on public.products
for select
to anon
using (active = true);

create policy "Anon can read sales"
on public.sales
for select
to anon
using (true);

create policy "Anon can insert sales"
on public.sales
for insert
to anon
with check (true);

create policy "Anon can read sale items"
on public.sale_items
for select
to anon
using (true);

create policy "Anon can insert sale items"
on public.sale_items
for insert
to anon
with check (true);

insert into public.products (name, category, price, active)
select seed.name, seed.category, seed.price, seed.active
from (
  values
    ('Frango com Catupiry', 'Assado', 15.00, true),
    ('Strogonoff de Carne', 'Assado', 15.00, true),

    ('Dois Amores', 'Bolo de Pote', 20.00, true),
    ('Prestígio', 'Bolo de Pote', 20.00, true),
    ('Amendoim', 'Bolo de Pote', 20.00, true),
    ('Mousse de Maracujá', 'Bolo de Pote', 20.00, true),
    ('Ninho com Morango', 'Bolo de Pote', 20.00, true),
    ('Sonho de Valsa', 'Bolo de Pote', 20.00, true),

    ('Ninho com Morango', 'Bombom Aberto', 18.00, true),
    ('Brigadeiro de Quatro Leites', 'Bombom Aberto', 20.00, true),
    ('Brigadeiro de Café', 'Bombom Aberto', 20.00, true),
    ('Marido Gelado', 'Bombom Aberto', 20.00, true),
    ('Uva e Morango I', 'Bombom Aberto', 20.00, true),
    ('Uva e Morango II', 'Bombom Aberto', 20.00, true),

    ('Caramelo com Amendoim', 'Brownie', 16.00, true),
    ('Cocada de Maracujá', 'Brownie', 15.00, true),

    ('Mousse de Limão', 'Brownie de Pote', 20.00, true),
    ('Mousse de Maracujá', 'Brownie de Pote', 20.00, true),
    ('Ninho com Morango', 'Brownie de Pote', 20.00, true),

    ('Cookie', 'Diversos', 12.00, true),
    ('Bolo Gelado - Abacaxi e Côco', 'Diversos', 15.00, true),
    ('Carolinas', 'Diversos', 20.00, true),
    ('Bomba de Chocolate', 'Diversos', 20.00, true),
    ('Fatia Paçoca com Chocolate', 'Diversos', 20.00, true),
    ('Fatia Pudim e Leite Condensado', 'Diversos', 25.00, true),

    ('Carne Moída com Queijo', 'Esfiha', 15.00, true),

    ('Sortido', 'Kits', 16.00, true),
    ('Bombom de Morango e Uva', 'Kits', 16.00, true),
    ('Brigadeiro de Morango', 'Kits', 16.00, true),
    ('Morango do Amor e Bombom', 'Kits', 18.00, true),
    ('Morango do Amor', 'Kits', 21.00, true),

    ('Calabresa', 'Pizza', 15.00, true),
    ('Frango com Catupiry', 'Pizza', 15.00, true),
    ('Strogonoff de Carne', 'Pizza', 15.00, true),

    ('Carne de Panela Desfiada', 'Sanduíche', 15.00, true),
    ('Pão Sírio com Frango Desfiado', 'Sanduíche', 15.00, true),
    ('Peito de Peru', 'Sanduíche', 15.00, true),
    ('X-Salada', 'Sanduíche', 15.00, true),

    ('Frango', 'Sanduíche Integral', 10.00, true),
    ('Salame Italiano', 'Sanduíche Integral', 10.00, true),

    ('Torta de Prestígio', 'Torta', 15.00, true),
    ('Torta Escocesa Picapau', 'Torta', 15.00, true),

    ('Banoffe', 'Tortinha', 18.00, true),
    ('Limão', 'Tortinha', 18.00, true),
    ('Morangoffe', 'Tortinha', 20.00, true),
    ('Ninho com Nutella e Morango', 'Tortinha', 20.00, true)
) as seed(name, category, price, active)
where not exists (
  select 1
  from public.products p
  where p.name = seed.name
    and p.category = seed.category
);
