-- Los proyectos Supabase recientes no conceden privilegios de tabla por defecto.
-- Se parte de cero (revoke) y se concede lo mínimo que exigen las políticas RLS:
-- así la migración es re-ejecutable y anula grants por defecto más amplios.

grant usage on schema public to anon, authenticated;

revoke all on table
  public.products,
  public.orders,
  public.order_items,
  public.reservations
from anon, authenticated;

revoke all on table public.order_summaries from anon;

grant select on table public.products to anon;
grant insert on table public.reservations to anon;

grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;
grant select, insert, update on table public.reservations to authenticated;
