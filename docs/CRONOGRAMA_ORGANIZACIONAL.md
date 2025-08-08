# Cronograma Organizacional - HardLab

## 📅 Visão Geral do Cronograma

**Duração Total**: 8 semanas  
**Início**: [Data de Início]  
**Entrega Final**: [Data de Entrega]  
**Metodologia**: Desenvolvimento Ágil com entregas incrementais

---

## 🎯 Semana 1: Tema & Requisitos

### 📋 Objetivos da Semana
- Definir escopo completo do projeto
- Documentar requisitos funcionais e não funcionais
- Criar wireframes principais
- Configurar ambiente de desenvolvimento

### ✅ Entregáveis
- [ ] **Documento de Requisitos** (`docs/REQUISITOS.md`)
- [ ] **Wireframes** (Figma/Adobe XD)
- [ ] **Repositórios** criados (GitHub)
- [ ] **Project Board** configurado
- [ ] **Ambiente de desenvolvimento** funcional

### 📝 Tarefas Detalhadas

#### Dia 1-2: Documentação
- [ ] Definir problema e justificativa
- [ ] Identificar público-alvo
- [ ] Documentar objetivos específicos
- [ ] Definir escopo MVP
- [ ] Mapear papéis e permissões

#### Dia 3-4: Design
- [ ] Criar wireframes das telas principais:
  - [ ] Login/Autenticação
  - [ ] Dashboard
  - [ ] Lista de Projetos
  - [ ] Cadastro de Materiais
  - [ ] Sistema de Pedidos
  - [ ] Upload de Anexos

#### Dia 5: Setup
- [ ] Criar repositório no GitHub
- [ ] Configurar project board (Kanban)
- [ ] Definir estrutura de branches
- [ ] Configurar ambiente local

### 🎨 Wireframes Principais
1. **Tela de Login** - Autenticação com email/senha
2. **Dashboard** - Visão geral de projetos e materiais
3. **Projetos** - Lista, detalhes e criação
4. **Materiais** - Catálogo e cadastro
5. **Pedidos** - Fluxo de solicitação
6. **Scanner QR** - Interface de leitura

### 📊 Métricas de Sucesso
- [ ] Documento de requisitos aprovado
- [ ] Wireframes validados com stakeholders
- [ ] Ambiente de desenvolvimento funcionando
- [ ] Repositório configurado com CI/CD básico

---

## 🎯 Semana 2: Modelagem

### 📋 Objetivos da Semana
- Definir modelo de dados completo
- Criar documentação da API
- Desenvolver protótipo navegável
- Validar regras de negócio

### ✅ Entregáveis
- [ ] **Diagrama ER** (`docs/DER.md`)
- [ ] **OpenAPI Specification** (`docs/api/openapi.yml`)
- [ ] **Protótipo UI** navegável
- [ ] **Regras de Negócio** documentadas
- [ ] **Modelo de Dados** validado

### 📝 Tarefas Detalhadas

#### Dia 1-2: Modelagem de Dados
- [ ] Criar diagrama ER completo
- [ ] Definir relacionamentos entre entidades
- [ ] Documentar constraints e regras
- [ ] Validar normalização

#### Dia 3-4: API Design
- [ ] Definir endpoints REST
- [ ] Criar especificação OpenAPI
- [ ] Documentar DTOs
- [ ] Definir códigos de resposta

#### Dia 5: Protótipo
- [ ] Desenvolver protótipo navegável
- [ ] Implementar fluxos principais
- [ ] Validar UX/UI
- [ ] Coletar feedback

### 🗄️ Modelo de Dados
```sql
-- Entidades principais
usuarios(id, nome, email, role, ativo)
projetos(id, titulo, descricao, area, professor_id, status)
materiais(id, nome, tipo_id, dono_id, quantidade, localizacao)
pedidos(id, solicitante_id, status, observacao)
anexos(id, projeto_id, nome, tipo, url, tamanho)
```

### 📊 Métricas de Sucesso
- [ ] Diagrama ER aprovado
- [ ] API specification completa
- [ ] Protótipo funcional
- [ ] Regras de negócio validadas

---

## 🎯 Semana 3: Setup

### 📋 Objetivos da Semana
- Configurar backend Spring Boot
- Configurar frontend Expo
- Implementar autenticação básica
- Configurar banco de dados

### ✅ Entregáveis
- [ ] **Backend** funcionando com Spring Boot
- [ ] **Frontend** configurado com Expo
- [ ] **Autenticação JWT** implementada
- [ ] **Banco PostgreSQL** configurado
- [ ] **Docker Compose** funcional

### 📝 Tarefas Detalhadas

#### Dia 1-2: Backend Setup
- [ ] Criar projeto Spring Boot
- [ ] Configurar dependências (web, data-jpa, security)
- [ ] Configurar PostgreSQL + Flyway
- [ ] Implementar autenticação JWT
- [ ] Configurar Swagger/OpenAPI

#### Dia 3-4: Frontend Setup
- [ ] Criar projeto Expo
- [ ] Configurar expo-router
- [ ] Implementar contexto de autenticação
- [ ] Configurar TanStack Query
- [ ] Criar tela de login

#### Dia 5: Integração
- [ ] Conectar frontend com backend
- [ ] Testar fluxo de autenticação
- [ ] Configurar Docker Compose
- [ ] Documentar setup

### 🛠️ Stack Configurada
- **Backend**: Spring Boot 3.2+ + Java 17
- **Frontend**: Expo SDK 49+ + React Native
- **Banco**: PostgreSQL 15+ + Flyway
- **Auth**: JWT + Spring Security
- **Docs**: Swagger/OpenAPI

### 📊 Métricas de Sucesso
- [ ] Backend rodando na porta 8080
- [ ] Frontend rodando com Expo
- [ ] Autenticação funcionando
- [ ] Swagger acessível
- [ ] Docker Compose funcional

---

## 🎯 Semana 4: Materiais & Tipos

### 📋 Objetivos da Semana
- Implementar CRUD de materiais
- Implementar CRUD de tipos de materiais
- Criar sistema de QR Codes
- Implementar upload de imagens

### ✅ Entregáveis
- [ ] **CRUD Materiais** completo
- [ ] **CRUD Tipos** completo
- [ ] **Sistema de QR Codes** funcional
- [ ] **Upload de imagens** implementado
- [ ] **Listas no app** funcionais

### 📝 Tarefas Detalhadas

#### Dia 1-2: Backend - Materiais
- [ ] Criar entidade Material
- [ ] Implementar repository
- [ ] Criar controller REST
- [ ] Implementar validações
- [ ] Adicionar testes unitários

#### Dia 3: Backend - Tipos e QR
- [ ] Criar entidade TipoMaterial
- [ ] Implementar geração de QR Codes
- [ ] Configurar upload de imagens
- [ ] Implementar MinIO/S3

#### Dia 4-5: Frontend
- [ ] Criar telas de listagem
- [ ] Implementar formulários de cadastro
- [ ] Integrar com API
- [ ] Implementar upload de imagens
- [ ] Adicionar QR Code display

### 🔧 Funcionalidades Implementadas
- ✅ Cadastro de materiais
- ✅ Cadastro de tipos
- ✅ Geração de QR Codes
- ✅ Upload de imagens
- ✅ Listagem com filtros
- ✅ Busca e paginação

### 📊 Métricas de Sucesso
- [ ] CRUD completo funcionando
- [ ] QR Codes sendo gerados
- [ ] Upload de imagens funcionando
- [ ] App listando materiais
- [ ] Testes passando

---

## 🎯 Semana 5: Projetos & Anexos

### 📋 Objetivos da Semana
- Implementar CRUD de projetos
- Implementar gestão de membros
- Criar sistema de anexos
- Implementar upload assíncrono

### ✅ Entregáveis
- [ ] **CRUD Projetos** completo
- [ ] **Gestão de membros** funcional
- [ ] **Sistema de anexos** implementado
- [ ] **Upload assíncrono** funcionando
- [ ] **Vínculo materiais-projetos** implementado

### 📝 Tarefas Detalhadas

#### Dia 1-2: Backend - Projetos
- [ ] Criar entidade Projeto
- [ ] Implementar relacionamento com membros
- [ ] Criar controller REST
- [ ] Implementar validações
- [ ] Adicionar testes

#### Dia 3: Backend - Anexos
- [ ] Criar entidade Anexo
- [ ] Implementar upload multipart
- [ ] Configurar processamento assíncrono
- [ ] Implementar cálculo de hash
- [ ] Adicionar extração de metadados

#### Dia 4-5: Frontend
- [ ] Criar telas de projetos
- [ ] Implementar gestão de membros
- [ ] Integrar upload de anexos
- [ ] Implementar visualização de arquivos
- [ ] Adicionar progress indicators

### 🔧 Funcionalidades Implementadas
- ✅ CRUD de projetos
- ✅ Adição/remoção de membros
- ✅ Upload de anexos (STL, PDF, IMG)
- ✅ Processamento assíncrono
- ✅ Visualização de arquivos
- ✅ Vínculo com materiais

### 📊 Métricas de Sucesso
- [ ] Projetos sendo criados/editados
- [ ] Membros sendo adicionados
- [ ] Anexos sendo uploadados
- [ ] Processamento assíncrono funcionando
- [ ] App navegável

---

## 🎯 Semana 6: Pedidos & Fluxos

### 📋 Objetivos da Semana
- Implementar sistema de pedidos
- Criar fluxo de aprovação
- Implementar scanner QR
- Implementar controle de estoque

### ✅ Entregáveis
- [ ] **Sistema de pedidos** completo
- [ ] **Fluxo de aprovação** funcionando
- [ ] **Scanner QR** integrado
- [ ] **Controle de estoque** implementado
- [ ] **Notificações** básicas

### 📝 Tarefas Detalhadas

#### Dia 1-2: Backend - Pedidos
- [ ] Criar entidades Pedido e PedidoItem
- [ ] Implementar fluxo de estados
- [ ] Criar controllers REST
- [ ] Implementar validações de negócio
- [ ] Adicionar testes

#### Dia 3: Backend - Estoque
- [ ] Implementar controle de estoque
- [ ] Criar sistema de baixas
- [ ] Implementar devoluções
- [ ] Adicionar auditoria

#### Dia 4-5: Frontend
- [ ] Criar telas de pedidos
- [ ] Implementar scanner QR
- [ ] Integrar com câmera
- [ ] Implementar notificações
- [ ] Adicionar fluxo completo

### 🔄 Fluxo de Pedidos
1. **Solicitação** - Usuário solicita materiais
2. **Aprovação** - Professor/Admin aprova
3. **Retirada** - Material é retirado
4. **Devolução** - Material é devolvido
5. **Baixa** - Material é consumido (se aplicável)

### 📊 Métricas de Sucesso
- [ ] Pedidos sendo criados
- [ ] Fluxo de aprovação funcionando
- [ ] Scanner QR operacional
- [ ] Estoque sendo atualizado
- [ ] Notificações sendo enviadas

---

## 🎯 Semana 7: Assíncrono & Nativos

### 📋 Objetivos da Semana
- Implementar tarefas agendadas
- Configurar push notifications
- Implementar funcionalidades offline
- Adicionar auditoria básica

### ✅ Entregáveis
- [ ] **Tarefas agendadas** funcionando
- [ ] **Push notifications** configuradas
- [ ] **Modo offline** implementado
- [ ] **Auditoria** básica funcionando
- [ ] **Sincronização** automática

### 📝 Tarefas Detalhadas

#### Dia 1-2: Backend - Assíncrono
- [ ] Implementar @Scheduled tasks
- [ ] Configurar @Async para uploads
- [ ] Implementar verificação de estoque baixo
- [ ] Criar sistema de notificações
- [ ] Adicionar auditoria

#### Dia 3: Frontend - Offline
- [ ] Configurar TanStack Query persist
- [ ] Implementar SQLite local
- [ ] Criar sincronização automática
- [ ] Adicionar indicadores de conectividade

#### Dia 4-5: Frontend - Nativos
- [ ] Configurar push notifications
- [ ] Implementar recebimento de notificações
- [ ] Adicionar permissões de câmera
- [ ] Testar recursos nativos

### 🔄 Tarefas Agendadas
- **Diária**: Verificação de estoque baixo
- **Diária**: Pedidos pendentes
- **Semanal**: Limpeza de arquivos temporários
- **Mensal**: Relatórios de uso

### 📊 Métricas de Sucesso
- [ ] Tarefas agendadas executando
- [ ] Push notifications funcionando
- [ ] App funcionando offline
- [ ] Auditoria registrando ações
- [ ] Sincronização automática

---

## 🎯 Semana 8: Refinos & Entrega

### 📋 Objetivos da Semana
- Implementar relatórios
- Finalizar testes
- Polir interface
- Preparar apresentação

### ✅ Entregáveis
- [ ] **Relatórios** implementados
- [ ] **Testes** completos
- [ ] **UI/UX** polida
- [ ] **Documentação** final
- [ ] **Apresentação** pronta

### 📝 Tarefas Detalhadas

#### Dia 1-2: Relatórios e Testes
- [ ] Implementar relatórios de estoque
- [ ] Criar relatórios de uso por projeto
- [ ] Finalizar testes unitários
- [ ] Implementar testes de integração
- [ ] Adicionar testes E2E

#### Dia 3-4: Polimento
- [ ] Revisar e polir UI/UX
- [ ] Otimizar performance
- [ ] Corrigir bugs encontrados
- [ ] Melhorar responsividade
- [ ] Adicionar animações

#### Dia 5: Entrega
- [ ] Finalizar documentação
- [ ] Preparar apresentação
- [ ] Criar vídeo demo
- [ ] Organizar repositório
- [ ] Preparar deploy

### 📊 Relatórios Implementados
- **Estoque baixo** - Materiais com quantidade mínima
- **Uso por projeto** - Materiais utilizados por projeto
- **Movimentações** - Histórico de entrada/saída
- **Pedidos pendentes** - Pedidos aguardando aprovação

### 📊 Métricas de Sucesso
- [ ] Relatórios funcionando
- [ ] Testes com cobertura >80%
- [ ] UI/UX polida
- [ ] Documentação completa
- [ ] Apresentação pronta

---

## 📊 Métricas Gerais do Projeto

### 🎯 Objetivos de Qualidade
- **Cobertura de Testes**: >80%
- **Performance**: <2s resposta API
- **Disponibilidade**: >99% uptime
- **Usabilidade**: Score >85 no teste de usabilidade

### 📈 KPIs de Progresso
- **Semanas Concluídas**: 8/8
- **Funcionalidades Implementadas**: 100%
- **Bugs Críticos**: 0
- **Documentação**: 100% completa

### 🔍 Critérios de Aceitação
- [ ] Sistema funcionando end-to-end
- [ ] Todos os perfis de usuário implementados
- [ ] Recursos nativos funcionando
- [ ] Processos assíncronos operacionais
- [ ] Interface responsiva e intuitiva

---

## 🚀 Checklist de Entrega Final

### 📋 Documentação
- [ ] README completo e atualizado
- [ ] Documentação da API (Swagger)
- [ ] Guia de instalação
- [ ] Manual do usuário
- [ ] Documentação técnica

### 🧪 Qualidade
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes E2E passando
- [ ] Code review finalizado
- [ ] Linting sem erros

### 🎨 Interface
- [ ] UI/UX polida
- [ ] Responsividade testada
- [ ] Acessibilidade implementada
- [ ] Performance otimizada
- [ ] Animações suaves

### 🚀 Deploy
- [ ] Ambiente de produção configurado
- [ ] CI/CD funcionando
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] SSL configurado

### 📱 Funcionalidades
- [ ] Autenticação funcionando
- [ ] CRUD completo implementado
- [ ] Upload de arquivos funcionando
- [ ] Scanner QR operacional
- [ ] Push notifications ativas
- [ ] Modo offline funcionando

---

## 📞 Contatos e Suporte

### 👥 Equipe
- **Tech Lead**: [Nome] - [Email]
- **Backend Developer**: [Nome] - [Email]
- **Frontend Developer**: [Nome] - [Email]
- **UI/UX Designer**: [Nome] - [Email]

### 📧 Comunicação
- **Slack**: #hardlab-dev
- **Email**: hardlab@exemplo.com
- **GitHub**: Issues e Pull Requests
- **Trello**: Board do projeto

### 📅 Reuniões
- **Daily Standup**: Segunda a Sexta, 9h
- **Sprint Review**: Sexta, 16h
- **Sprint Planning**: Segunda, 10h
- **Retrospectiva**: Sexta, 17h

---

**HardLab** - Transformando a gestão de laboratórios de tecnologia 🚀

*Última atualização: [Data]* 