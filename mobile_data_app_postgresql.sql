-- PostgreSQL Schema for DataWaves Mobile Data Purchase Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data plans table
CREATE TABLE data_plans (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('mtn', 'telecel', 'airteltigo')),
    size DECIMAL(5,1) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER,
    custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES data_plans(id) ON DELETE SET NULL,
    network VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'success', 'failed', 'refunded')),
    payment_reference VARCHAR(100) UNIQUE,
    confirmation_method VARCHAR(10) CHECK (confirmation_method IN ('sms', 'email')),
    confirmation_contact VARCHAR(100),
    aggregator_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_data_plans_provider ON data_plans(provider);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_reference ON transactions(payment_reference);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Insert default admin user (password: password123)
INSERT INTO users (full_name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$rVHGOXHSA5lrvSy6TLWhbOxJqO0kO0oCdUWKDFyKKhjDQN8uEhihm', 'admin');

-- Insert sample data plans for MTN
INSERT INTO data_plans (provider, size, price, validity_days) VALUES
('mtn', 1, 5.50, 1),
('mtn', 3, 8.50, 3),
('mtn', 5, 15.00, 7),
('mtn', 10, 25.00, 14),
('mtn', 15, 35.00, 21),
('mtn', 25, 60.00, 30),
('mtn', 45, 100.00, 30),
('mtn', 55, 130.00, 30),
('mtn', 65, 150.00, 30),
('mtn', 73, 170.00, 30),
('mtn', 80, 180.00, 30),
('mtn', 90, 190.00, 30),
('mtn', 93, 200.00, 30),
('mtn', 100, 230.00, 30),
('mtn', 105, 260.00, 30),
('mtn', 110, 280.00, 30),
('mtn', 120, 300.00, 30);

-- Insert sample data plans for Telecel
INSERT INTO data_plans (provider, size, price, validity_days) VALUES
('telecel', 3, 12.00, 1),
('telecel', 5, 18.00, 3),
('telecel', 10, 28.00, 7),
('telecel', 15, 38.00, 14),
('telecel', 23, 58.00, 21),
('telecel', 35, 65.00, 30),
('telecel', 45, 80.00, 30),
('telecel', 53, 100.00, 30),
('telecel', 65, 120.00, 30),
('telecel', 73, 130.00, 30),
('telecel', 82, 140.00, 30),
('telecel', 90, 160.00, 30),
('telecel', 100, 172.00, 30),
('telecel', 105, 180.00, 30),
('telecel', 110, 195.00, 30),
('telecel', 115, 205.00, 30),
('telecel', 120, 228.00, 30),
('telecel', 125, 238.00, 30),
('telecel', 130, 258.00, 30),
('telecel', 135, 265.00, 30),
('telecel', 150, 280.00, 30),
('telecel', 160, 290.00, 30),
('telecel', 170, 300.00, 30),
('telecel', 175, 310.00, 30),
('telecel', 185, 325.00, 30),
('telecel', 200, 350.00, 30);

-- Insert sample data plans for AirtelTigo
INSERT INTO data_plans (provider, size, price, validity_days) VALUES
('airteltigo', 1, 4.00, 1),
('airteltigo', 3, 13.00, 3),
('airteltigo', 5, 20.00, 7),
('airteltigo', 10, 32.00, 14),
('airteltigo', 15, 48.00, 21),
('airteltigo', 20, 68.00, 30),
('airteltigo', 25, 88.00, 30),
('airteltigo', 30, 100.00, 30),
('airteltigo', 40, 140.00, 30),
('airteltigo', 50, 160.00, 30),
('airteltigo', 100, 200.00, 30),
('airteltigo', 130, 225.00, 30),
('airteltigo', 150, 250.00, 30),
('airteltigo', 200, 300.00, 30);

-- Sample user for testing
INSERT INTO users (full_name, email, password, phone) VALUES 
('John Doe', 'john@example.com', '$2b$10$rVHGOXHSA5lrvSy6TLWhbOxJqO0kO0oCdUWKDFyKKhjDQN8uEhihm', '+233241234567');