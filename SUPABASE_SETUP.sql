create table profiles (
  id uuid references auth.users on delete cascade,
  updated_at timestamp with time zone,
  progress jsonb,
  primary key (id)
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );
