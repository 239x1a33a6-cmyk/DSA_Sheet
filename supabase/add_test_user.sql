-- ============================================================
-- ADD TEST USER SCRIPT
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  user_email TEXT := 'arun@user.com';
  user_password TEXT := 'Arun@123';
BEGIN
  -- 1. Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change_token_current
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000', -- Use default or specific instance_id
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Test User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- 2. Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      new_user_id,
      new_user_id,
      format('{"sub": "%s", "email": "%s"}', new_user_id, user_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Test user created: %', user_email;
  ELSE
    RAISE NOTICE 'User already exists: %', user_email;
  END IF;
END $$;
