alter table products add column if not exists usage_type text;

create index if not exists products_usage_type_idx on products(usage_type);
