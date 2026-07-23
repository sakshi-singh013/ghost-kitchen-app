CREATE DATABASE IF NOT EXISTS ghost_kitchen;
USE ghost_kitchen;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'owner',
    reset_token_hash VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL
);

-- If you already have a users table from before, run this instead of
-- recreating it, so you don't lose existing data:
-- ALTER TABLE users
--   ADD COLUMN reset_token_hash VARCHAR(255) DEFAULT NULL,
--   ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL;

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    population_density INT,
    avg_income INT
);

CREATE TABLE cuisines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location_id INT NOT NULL,
    cuisine_id INT NOT NULL,
    owner_id INT,
    rating DECIMAL(2,1) DEFAULT 0,
    monthly_revenue DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    order_value DECIMAL(10,2) NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE demand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    cuisine_id INT NOT NULL,
    demand_score DECIMAL(4,2) DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_location_cuisine_demand (location_id, cuisine_id)
);

CREATE TABLE competition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    cuisine_id INT NOT NULL,
    competition_score DECIMAL(4,2) DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_location_cuisine_competition (location_id, cuisine_id)
);