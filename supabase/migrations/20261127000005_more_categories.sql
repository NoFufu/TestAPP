-- Neue Kategorien: Strand, Aussicht, Altstadt (für Barcelona und später weitere Städte).
alter table public.spots drop constraint if exists spots_categories_check;
alter table public.spots add constraint spots_categories_check check (
  cardinality(categories) between 1 and 4
  and categories <@ array['urban','tuer','natur','cafe','industrial','treppe','nacht','architektur','strand','aussicht','altstadt']
);
