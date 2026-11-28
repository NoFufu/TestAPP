-- 5 weitere Barcelona-Spots aus barcelona-fitspot.zip (KI-Beispielbilder). Koordinaten: bekannte Lage der Orte, nicht vor Ort geprüft.
insert into public.spots (id, name, description, location, area, city, categories, status) values
  (9016, 'Sagrada Família', 'Gaudís Basilika, am schönsten zum Sonnenuntergang vom Park gegenüber.', extensions.st_setsrid(extensions.st_makepoint(2.1744, 41.4036), 4326)::extensions.geography, 'Eixample', 'Barcelona', array['architektur'], 'live'),
  (9017, 'La Rambla', 'Platanenallee mit Kiosken, viel los. Früh morgens fotografieren.', extensions.st_setsrid(extensions.st_makepoint(2.1735, 41.3809), 4326)::extensions.geography, 'Ciutat Vella', 'Barcelona', array['urban','altstadt'], 'live'),
  (9018, 'Casa Milà', 'Wellenfassade von Gaudí (La Pedrera), Fotos vom Gehweg. Am besten vormittags.', extensions.st_setsrid(extensions.st_makepoint(2.1619, 41.3953), 4326)::extensions.geography, 'Eixample', 'Barcelona', array['architektur'], 'live'),
  (9019, 'Tibidabo', 'Kirche und alter Freizeitpark auf dem Hausberg, Blick über die Stadt. Später Nachmittag.', extensions.st_setsrid(extensions.st_makepoint(2.1190, 41.4218), 4326)::extensions.geography, 'Sarrià-Sant Gervasi', 'Barcelona', array['aussicht','architektur'], 'live'),
  (9020, 'Port Vell', 'Alter Hafen mit geschwungener Holzbrücke (Rambla de Mar). Zur Blauen Stunde.', extensions.st_setsrid(extensions.st_makepoint(2.1820, 41.3760), 4326)::extensions.geography, 'Ciutat Vella', 'Barcelona', array['urban'], 'live')
on conflict (id) do nothing;
