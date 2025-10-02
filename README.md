# HardLab — Sistema de Gestão de Laboratório de Tecnologia

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-green.svg)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49+-purple.svg)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Visão Geral

O **HardLab** é um sistema mobile completo para gestão de laboratórios de tecnologia, permitindo o controle de projetos, materiais, pedidos e anexos com rastreabilidade completa. O sistema foi desenvolvido para atender às necessidades específicas de laboratórios de hardware e software, oferecendo controle de estoque, gestão de projetos e auditoria de movimentações.

### 🎯 Objetivos Principais

- **Gestão de Projetos**: Criação, edição e acompanhamento de projetos com equipes e materiais
- **Controle de Materiais**: Catálogo organizado por tipos com controle de estoque e localização
- **Sistema de Pedidos**: Fluxo completo de solicitação, aprovação e devolução de materiais
- **Gestão de Anexos**: Upload e organização de arquivos (STL, firmware, documentação)
- **Auditoria**: Rastreabilidade completa de todas as operações
- **Experiência Mobile**: App nativo com recursos de câmera, QR Code e notificações push

## 🏗️ Arquitetura

### Backend (Spring Boot 3+)
- **Framework**: Spring Boot 3.2+ com Java 17
- **Banco de Dados**: PostgreSQL 15+ com Flyway para migrations
- **Autenticação**: JWT com Spring Security
- **Documentação**: OpenAPI/Swagger
- **Storage**: MinIO (S3 compatível) para anexos
- **QR Codes**: QRGen/ZXing para geração de códigos

### Frontend (React Native + Expo)
- **Framework**: React Native com Expo SDK 49+
- **Navegação**: Expo Router
- **Estado**: TanStack Query com persistência offline
- **UI**: React Native Paper
- **Recursos Nativos**: Câmera, QR Scanner, Push Notifications
- **Storage Local**: SQLite para cache offline

## 🚀 Quick Start

### Pré-requisitos

- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **Expo CLI**: `npm install -g @expo/cli`

### 1. Clone e Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/Giuseph66/LabPage.git
cd LabPage

# Instale as dependências do frontend
cd react-front
npm install

# Instale as dependências do backend
cd ../java-back
./mvnw clean install
```

### 2. Configuração do Ambiente

```bash
# Copie os arquivos de configuração
cp java-back/src/main/resources/application-example.yml java-back/src/main/resources/application-local.yml
cp react-front/app.config.example.js react-front/app.config.js

# Edite as configurações conforme necessário
```

### 3. Iniciar Infraestrutura

```bash
# Inicie PostgreSQL e MinIO
docker-compose up -d

# Verifique se os serviços estão rodando
docker-compose ps
```

### 4. Executar Backend

```bash
cd java-back

# Execute as migrations
./mvnw flyway:migrate

# Inicie o servidor
./mvnw spring-boot:run

# Acesse a documentação da API
# http://localhost:8080/swagger-ui.html
```

### 5. Executar Frontend

```bash
cd react-front

# Inicie o servidor de desenvolvimento
npx expo start

# Escaneie o QR Code com o app Expo Go
# ou pressione 'a' para abrir no Android Simulator
# ou pressione 'i' para abrir no iOS Simulator
```

## 📱 Funcionalidades

### 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|------------|
| **ADMIN** | Gestão completa + usuários + tipos de materiais |
| **PROFESSOR** | Cria projetos, registra materiais próprios, aprova pedidos |
| **MEMBRO** | Solicita materiais, registra progresso, anexa arquivos |
| **VISITANTE** | Visualização pública de projetos (opcional) |

### 🔧 Módulos Principais

#### Projetos
- Criação e edição de projetos
- Gestão de equipes e responsáveis
- Controle de status e progresso
- Vinculação com materiais utilizados
- Upload de anexos (STL, firmware, docs)

#### Materiais
- Catálogo organizado por tipos
- Controle de estoque e localização
- Sistema de donos (professores/pessoas)
- Geração automática de QR Codes
- Estados: novo, usado, defeituoso

#### Pedidos
- Fluxo completo: Solicitação → Aprovação → Retirada → Devolução
- Controle de baixas de estoque
- Notificações automáticas
- Rastreabilidade de movimentações

#### Anexos
- Upload de múltiplos tipos de arquivo
- Processamento assíncrono (hash, metadados, thumbnails)
- Organização por projeto
- Visualização integrada

## 🗄️ Modelo de Dados

### Tabelas Principais

```sql
-- Usuários e Autenticação
usuarios(id, nome, email, role, ativo, created_at)

-- Projetos e Equipes
projetos(id, titulo, descricao, area, professor_id, status, created_at, updated_at)
projeto_membros(id, projeto_id, usuario_id, papel_no_projeto)

-- Materiais e Tipos
tipos_materiais(id, nome, descricao)
materiais(id, nome, tipo_id, dono_id, codigo_qr, quantidade, unidade, localizacao, estado)

-- Relacionamentos
projeto_materiais(id, projeto_id, material_id, quantidade_prevista, quantidade_utilizada)

-- Pedidos e Movimentações
pedidos(id, solicitante_id, status, observacao, created_at, updated_at)
pedido_itens(id, pedido_id, material_id, quantidade, situacao_item)

-- Anexos e Arquivos
anexos(id, projeto_id, nome, tipo, hash, url, tamanho, metadados, created_at)

-- Auditoria
auditoria(id, usuario_id, acao, recurso, recurso_id, dados_anteriores, dados_novos, timestamp)
```

## 🔌 API Endpoints

Base URL: `http://localhost:8080`

👉 Documentação com cURL (completa e organizada): [java-back/API_ENDPOINTS.md](java-back/API_ENDPOINTS.md)

### Autenticação (`/api/auth`)
- `POST /api/auth/register` — Cadastrar usuário e receber JWT
- `POST /api/auth/login` — Autenticar e receber JWT
- `POST /api/auth/forgot-password` — Iniciar recuperação de senha
- `POST /api/auth/reset-password` — Redefinir senha com token

### Usuários (`/api/users`)
- `GET /api/users/me` — Gmail do usuário autenticado (JWT)
- `GET /api/users` — Listar usuários (ROLE_ADMIN)
- `POST /api/users` — Criar usuário (ROLE_ADMIN)
- `PUT /api/users/{id}` — Atualizar usuário (ROLE_ADMIN)
- `DELETE /api/users/{id}` — Excluir usuário (ROLE_ADMIN)
- `PUT /api/users/{id}/roles` — Atualizar roles (ROLE_ADMIN)

### Notificações (`/api/notifications`)
- `POST /api/notifications/device-token` — Registrar token de push do dispositivo (JWT)

### Componentes (`/api/components`)
- `GET /api/components/by-barcode?code=...` — Buscar por código/QR (stub)

## 🔄 Processos Assíncronos

### Tarefas Agendadas (@Scheduled)
- **Verificação diária de estoque baixo** - Envia notificações para administradores
- **Pedidos pendentes** - Lembretes para aprovação
- **Limpeza de arquivos temporários** - Remove arquivos não utilizados

### Tarefas Assíncronas (@Async)
- **Processamento de anexos** - Cálculo de hash, extração de metadados
- **Geração de QR Codes** - Criação e cache de códigos
- **Geração de thumbnails** - Para imagens e arquivos 3D
- **Envio de notificações** - Push notifications para eventos importantes

## 📱 Recursos Nativos do App

### Câmera e QR Code
- **Scanner de QR Code** para entrada/saída rápida de materiais
- **Captura de fotos** para documentação de projetos
- **Leitura de códigos de barras** (opcional)

### Notificações Push
- **Aprovações de pedidos** - Notificação imediata para solicitantes
- **Estoque baixo** - Alertas para administradores
- **Prazos de projetos** - Lembretes para equipes
- **Devoluções pendentes** - Avisos para responsáveis

### Funcionalidades Offline
- **Cache inteligente** com TanStack Query persist
- **Sincronização automática** quando online
- **Modo offline** para consultas básicas
- **Upload em fila** para arquivos grandes

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
LabPage/
├── java-back/                 # Spring Boot API
│   ├── src/main/java/
│   │   ├── com/hardlab/
│   │   │   ├── config/      # Configurações
│   │   │   ├── controller/  # Controllers REST
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── entity/      # Entidades JPA
│   │   │   ├── repository/  # Repositories
│   │   │   ├── service/     # Lógica de negócio
│   │   │   └── security/    # Configurações de segurança
│   │   └── resources/
│   │       ├── db/migration/ # Flyway migrations
│   │       └── application.yml
│   └── Dockerfile
├── react-front/               # React Native App
│   ├── app/                  # Expo Router pages
│   ├── components/           # Componentes reutilizáveis
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── stores/              # Estado global
│   └── types/               # TypeScript types
├── docker-compose.yml        # Infraestrutura local
├── docs/                    # Documentação
└── scripts/                 # Scripts de automação
```

### Comandos Úteis

```bash
# Backend
cd java-back
./mvnw clean install        # Build do projeto
./mvnw test                 # Executar testes
./mvnw flyway:migrate       # Executar migrations
./mvnw spring-boot:run      # Executar aplicação

# Frontend
cd react-front
npm run start               # Iniciar servidor de desenvolvimento
npm run build               # Build para produção
npm run lint                # Verificar código
npm run test                # Executar testes

# Docker
docker-compose up -d        # Iniciar infraestrutura
docker-compose down         # Parar infraestrutura
docker-compose logs -f      # Ver logs
```

## 🧪 Testes

### Backend
- **Testes Unitários**: JUnit 5 + Mockito
- **Testes de Integração**: @SpringBootTest
- **Testes de API**: @WebMvcTest
- **Cobertura**: JaCoCo

### Frontend
- **Testes Unitários**: Jest + React Testing Library
- **Testes E2E**: Detox (opcional)
- **Testes de Componentes**: Storybook

## 📊 Monitoramento

### Métricas
- **Health Checks**: Spring Boot Actuator
- **Métricas**: Micrometer + Prometheus
- **Logs**: Logback + ELK Stack (opcional)
- **Performance**: APM com New Relic/Datadog

### Alertas
- **Estoque baixo** - Notificações automáticas
- **Erros de API** - Monitoramento de status codes
- **Performance** - Tempo de resposta das APIs
- **Storage** - Uso de disco para anexos

## 🚀 Deploy

### Ambiente de Desenvolvimento
```bash
# Local com Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

### Ambiente de Produção
```bash
# Build das imagens
docker build -t hardlab-backend ./java-back
docker build -t hardlab-frontend ./react-front

# Deploy com Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD (GitHub Actions)
- **Build automático** em push para main
- **Testes automatizados** em pull requests
- **Deploy automático** para staging/production
- **Security scanning** com dependabot

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código
- **Backend**: Google Java Style Guide
- **Frontend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Documentação**: Javadoc + JSDoc

## �� Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Backend**: [Seu Nome]
- **Desenvolvedor Frontend**: [Seu Nome]
- **Designer UX/UI**: [Seu Nome]
- **DevOps**: [Seu Nome]

## 📞 Suporte

- **Email**: hardlab@exemplo.com
- **Issues**: [GitHub Issues](https://github.com/Giuseph66/LabPage/issues)
- **Documentação**: [Wiki](https://github.com/Giuseph66/LabPage/wiki)

---

**HardLab** - Transformando a gestão de laboratórios de tecnologia 🚀
