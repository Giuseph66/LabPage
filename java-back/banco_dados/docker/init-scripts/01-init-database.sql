-- Script de inicialização do banco de dados HardLab
-- Este script é executado automaticamente quando o container MySQL é criado

-- Garantir que o banco hard_lab existe
CREATE DATABASE IF NOT EXISTS hard_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco hard_lab
USE hard_lab;

-- Configurações do MySQL para melhor performance
SET GLOBAL innodb_buffer_pool_size = 128M;
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_log_file_size = 64M;

-- Criar usuário específico para a aplicação (opcional)
CREATE USER IF NOT EXISTS 'hardlab_user'@'%' IDENTIFIED BY 'hardlab_password';
GRANT ALL PRIVILEGES ON hard_lab.* TO 'hardlab_user'@'%';
FLUSH PRIVILEGES;

-- Mensagem de confirmação
SELECT 'Banco de dados HardLab inicializado com sucesso!' as status;
