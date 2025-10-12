-- Update handle_new_user function to fix position data for 3 players
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)));
  
  -- Insert sample players for new user (without specifying id, let it auto-generate)
  INSERT INTO public.players (user_id, name, team, position, category, evaluations, recommended_teams, year, batting_hand, throwing_hand, hometown, age, usage, memo, videos, main_position)
  VALUES
    (NEW.id, '立石 正広', '創価大学', '三塁手', '大学', ARRAY['1位競合'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], '三塁手'),
    (NEW.id, '松下 歩叶', '法政大学', '三塁手', '大学', ARRAY['1位一本釣り', '外れ1位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], '三塁手'),
    (NEW.id, '毛利 海大', '明治大学', '投手', '大学', ARRAY['外れ1位', '2位'], ARRAY[]::text[], 2025, '左打', '左投', '', NULL, '先発', '', ARRAY[]::text[], NULL),
    (NEW.id, '増居 翔太', 'トヨタ', '投手', '社会人', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '左打', '左投', '', NULL, '先発', '', ARRAY[]::text[], NULL),
    (NEW.id, '竹丸 和幸', '鷺宮製作所', '投手', '社会人', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '左打', '左投', '', NULL, '先発', '', ARRAY[]::text[], NULL),
    (NEW.id, '谷端 将伍', '日本大学', '二塁手', '大学', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '中西 聖輝', '青山学院大', '投手', '大学', ARRAY['1位一本釣り', '外れ1位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '先発', '', ARRAY[]::text[], NULL),
    (NEW.id, '櫻井 頼之介', '東北福祉大', '投手', '大学', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '藤原 聡大', '花園大学', '投手', '大学', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '櫻井 ユウヤ', '昌平高校', '三塁手', '高校', ARRAY['外れ1位', '2位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '石垣 元気', '健大高崎', '投手', '高校', ARRAY['1位一本釣り'], ARRAY[]::text[], 2025, '左打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '小島 大河', '明治大学', '捕手', '大学', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '左打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, 'エドポロ ケイン', '大阪学院大学', '外野手', '大学', ARRAY['2位', '3位', '4位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '堀越 啓太', '東北福祉大', '投手', '大学', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '伊藤 樹', '早稲田大学', '投手', '大学', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '齊藤 汰直', '亜細亜大学', '投手', '大学', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '山城 京平', '亜細亜大学', '投手', '大学', ARRAY['外れ1位', '2位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '大塚 瑠晏', '東海大学', '遊撃手', '大学', ARRAY['1位一本釣り', '外れ1位', '2位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '秋山 俊', '中京大学', '外野手', '大学', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '森 陽樹', '大阪桐蔭高校', '投手', '高校', ARRAY['3位', '4位', '5位', '6位以下', '育成'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '藤井 健翔', '浦和学院', '三塁手', '高校', ARRAY['3位', '4位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], '三塁手'),
    (NEW.id, '谷脇 弘起', '日本生命', '投手', '社会人', ARRAY['2位', '外れ1位', '3位'], ARRAY[]::text[], 2025, '右打', '右投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '髙橋 隆慶', 'JR東日本', '三塁手', '社会人', ARRAY['2位', '3位'], ARRAY[]::text[], 2025, '左打', '左投', '', NULL, '', '', ARRAY[]::text[], NULL),
    (NEW.id, '冨重 英二郎', '神奈川FD', '投手', '社会人', ARRAY['2位', '4位', '3位'], ARRAY[]::text[], 2025, '左打', '左投', '', NULL, '', '', ARRAY[]::text[], NULL);
  
  RETURN NEW;
END;
$function$;