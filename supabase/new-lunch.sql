-- Ny lunch. Ändra värdena och kör i SQL Editor.
-- Varje körning skapar en ny rad. En gammal lunch skrivs inte över.
-- status ska vara published för att lunchen ska synas på sidan.
-- Datum måste vara idag eller senare.
-- max_participants: lämna null om det inte finns en platsgräns.
-- Sätt ett tal, till exempel 19, när restaurangen har en begränsning.

insert into public.lunches (
  title,
  date,
  meeting_time,
  lunch_time,
  restaurant_name,
  restaurant_address,
  restaurant_url,
  meeting_point,
  description,
  offer_text,
  max_participants,
  status
) values (
  'Grannlunch',
  '2026-10-14',
  '11:45',
  '12:05',
  'Restaurang X (TBD)',
  'Åkersberga Centrum',
  null,
  'Gemensam promenad från området.',
  'En promenad och lunch tillsammans.',
  'Vi siktar på ett bra pris',
  null,
  'published'
);
