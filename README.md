# HardLab — Sistema de Gestão de Laboratório de Tecnologia

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-green.svg)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49+-purple.svg)](https://expo.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Visão Geral

O **HardLab** é um sistema mobile completo para gestão de laboratórios de tecnologia, desenvolvido com **Spring Boot** no backend e **React Native + Expo** no frontend. O sistema permite o controle completo de componentes eletrônicos, gestão de projetos, sistema de pedidos, reservas de equipamentos e notificações push, oferecendo uma solução integrada para laboratórios de hardware e software.

### 🎯 Objetivos Principais

- **Gestão de Componentes**: Catálogo completo de componentes eletrônicos com controle de estoque
- **Sistema de Pedidos**: Fluxo completo de solicitação, aprovação e rastreamento de pedidos
- **Gestão de Projetos**: Criação e acompanhamento de projetos com equipes e materiais
- **Reservas de Equipamentos**: Sistema de agendamento e controle de equipamentos de laboratório
- **Notificações Push**: Alertas em tempo real para eventos importantes
- **Experiência Mobile**: App nativo com interface intuitiva e recursos nativos

## 🏗️ Arquitetura

### Backend (Spring Boot 3+)
- **Framework**: Spring Boot 3.2+ com Java 17
- **Banco de Dados**: MySQL 8.0+ com JPA/Hibernate
- **Autenticação**: JWT com Spring Security
- **Documentação**: API REST completa com exemplos cURL
- **Segurança**: CORS configurado, validação de dados
- **Arquitetura**: Controllers, Services, Repositories (padrão MVC)

### Frontend (React Native + Expo)
- **Framework**: React Native com Expo SDK 49+
- **Navegação**: Expo Router com roteamento baseado em arquivos
- **Estado**: Context API + AsyncStorage para persistência
- **UI**: Componentes customizados com tema dark/light
- **Recursos Nativos**: Câmera, Push Notifications, AsyncStorage
- **Arquitetura**: Componentes reutilizáveis, hooks customizados

## 🚀 Quick Start

### Pré-requisitos

- **Java 17+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **MySQL 8.0+**
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

### 2. Iniciar Infraestrutura com Docker

```bash
# Inicie MySQL com Docker Compose
docker-compose up -d

# Verifique se o MySQL está rodando
docker-compose ps

# O MySQL estará disponível em:
# Host: localhost:3306
# Database: hard_lab
# Usuário: root
# Senha: MinhaSenhaSegura
```

### 3. Executar Backend

```bash
cd java-back

# Inicie o servidor (o Hibernate criará as tabelas automaticamente)
./mvnw spring-boot:run

# A API estará disponível em: http://localhost:8080
```

### 4. Executar Frontend

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
| **ADMIN** | Gestão completa do sistema + usuários + todos os módulos |
| **PROFESSOR** | Cria projetos, gerencia componentes, aprova pedidos |
| **ACADEMICO** | Visualiza dados, faz pedidos, participa de projetos |

### 🔧 Módulos Principais

#### Componentes Eletrônicos
- Catálogo completo de componentes com especificações técnicas
- Controle de estoque com alertas de baixo estoque
- Categorização por tipo (resistores, capacitores, ICs, etc.)
- Informações de conformidade (RoHS, REACH)
- Localização física no laboratório

#### Sistema de Pedidos
- Criação de pedidos com múltiplos itens
- Seleção de componentes do catálogo
- Cálculo automático de totais
- Rastreamento de status (rascunho, pendente, aprovado, etc.)
- Histórico completo de pedidos

#### Gestão de Projetos
- Criação e edição de projetos
- Definição de responsáveis e equipes
- Controle de fases e progresso
- Vinculação com laboratórios
- Categorização por área de conhecimento

#### Reservas de Equipamentos
- Agendamento de equipamentos de laboratório
- Visualização em calendário (dia, semana, mês)
- Controle de disponibilidade
- Notificações de reservas
- Histórico de uso

#### Notificações
- Sistema de notificações push
- Alertas de estoque baixo
- Lembretes de reservas
- Atualizações de status de pedidos

## 🗄️ Modelo de Dados

### Entidades Principais

```sql
-- Usuários e Autenticação
users(id, gmail, nome, matricula, curso, telefone, ativo, roles, created_at, updated_at)

-- Componentes Eletrônicos
components(id, part_number, name, description, category, manufacturer, current_stock, 
          minimum_stock, storage_location, status, rohs, reach, created_at, updated_at)

-- Projetos
projects(id, name, short_description, categories, responsible, planned_start, 
         planned_end, laboratories, phase, created_at, updated_at)

-- Pedidos/Ordens
lab_orders(id, data, created_by, created_at, updated_at)

-- Reservas
reservations(id, data, created_by, created_at, updated_at)

-- Notificações (futuro)
notifications(id, user_id, title, message, type, read, created_at)
```

### Relacionamentos
- **Usuários** podem ter múltiplas **roles** (ADMIN, PROFESSOR, ACADEMICO)
- **Componentes** são gerenciados por usuários com role PROFESSOR ou ADMIN
- **Projetos** são criados por usuários e podem ter múltiplas categorias
- **Pedidos** e **Reservas** são criados por usuários autenticados

## 🔌 API Endpoints

**Base URL**: `http://localhost:8080`

📚 **Documentação Completa da API**: [java-back/API_ENDPOINTS.md](java-back/API_ENDPOINTS.md)

A API REST oferece **25 endpoints** organizados em módulos:

### 🔐 Autenticação (`/api/auth`)
- Cadastro, login, recuperação e redefinição de senha
- Geração de tokens JWT para autenticação

### 👥 Usuários (`/api/users`) 
- Gestão completa de usuários (CRUD)
- Atualização de roles e permissões
- Acesso restrito a administradores

### 🔧 Componentes (`/api/components`)
- Catálogo completo de componentes eletrônicos
- Busca por texto e código de barras
- Controle de estoque e especificações técnicas

### 📦 Pedidos (`/api/orders`)
- Criação e listagem de pedidos
- Sistema de aprovação e rastreamento

### 📋 Projetos (`/api/projects`)
- Gestão de projetos e equipes
- Controle de fases e progresso

### 📅 Reservas (`/api/reservations`)
- Agendamento de equipamentos
- Sistema de calendário integrado

### 🔔 Notificações (`/api/notifications`)
- Sistema de notificações push
- Registro de tokens de dispositivo

### ⚙️ Sistema (`/api/health`, `/api/cors-test`)
- Verificação de saúde da API
- Teste de configuração CORS

**🎯 Todos os endpoints incluem exemplos cURL prontos para uso!**

## 🔄 Funcionalidades Avançadas

### Sistema de Notificações
- **Notificações Push** em tempo real para eventos importantes
- **Alertas de Estoque** quando componentes atingem estoque mínimo
- **Lembretes de Reservas** para equipamentos agendados
- **Atualizações de Status** para pedidos e projetos

### Controle de Acesso
- **Autenticação JWT** com tokens seguros
- **Roles Hierárquicas** (ADMIN > PROFESSOR > ACADEMICO)
- **CORS Configurado** para acesso cross-origin
- **Validação de Dados** em todos os endpoints

## 📱 Recursos Nativos do App

### Interface Mobile
- **Design Responsivo** adaptado para diferentes tamanhos de tela
- **Tema Dark/Light** com cores personalizáveis
- **Navegação Intuitiva** com Expo Router
- **Componentes Reutilizáveis** para consistência visual

### Funcionalidades Offline
- **Cache Local** com AsyncStorage para dados essenciais
- **Sincronização Automática** quando a conexão é restaurada
- **Modo Offline** para consultas básicas
- **Persistência de Sessão** para continuidade do usuário

### Recursos Nativos
- **Notificações Push** para alertas importantes
- **Câmera Integrada** para captura de fotos
- **Scanner QR Code** para identificação rápida
- **Armazenamento Local** para dados temporários

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
LabPage/
├── java-back/                 # Spring Boot API
│   ├── src/main/java/
│   │   └── com/hard_lab_pag/Hard_Lab/
│   │       ├── auth/         # Autenticação e JWT
│   │       ├── user/         # Gestão de usuários
│   │       ├── components/   # Componentes eletrônicos
│   │       ├── orders/       # Sistema de pedidos
│   │       ├── projects/     # Gestão de projetos
│   │       ├── reservations/ # Reservas de equipamentos
│   │       ├── notifications/ # Sistema de notificações
│   │       ├── security/     # Configurações de segurança
│   │       └── infra/        # Configurações gerais
│   └── src/main/resources/
│       └── application.properties
├── react-front/               # React Native App
│   ├── app/                  # Expo Router pages
│   │   ├── (tabs)/          # Telas principais
│   │   ├── (auth)/          # Autenticação
│   │   ├── (admin)/         # Administração
│   │   └── extra/           # Formulários e modais
│   ├── components/           # Componentes reutilizáveis
│   ├── context/             # Context API
│   ├── hooks/               # Custom hooks
│   └── styles/              # Estilos globais
└── README.md                # Documentação principal
```

### Comandos Úteis

```bash
# Backend
cd java-back
./mvnw clean install        # Build do projeto
./mvnw spring-boot:run      # Executar aplicação
# A API estará em: http://localhost:8080

# Frontend
cd react-front
npm install                 # Instalar dependências
npx expo start             # Iniciar servidor de desenvolvimento
# Escaneie o QR Code com Expo Go

# Docker
docker-compose up -d        # Iniciar MySQL
docker-compose down         # Parar MySQL
docker-compose logs -f      # Ver logs do MySQL

# Testes da API
curl http://localhost:8080/api/health  # Verificar saúde da API
```

## 🐳 Docker

### Configuração do MySQL

O sistema utiliza **MySQL 8.0** rodando em Docker para facilitar o desenvolvimento e deploy:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: hardlab-mysql
    environment:
      MYSQL_ROOT_PASSWORD: MinhaSenhaSegura
      MYSQL_DATABASE: hard_lab
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### Comandos Docker

```bash
# Iniciar MySQL
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f mysql

# Parar MySQL
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Configuração da Aplicação

O Spring Boot está configurado para conectar automaticamente com o MySQL do Docker:

```properties
# application.properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/hard_lab?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=MinhaSenhaSegura
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

## 🧪 Testes e Qualidade

### Backend
- **Testes Unitários**: JUnit 5 + Mockito
- **Testes de Integração**: @SpringBootTest
- **Validação de Dados**: Bean Validation
- **Segurança**: Spring Security + JWT

### Frontend
- **Testes de Componentes**: Jest + React Testing Library
- **Validação de Formulários**: Validação client-side
- **TypeScript**: Tipagem estática para maior confiabilidade
- **ESLint**: Análise de código e padrões

## 📊 Monitoramento

### Health Checks
- **API Status**: `GET /api/health` - Verificação de saúde
- **CORS Test**: `GET /api/cors-test` - Teste de configuração
- **Logs**: Spring Boot logging configurado
- **Métricas**: Monitoramento básico de performance

### Alertas do Sistema
- **Estoque Baixo**: Notificações automáticas para administradores
- **Erros de API**: Logs detalhados para debugging
- **Performance**: Monitoramento de tempo de resposta
- **Segurança**: Logs de tentativas de acesso não autorizado

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
