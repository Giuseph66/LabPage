# Dockerfile para PostgreSQL - HardLab
FROM postgres:15-alpine

# Variáveis de ambiente para configuração
ENV POSTGRES_DB=hardlab
ENV POSTGRES_USER=hardlab
ENV POSTGRES_PASSWORD=hardlab123

# Instalar ferramentas úteis
RUN apk add --no-cache \
    bash \
    curl \
    vim \
    && rm -rf /var/cache/apk/*

# Copiar scripts de inicialização
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Configurações de performance do PostgreSQL
COPY ./postgresql.conf /etc/postgresql/postgresql.conf

# Expor porta padrão
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Comando padrão
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"] 