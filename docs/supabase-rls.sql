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
