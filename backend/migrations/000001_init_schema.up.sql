CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor',
    -- 'admin', 'contributor'
    sso_provider VARCHAR(50),
    sso_id VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255)
);
CREATE TABLE map_points (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE
    SET NULL,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        tahun_berdiri VARCHAR(100),
        description TEXT,
        cover_image TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        -- 'draft', 'pending', 'approved', 'rejected'
        rejection_note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    map_point_id INT UNIQUE REFERENCES map_points(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    cover_photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- SEED DATA
INSERT INTO categories (name, icon)
VALUES ('Pura', 'temple'),
    ('Air Terjun', 'waterfall'),
    ('Pantai', 'beach'),
    ('Gunung', 'mountain'),
    ('Bukit', 'hill'),
    ('Danau', 'lake'),
    ('Hutan Wisata', 'forest'),
    ('Desa Wisata', 'village'),
    ('Museum', 'museum'),
    ('Pasar Seni', 'market');
-- Default Admin (Password: admin123)
INSERT INTO users (
        email,
        password,
        full_name,
        role,
        is_profile_completed
    )
VALUES (
        'admin@gmail.com',
        '$2a$10$YSQhIlEnd39/DCG5n4lT6.H426voVihRs9F/cSIix7UeIb7PNVFa.',
        'Administrator Utama',
        'admin',
        true
    );
