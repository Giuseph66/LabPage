# Banco de Dados - HardLab

## 📋 Visão Geral

Este diretório contém toda a configuração do banco de dados PostgreSQL para o projeto HardLab, incluindo Dockerfile, scripts de inicialização, backup/restore e configurações de performance.

## 🏗️ Estrutura

```
banco_dados/
├──docker
|   ├── Dockerfile                    # Dockerfile do PostgreSQL
|   ├── postgresql.conf              # Configurações do PostgreSQL
|   ├── docker-compose.yml           # Orquestração dos containers
|   ├── backups/                     # Backups do banco (volume)
|   ├── init-scripts/                # Scripts de inicialização
|   │   └── 01-init-database.sql    # Script principal de inicialização
|   └── logs/                        # Logs do PostgreSQL (volume)
├── scripts/                     # Scripts utilitários
│   ├── backup.sh               # Script de backup
│   └── restore.sh              # Script de restore
└── README.md                    # Este arquivo
```

## 🚀 Quick Start

### 1. Construir e Iniciar o Container

```bash
# Navegar para o diretório
cd banco_dados/docker

# Construir e iniciar os containers
docker-compose up -d

# Verificar status
docker-compose ps
```

### 2. Conectar ao Banco

```bash
# Via psql (dentro do container)
docker exec -it hardlab-postgres psql -U hardlab -d hardlab

# Via linha de comando local
psql -h localhost -p 5432 -U hardlab -d hardlab
```

### 3. Acessar pgAdmin (Opcional)

- **URL**: http://localhost:5050
- **Email**: admin@hardlab.com
- **Senha**: admin123

## 📊 Configurações

### Variáveis de Ambiente

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `POSTGRES_DB` | hardlab | Nome do banco de dados |
| `POSTGRES_USER` | hardlab | Usuário do banco |
| `POSTGRES_PASSWORD` | hardlab123 | Senha do usuário |
| `POSTGRES_INITDB_ARGS` | --encoding=UTF-8 | Argumentos de inicialização |

### Portas

| Serviço | Porta Externa | Porta Interna | Descrição |
|---------|---------------|---------------|-----------|
| PostgreSQL | 5432 | 5432 | Banco de dados |
| pgAdmin    | 5050 |  80  | Interface web  |

## 🗄️ Modelo de Dados

### Tabelas Principais

- **usuarios** - Usuários do sistema
- **tipos_materiais** - Tipos de materiais
- **materiais** - Catálogo de materiais
- **projetos** - Projetos do laboratório
- **projeto_membros** - Membros dos projetos
- **projeto_materiais** - Materiais usados nos projetos
- **pedidos** - Pedidos de materiais
- **pedido_itens** - Itens dos pedidos
- **anexos** - Arquivos anexados aos projetos
- **auditoria** - Log de todas as operações

### Dados Iniciais

O banco é inicializado com:

- **Usuários padrão**:
  - Admin: admin@hardlab.com / password
  - Professor: professor@hardlab.com / password

- **Tipos de materiais**:
  - Resistor, Capacitor, Microcontrolador, Sensor, Ferramenta, Impressora 3D

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f postgres-hardlab

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres-hardlab
```

### Backup e Restore

```bash
# Fazer backup
./scripts/backup.sh

# Fazer backup com nome específico
./scripts/backup.sh meu_backup

# Restaurar backup
./scripts/restore.sh hardlab_backup_20241201_143022.sql

# Listar backups disponíveis
ls -la backups/
```

### Manutenção

```bash
# Conectar ao banco
docker exec -it hardlab-postgres psql -U hardlab -d hardlab

# Verificar status
docker exec hardlab-postgres pg_isready -U hardlab -d hardlab

# Verificar logs
docker exec hardlab-postgres tail -f /var/lib/postgresql/log/postgresql-*.log

# Executar VACUUM
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "VACUUM ANALYZE;"
```

## 📈 Performance

### Configurações Otimizadas

- **shared_buffers**: 256MB
- **effective_cache_size**: 1GB
- **work_mem**: 4MB
- **maintenance_work_mem**: 64MB
- **autovacuum**: Ativado
- **log_min_duration_statement**: 1000ms

### Monitoramento

```bash
# Ver estatísticas de queries
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"

# Ver tamanho das tabelas
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'hardlab'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## 🔒 Segurança

### Configurações de Segurança

- **password_encryption**: scram-sha-256
- **ssl**: off (para desenvolvimento)
- **max_connections**: 100
- **statement_timeout**: 30s
- **lock_timeout**: 10s

### Boas Práticas

1. **Alterar senhas padrão** em produção
2. **Configurar SSL** em ambiente de produção
3. **Fazer backups regulares**
4. **Monitorar logs** de acesso
5. **Usar conexões com pool** na aplicação

## 🐛 Troubleshooting

### Problemas Comuns

#### Container não inicia
```bash
# Verificar logs
docker-compose logs postgres-hardlab

# Verificar se a porta está livre
netstat -tulpn | grep 5432

# Remover volumes e recriar
docker-compose down -v
docker-compose up -d
```

#### Erro de conexão
```bash
# Verificar se o container está rodando
docker ps | grep hardlab-postgres

# Testar conexão
docker exec hardlab-postgres pg_isready -U hardlab -d hardlab

# Verificar configurações de rede
docker network ls
docker network inspect banco_dados_hardlab-network
```

#### Performance lenta
```bash
# Verificar estatísticas
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "SELECT * FROM pg_stat_database;"

# Verificar locks
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "SELECT * FROM pg_locks;"

# Executar ANALYZE
docker exec -it hardlab-postgres psql -U hardlab -d hardlab -c "ANALYZE;"
```

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)
- [pgAdmin](https://www.pgadmin.org/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/runtime-config.html)

---

**HardLab Database** - Configuração otimizada para laboratórios de tecnologia 🗄️ 