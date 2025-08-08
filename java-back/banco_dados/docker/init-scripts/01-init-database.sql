-- Script de inicialização do banco de dados HardLab
-- Este script é executado automaticamente quando o container é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar timezone
SET timezone = 'UTC';

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS hardlab;

-- Definir schema padrão
SET search_path TO hardlab, public;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBRO',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de materiais
CREATE TABLE IF NOT EXISTS tipos_materiais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo_id BIGINT REFERENCES tipos_materiais(id),
    dono_id BIGINT REFERENCES usuarios(id),
    codigo_qr VARCHAR(100) UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    unidade VARCHAR(20) NOT NULL DEFAULT 'un',
    localizacao VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'NOVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    area VARCHAR(50) NOT NULL,
    professor_id BIGINT REFERENCES usuarios(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de membros do projeto
CREATE TABLE IF NOT EXISTS projeto_membros (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id),
    papel_no_projeto VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(projeto_id, usuario_id)
);

-- Tabela de materiais usados no projeto
CREATE TABLE IF NOT EXISTS projeto_materiais (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    material_id BIGINT REFERENCES materiais(id),
    quantidade_prevista INTEGER NOT NULL DEFAULT 0,
    quantidade_utilizada INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGSERIAL PRIMARY KEY,
    solicitante_id BIGINT REFERENCES usuarios(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO',
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT REFERENCES pedidos(id) ON DELETE CASCADE,
    material_id BIGINT REFERENCES materiais(id),
    quantidade INTEGER NOT NULL,
    situacao_item VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS anexos (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    hash VARCHAR(64),
    url VARCHAR(500),
    tamanho BIGINT,
    metadados JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,
    recurso VARCHAR(50) NOT NULL,
    recurso_id BIGINT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_materiais_tipo ON materiais(tipo_id);
CREATE INDEX IF NOT EXISTS idx_materiais_dono ON materiais(dono_id);
CREATE INDEX IF NOT EXISTS idx_projetos_professor ON projetos(professor_id);
CREATE INDEX IF NOT EXISTS idx_projeto_membros_projeto ON projeto_membros(projeto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_solicitante ON pedidos(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_anexos_projeto ON anexos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria(timestamp);

-- Inserir dados iniciais
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('Admin', 'admin@hardlab.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Professor Teste', 'professor@hardlab.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PROFESSOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tipos_materiais (nome, descricao) VALUES 
('Resistor', 'Componentes resistivos'),
('Capacitor', 'Componentes capacitivos'),
('Microcontrolador', 'MCUs e processadores'),
('Sensor', 'Sensores diversos'),
('Ferramenta', 'Ferramentas manuais'),
('Impressora 3D', 'Equipamentos de impressão 3D')
ON CONFLICT (nome) DO NOTHING;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON materiais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log de inicialização
INSERT INTO auditoria (usuario_id, acao, recurso, recurso_id, dados_novos)
VALUES (1, 'CREATE', 'DATABASE', 1, '{"message": "Database initialized successfully"}'); 