#!/bin/bash

# Script de backup para o banco de dados HardLab
# Uso: ./backup.sh [nome_do_backup]

set -e

# Configurações
DB_NAME="hardlab"
DB_USER="hardlab"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Nome do arquivo de backup
if [ -z "$1" ]; then
    BACKUP_NAME="hardlab_backup_${DATE}.sql"
else
    BACKUP_NAME="$1_${DATE}.sql"
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Caminho completo do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"

echo "🔄 Iniciando backup do banco de dados HardLab..."
echo "📁 Arquivo: $BACKUP_FILE"

# Executar backup
docker exec hardlab-postgres pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    > "$BACKUP_FILE"

# Verificar se o backup foi criado com sucesso
if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso!"
    echo "📊 Tamanho do arquivo: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "📍 Localização: $BACKUP_FILE"
    
    # Manter apenas os últimos 10 backups
    echo "🧹 Limpando backups antigos (mantendo os últimos 10)..."
    ls -t "$BACKUP_DIR"/hardlab_backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm
    
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

echo "�� Backup concluído!" 