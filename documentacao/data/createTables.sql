-- Roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Permissions
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Role-Permissions (many-to-many)
CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    developer VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_path VARCHAR(255),
    release_date DATE NOT NULL,
    size_gb DECIMAL(5,2) NOT NULL CHECK (size_gb >= 0)
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Tabela de junção game_categories (N:N)
CREATE TABLE game_categories (
    game_id INT REFERENCES games(game_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, category_id)
);

-- Home Slider
CREATE TABLE home_slider (
    slider_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id) ON DELETE CASCADE,
    display_order INT NOT NULL
);

-- Carts
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items
CREATE TABLE cart_items (
    item_id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(cart_id) ON DELETE CASCADE,
    game_id INT REFERENCES games(game_id),
    quantity INT DEFAULT 1,
    paid BOOLEAN DEFAULT FALSE,
    UNIQUE (cart_id, game_id)
);

-- Library (biblioteca do usuário)
CREATE TABLE library (
    library_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INT REFERENCES games(game_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, game_id)
);

-- Game Details (1:1 com games)
CREATE TABLE game_details (
    game_id INT PRIMARY KEY REFERENCES games(game_id) ON DELETE CASCADE,
    min_requirements TEXT NOT NULL,
    recommended_requirements TEXT NOT NULL
);