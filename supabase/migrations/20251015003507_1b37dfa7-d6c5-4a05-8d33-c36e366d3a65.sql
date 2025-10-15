-- Add admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('1fd1af9a-d2d8-4726-b5fc-4ff590e7f681', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;