-- USERS TABLE
CREATE TABLE users (
                       id              BIGSERIAL PRIMARY KEY,
                       keycloak_id     VARCHAR(255) UNIQUE,
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       display_name    VARCHAR(100),
                       avatar_url      VARCHAR(500),
                       password_hash   VARCHAR(255) NOT NULL,
                       email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
                       role            VARCHAR(20) NOT NULL DEFAULT 'USER',
                       created_at      TIMESTAMP NOT NULL DEFAULT now(),
                       updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_keycloak_id ON users (keycloak_id);