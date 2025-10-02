# Banco de Dados - HardLab

Este diretório contém a configuração e scripts para o banco de dados MySQL do HardLab.

## 🐳 Docker Compose

O banco de dados é executado via Docker Compose para facilitar o desenvolvimento e deploy.

### Configuração

- **Imagem**: MySQL 8.0
- **Porta**: 3306
- **Banco**: hard_lab
- **Usuário Root**: root
- **Senha Root**: MinhaSenhaSegura
- **Usuário App**: hardlab_user
- **Senha App**: hardlab_password

### Comandos

```bash
# Iniciar o banco
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f mysql

# Parar o banco
docker-compose down

# Parar e remover dados (CUIDADO!)
docker-compose down -v
```

## 📁 Estrutura

```
banco_dados/
├── docker/
│   ├── init-scripts/
│   │   └── 01-init-database.sql    # Script de inicialização
│   └── mysql.cnf                   # Configuração do MySQL
└── README.md                       # Este arquivo
```

## 🔧 Configuração da Aplicação

O Spring Boot está configurado para conectar com o MySQL:

```properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/hard_lab?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=MinhaSenhaSegura
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

## 🌐 Adminer (Opcional)

O Adminer está disponível em: http://localhost:8081

- **Servidor**: mysql
- **Usuário**: root
- **Senha**: MinhaSenhaSegura
- **Banco**: hard_lab

## 📊 Monitoramento

### Logs do MySQL
```bash
# Ver logs em tempo real
docker-compose logs -f mysql

# Ver logs específicos
docker exec hardlab-mysql tail -f /var/log/mysql/general.log
```

### Conectar via CLI
```bash
# Conectar ao MySQL
docker exec -it hardlab-mysql mysql -u root -p

# Conectar com usuário da aplicação
docker exec -it hardlab-mysql mysql -u hardlab_user -p hard_lab
```

## 🔄 Backup e Restore

### Backup
```bash
# Backup completo
docker exec hardlab-mysql mysqldump -u root -pMinhaSenhaSegura hard_lab > backup.sql

# Backup apenas estrutura
docker exec hardlab-mysql mysqldump -u root -pMinhaSenhaSegura --no-data hard_lab > structure.sql

# Backup apenas dados
docker exec hardlab-mysql mysqldump -u root -pMinhaSenhaSegura --no-create-info hard_lab > data.sql
```

### Restore
```bash
# Restaurar backup
docker exec -i hardlab-mysql mysql -u root -pMinhaSenhaSegura hard_lab < backup.sql
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   # Verificar logs
   docker-compose logs mysql
   
   # Remover volumes e recriar
   docker-compose down -v
   docker-compose up -d
   ```

2. **Erro de conexão**
   ```bash
   # Verificar se o container está rodando
   docker-compose ps
   
   # Testar conexão
   docker exec hardlab-mysql mysql -u root -p
   ```

3. **Permissões de arquivo**
   ```bash
   # Corrigir permissões
   sudo chown -R jesus:jesus java-back/banco_dados/
   ```

### Reset Completo

```bash
# Parar e remover tudo
docker-compose down -v

# Remover imagens (opcional)
docker rmi mysql:8.0 adminer:latest

# Recriar do zero
docker-compose up -d
```
