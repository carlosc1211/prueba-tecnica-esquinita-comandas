create extension if not exists pgcrypto;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text check (description is null or char_length(description) <= 240),
  category text not null check (category in ('bocadillos', 'tapas', 'bebidas', 'postres')),
  price_cents integer not null check (price_cents between 0 and 100000),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_available_category_idx on public.products (available, category, name);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number smallint not null check (table_number between 1 and 50),
  status text not null default 'abierta'
    check (status in ('abierta', 'en_cocina', 'servida', 'pagada', 'cancelada')),
  notes text check (notes is null or char_length(notes) <= 300),
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_created_idx on public.orders (status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  product_name text not null,
  quantity smallint not null check (quantity between 1 and 99),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (phone ~ '^\+?[0-9 ]{9,15}$'),
  party_size smallint not null check (party_size between 1 and 20),
  reserved_at timestamptz not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmada', 'cancelada')),
  notes text check (notes is null or char_length(notes) <= 300),
  created_at timestamptz not null default now()
);

create index reservations_reserved_at_idx on public.reservations (reserved_at);
create index reservations_status_reserved_idx on public.reservations (status, reserved_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;

create policy products_public_read on public.products
  for select to anon using (available = true);
create policy products_staff_read on public.products
  for select to authenticated using (true);
create policy products_staff_insert on public.products
  for insert to authenticated with check (true);
create policy products_staff_update on public.products
  for update to authenticated using (true) with check (true);
create policy products_staff_delete on public.products
  for delete to authenticated using (true);

create policy orders_staff_read on public.orders
  for select to authenticated using (true);
create policy orders_staff_insert on public.orders
  for insert to authenticated with check (created_by = auth.uid());
create policy orders_staff_update on public.orders
  for update to authenticated using (true) with check (true);

create policy order_items_staff_read on public.order_items
  for select to authenticated using (true);
create policy order_items_staff_insert on public.order_items
  for insert to authenticated with check (true);

create policy reservations_public_insert on public.reservations
  for insert to anon with check (status = 'pendiente' and reserved_at > now());
create policy reservations_staff_read on public.reservations
  for select to authenticated using (true);
create policy reservations_staff_insert on public.reservations
  for insert to authenticated with check (true);
create policy reservations_staff_update on public.reservations
  for update to authenticated using (true) with check (true);

create or replace function public.create_order(
  p_table_number smallint,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_requested integer;
  v_inserted integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order' using errcode = '22023';
  end if;

  insert into public.orders (table_number, notes)
  values (p_table_number, nullif(btrim(p_notes), ''))
  returning id into v_order_id;

  select count(*) into v_requested from jsonb_array_elements(p_items);

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price_cents)
  select v_order_id, p.id, p.name, (i.value ->> 'quantity')::smallint, p.price_cents
  from jsonb_array_elements(p_items) as i
  join public.products p on p.id = (i.value ->> 'product_id')::uuid and p.available = true;

  get diagnostics v_inserted = row_count;

  if v_inserted <> v_requested then
    raise exception 'unavailable_product' using errcode = '22023';
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.create_order(smallint, text, jsonb) from public, anon;
grant execute on function public.create_order(smallint, text, jsonb) to authenticated;

create or replace view public.order_summaries
with (security_invoker = true)
as
select
  o.id,
  o.table_number,
  o.status,
  o.notes,
  o.created_at,
  coalesce(sum(oi.quantity * oi.unit_price_cents), 0)::integer as total_cents,
  coalesce(sum(oi.quantity), 0)::integer as item_count
from public.orders o
left join public.order_items oi on oi.order_id = o.id
group by o.id;

grant select on public.order_summaries to authenticated;
