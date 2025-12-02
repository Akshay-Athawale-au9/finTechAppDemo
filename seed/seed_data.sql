-- Seed data for users
INSERT INTO users (email, password_hash, roles) VALUES
('admin@example.com', '$2b$10$rVHMOB1JbQNQFxiG5XIyq.V7u8ozfwjdwjCMoEGlWt84LrtN8jE1G', ARRAY['admin']), -- password: admin123
('user1@example.com', '$2b$10$rVHMOB1JbQNQFxiG5XIyq.V7u8ozfwjdwjCMoEGlWt84LrtN8jE1G', ARRAY['user']), -- password: admin123
('user2@example.com', '$2b$10$rVHMOB1JbQNQFxiG5XIyq.V7u8ozfwjdwjCMoEGlWt84LrtN8jE1G', ARRAY['user']) -- password: admin123
ON CONFLICT (email) DO NOTHING;

-- Seed data for accounts
INSERT INTO accounts (user_id, account_number, account_type, balance, currency) VALUES
(2, 'ACC001', 'checking', 1000.00, 'USD'),
(3, 'ACC002', 'checking', 2500.00, 'USD'),
(2, 'ACC003', 'savings', 5000.00, 'USD')
ON CONFLICT (account_number) DO NOTHING;

-- Reset sequences to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));