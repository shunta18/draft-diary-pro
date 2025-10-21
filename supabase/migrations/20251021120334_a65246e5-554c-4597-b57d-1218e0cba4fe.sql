
-- public_playersのnameから全角・半角空白を削除
UPDATE public.public_players
SET name = REPLACE(REPLACE(name, ' ', ''), '　', '');
