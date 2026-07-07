-- Structure de la base de données Mon Miam Miam (PostgreSQL)
-- Date de création : 23 octobre 2025

-- Création des types ENUM personnalisés
CREATE TYPE delivery_type_enum AS ENUM ('delivery', 'on_site');
CREATE TYPE menu_item_type_enum AS ENUM ('boisson', 'dessert', 'petit-dejeuné', 'déjeuné');
CREATE TYPE order_status_enum AS ENUM ('pending', 'preparing', 'completed', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('mobile_money', 'card');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE loyalty_transaction_type_enum AS ENUM ('earned', 'redeemed', 'expired', 'bonus', 'referral');
CREATE TYPE referral_status_enum AS ENUM ('pending', 'completed');
CREATE TYPE complaint_status_enum AS ENUM ('pending', 'in_progress', 'resolved', 'rejected');
CREATE TYPE employee_status_enum AS ENUM ('active', 'inactive');

-- Table des utilisateurs
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL UNIQUE,
    location TEXT NULL,
    loyalty_points INTEGER DEFAULT 0,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    referrer_id BIGINT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_email_deleted ON users(email, deleted_at);
CREATE INDEX idx_referral_code ON users(referral_code);

-- Table des catégories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX idx_order ON categories("order");

-- Table des items du menu
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) NULL,
    type menu_item_type_enum NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX idx_category_available ON menu_items(category_id, is_available);
CREATE INDEX idx_popularity ON menu_items(popularity_score);

-- Table des commandes
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    delivery_type delivery_type_enum NOT NULL,
    delivery_address TEXT NULL,
    delivery_time TIMESTAMP NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    points_used INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    status order_status_enum DEFAULT 'pending',
    comment TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_status ON orders(user_id, status);
CREATE INDEX idx_status_date ON orders(status, created_at);

-- Table des items de commande
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);
CREATE INDEX idx_order ON order_items(order_id);

-- Table des paiements
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    payment_method payment_method_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status payment_status_enum DEFAULT 'pending',
    provider VARCHAR(255) NULL,
    provider_response TEXT NULL,
    payment_url VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX idx_transaction_status ON payments(transaction_id, status);

-- Table des transactions de fidélité
CREATE TABLE loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    points INTEGER NOT NULL,
    type loyalty_transaction_type_enum NOT NULL,
    description TEXT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);
CREATE INDEX idx_user_expiry ON loyalty_transactions(user_id, expires_at);
CREATE INDEX idx_type_date ON loyalty_transactions(type, created_at);

-- Table des parrainages
CREATE TABLE referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL,
    referee_id BIGINT NOT NULL,
    reward_points INTEGER DEFAULT 5,
    status referral_status_enum DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (referrer_id, referee_id)
);
CREATE INDEX idx_referrer_status ON referrals(referrer_id, status);

-- Table des plaintes
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    status complaint_status_enum DEFAULT 'pending',
    employee_response TEXT NULL,
    handled_by BIGINT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_user_status ON complaints(user_id, status);
CREATE INDEX idx_order_status ON complaints(order_id, status);

-- Table des employés
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    status employee_status_enum DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_status ON employees(user_id, status);

-- Table des promotions
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX idx_dates_active ON promotions(is_active, start_date, end_date);

-- Table des paramètres
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Table des sessions
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user ON sessions(user_id);
CREATE INDEX idx_last_activity ON sessions(last_activity);

-- Ajout des commentaires sur les tables
COMMENT ON TABLE users IS 'Table des utilisateurs du système';
COMMENT ON TABLE categories IS 'Catégories des items du menu';
COMMENT ON TABLE menu_items IS 'Items disponibles dans le menu';
COMMENT ON TABLE orders IS 'Commandes des clients';
COMMENT ON TABLE order_items IS 'Détails des items dans chaque commande';
COMMENT ON TABLE payments IS 'Paiements associés aux commandes';
COMMENT ON TABLE loyalty_transactions IS 'Transactions de points de fidélité';
COMMENT ON TABLE referrals IS 'Système de parrainage entre utilisateurs';
COMMENT ON TABLE complaints IS 'Plaintes et réclamations des clients';
COMMENT ON TABLE employees IS 'Employés du restaurant';
COMMENT ON TABLE promotions IS 'Promotions et offres spéciales';
COMMENT ON TABLE settings IS 'Paramètres généraux du système';
COMMENT ON TABLE sessions IS 'Sessions utilisateurs';