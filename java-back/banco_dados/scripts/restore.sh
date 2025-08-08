#!/bin/bash

# Script de restore para o banco de dados HardLab
# Uso: ./restore.sh [arquivo_backup]

set -e

# Configurações
DB_NAME="hardlab"
DB_USER="hardlab"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"

# Verificar se foi fornecido um arquivo de backup
if [ -z "$1" ]; then
    echo "❌ Erro: Arquivo de backup não especificado!"
    echo "💡 Uso: ./restore.sh [arquivo_backup]"
    echo "📁 Backups disponíveis:"
    ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || echo "   Nenhum backup encontrado"
    exit 1
fi

# Verificar se o arquivo existe
BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
    # Tentar encontrar no diretório de backups
    BACKUP_FILE="$BACKUP_DIR/$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Erro: Arquivo de backup não encontrado: $1"
        exit 1
    fi
fi

echo "🔄 Iniciando restore do banco de dados HardLab..."
echo "📁 Arquivo: $BACKUP_FILE"

# Confirmar ação
read -p "⚠️  ATENÇÃO: Isso irá substituir todos os dados atuais. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelado pelo usuário"
    exit 1
fi

# Parar aplicações que usam o banco (se necessário)
echo "🛑 Parando aplicações que usam o banco..."

# Executar restore
echo "📥 Executando restore..."
docker exec -i hardlab-postgres psql \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    < "$BACKUP_FILE"

# Verificar se o restore foi executado com sucesso
if [ $? -eq 0 ]; then
    echo "✅ Restore executado com sucesso!"
    echo "🔄 Reiniciando aplicações..."
    
    # Aqui você pode adicionar comandos para reiniciar suas aplicações
    # docker-compose restart java-back
    # docker-compose restart react-front
    
else
    echo "❌ Erro ao executar restore!"
    exit 1
fi

echo "🎉 Restore concluído!" 