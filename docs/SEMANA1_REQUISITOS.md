# Semana 1: Documento de Requisitos - HardLab

## 📋 Informações do Projeto

**Nome do Projeto**: HardLab - Sistema de Gestão de Laboratório de Tecnologia  
**Versão**: 1.0  
**Data**: [Data Atual]  
**Responsável**: [Nome do Responsável]  
**Disciplina**: [Nome da Disciplina]  

---

## 🎯 1. Problema e Justificativa

### 1.1 Contexto do Problema

Os laboratórios de tecnologia (hardware e software) enfrentam desafios significativos na gestão de seus recursos e projetos:

- **Controle de estoque inadequado**: Materiais são perdidos, duplicados ou ficam sem uso
- **Falta de rastreabilidade**: Não há histórico claro de quem utilizou quais materiais
- **Gestão manual ineficiente**: Planilhas e processos manuais são propensos a erros
- **Comunicação fragmentada**: Professores, alunos e administradores não têm visão unificada
- **Documentação dispersa**: Arquivos de projetos (STL, firmware, docs) ficam espalhados
- **Aprovações demoradas**: Processo manual de solicitação e aprovação de materiais

### 1.2 Impacto do Problema

- **Perda de recursos**: Materiais comprados ficam sem uso ou são perdidos
- **Ineficiência operacional**: Tempo gasto em processos manuais
- **Falta de controle**: Não há visibilidade sobre uso real dos recursos
- **Experiência ruim**: Usuários frustrados com processos burocráticos
- **Dificuldade de planejamento**: Impossibilidade de prever necessidades futuras

### 1.3 Justificativa da Solução

O desenvolvimento de um sistema mobile integrado resolve estes problemas através de:

- **Centralização**: Todos os dados em um só lugar
- **Automação**: Processos automatizados reduzem erros
- **Rastreabilidade**: Histórico completo de todas as operações
- **Acessibilidade**: App mobile permite acesso em qualquer lugar
- **Integração**: Conexão entre projetos, materiais e usuários

---

## 🎯 2. Objetivos

### 2.1 Objetivo Geral

Desenvolver um sistema mobile completo para gestão de laboratórios de tecnologia, permitindo controle eficiente de projetos, materiais, pedidos e anexos com rastreabilidade completa.

### 2.2 Objetivos Específicos

#### 2.2.1 Gestão de Projetos
- Permitir criação e edição de projetos com equipes definidas
- Controlar status e progresso dos projetos
- Vincular materiais utilizados aos projetos
- Organizar anexos (STL, firmware, documentação) por projeto

#### 2.2.2 Controle de Materiais
- Criar catálogo organizado por tipos de materiais
- Implementar controle de estoque com localização física
- Gerenciar sistema de donos (professores/pessoas)
- Gerar QR Codes automáticos para identificação rápida

#### 2.2.3 Sistema de Pedidos
- Implementar fluxo completo de solicitação → aprovação → retirada → devolução
- Controlar baixas de estoque automáticas
- Enviar notificações para eventos importantes
- Manter rastreabilidade de todas as movimentações

#### 2.2.4 Experiência Mobile
- Desenvolver app nativo com recursos de câmera e QR Code
- Implementar push notifications para eventos importantes
- Criar funcionalidades offline para uso sem internet
- Oferecer interface intuitiva e responsiva

#### 2.2.5 Auditoria e Relatórios
- Registrar todas as ações dos usuários
- Gerar relatórios de uso e estoque
- Implementar alertas para estoque baixo
- Manter histórico completo de movimentações

---

## 👥 3. Público-Alvo

### 3.1 Perfil dos Usuários

#### 3.1.1 Administradores
- **Características**: Gestores de laboratório, coordenadores
- **Idade**: 30-50 anos
- **Experiência**: Familiarizados com sistemas de gestão
- **Necessidades**: Visão geral, relatórios, controle total
- **Frequência de uso**: Diária

#### 3.1.2 Professores
- **Características**: Docentes responsáveis por projetos
- **Idade**: 25-60 anos
- **Experiência**: Varia de básica a avançada em tecnologia
- **Necessidades**: Gestão de projetos, aprovação de pedidos
- **Frequência de uso**: Semanal

#### 3.1.3 Alunos/Bolsistas
- **Características**: Estudantes e pesquisadores
- **Idade**: 18-30 anos
- **Experiência**: Nativos digitais, familiarizados com apps
- **Necessidades**: Solicitar materiais, registrar progresso
- **Frequência de uso**: Diária durante projetos

#### 3.1.4 Visitantes (Opcional)
- **Características**: Pessoas interessadas em conhecer projetos
- **Idade**: Variada
- **Experiência**: Básica
- **Necessidades**: Visualização pública de projetos
- **Frequência de uso**: Esporádica

### 3.2 Cenários de Uso

#### Cenário 1: Professor criando projeto
1. Professor faz login no app
2. Acessa seção de projetos
3. Cria novo projeto com título, descrição e equipe
4. Define materiais necessários
5. Compartilha projeto com alunos

#### Cenário 2: Aluno solicitando material
1. Aluno acessa app
2. Navega para seção de pedidos
3. Seleciona materiais necessários
4. Preenche justificativa
5. Envia solicitação
6. Recebe notificação quando aprovado

#### Cenário 3: Administrador controlando estoque
1. Admin acessa dashboard
2. Visualiza alertas de estoque baixo
3. Gera relatório de uso
4. Aprova pedidos pendentes
5. Registra novas entradas de materiais

---

## 📱 4. Escopo MVP

### 4.1 Funcionalidades Incluídas

#### 4.1.1 Autenticação e Perfis
- [x] Login/logout com JWT
- [x] Perfis: Admin, Professor, Membro, Visitante
- [x] Controle de permissões por funcionalidade
- [x] Recuperação de senha

#### 4.1.2 Gestão de Projetos
- [x] CRUD completo de projetos
- [x] Gestão de membros da equipe
- [x] Controle de status (Ativo, Pausado, Concluído)
- [x] Vinculação com materiais utilizados
- [x] Upload de anexos (STL, PDF, IMG)

#### 4.1.3 Controle de Materiais
- [x] CRUD de materiais com tipos
- [x] Controle de estoque e localização
- [x] Sistema de donos (professores/pessoas)
- [x] Geração automática de QR Codes
- [x] Estados: Novo, Usado, Defeituoso

#### 4.1.4 Sistema de Pedidos
- [x] Fluxo completo de pedidos
- [x] Aprovação por professores/admins
- [x] Controle de retirada e devolução
- [x] Baixas automáticas de estoque
- [x] Notificações push

#### 4.1.5 Recursos Nativos
- [x] Scanner de QR Code
- [x] Push notifications
- [x] Upload de arquivos
- [x] Modo offline
- [x] Câmera integrada

#### 4.1.6 Processos Assíncronos
- [x] Verificação diária de estoque baixo
- [x] Processamento assíncrono de anexos
- [x] Geração de QR Codes em background
- [x] Envio de notificações automáticas

### 4.2 Funcionalidades Excluídas (Futuras Versões)

- [ ] Integração com sistemas acadêmicos
- [ ] Módulo financeiro (compras, orçamentos)
- [ ] Calendário de reservas de equipamentos
- [ ] Chat interno entre membros
- [ ] Integração com impressoras 3D
- [ ] Módulo de manutenção preventiva
- [ ] Dashboard avançado com analytics
- [ ] API pública para integrações

---

## 🏗️ 5. Arquitetura Técnica

### 5.1 Stack Tecnológica

#### Backend
- **Framework**: Spring Boot 3.2+
- **Linguagem**: Java 17
- **Banco de Dados**: PostgreSQL 15+
- **Migrations**: Flyway
- **Autenticação**: JWT + Spring Security
- **Documentação**: OpenAPI/Swagger
- **Storage**: MinIO (S3 compatível)
- **QR Codes**: QRGen/ZXing

#### Frontend
- **Framework**: React Native
- **Plataforma**: Expo SDK 49+
- **Navegação**: Expo Router
- **Estado**: TanStack Query + persist
- **UI**: React Native Paper
- **Storage Local**: SQLite
- **Upload**: react-native-document-picker

#### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Spring Boot Actuator
- **Logs**: Logback
- **Testes**: JUnit 5, Jest

### 5.2 Modelo de Dados

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

---

## 📊 6. Critérios de Sucesso

### 6.1 Métricas de Qualidade
- **Cobertura de Testes**: >80%
- **Performance**: <2s resposta API
- **Disponibilidade**: >99% uptime
- **Usabilidade**: Score >85 no teste de usabilidade

### 6.2 Critérios de Aceitação
- [ ] Sistema funcionando end-to-end
- [ ] Todos os perfis de usuário implementados
- [ ] Recursos nativos funcionando
- [ ] Processos assíncronos operacionais
- [ ] Interface responsiva e intuitiva

### 6.3 Indicadores de Performance
- **Tempo de resposta**: <2s para operações CRUD
- **Upload de arquivos**: <30s para arquivos até 10MB
- **Scanner QR**: <1s para leitura
- **Sincronização offline**: <5s quando online

---

## 🚀 7. Cronograma de Desenvolvimento

### 7.1 Fases do Projeto

| Semana | Foco | Entregáveis |
|--------|------|-------------|
| **S1** | Requisitos | Documentação, wireframes, setup |
| **S2** | Modelagem | DER, API spec, protótipo |
| **S3** | Setup | Backend, frontend, autenticação |
| **S4** | Materiais | CRUD materiais, QR codes |
| **S5** | Projetos | CRUD projetos, anexos |
| **S6** | Pedidos | Fluxo completo, scanner |
| **S7** | Assíncrono | Tarefas agendadas, offline |
| **S8** | Refinos | Relatórios, testes, entrega |

### 7.2 Marcos Importantes
- **Semana 3**: MVP básico funcionando
- **Semana 5**: Funcionalidades principais implementadas
- **Semana 7**: Sistema completo operacional
- **Semana 8**: Entrega final

---

## 💰 8. Recursos Necessários

### 8.1 Recursos Humanos
- **1 Desenvolvedor Backend** (Java/Spring Boot)
- **1 Desenvolvedor Frontend** (React Native/Expo)
- **1 Designer UX/UI** (opcional)
- **1 Tech Lead** (coordenador)

### 8.2 Recursos Técnicos
- **Servidor de Desenvolvimento**: Local ou cloud
- **Banco de Dados**: PostgreSQL
- **Storage**: MinIO ou AWS S3
- **CI/CD**: GitHub Actions
- **Monitoramento**: Spring Boot Actuator

### 8.3 Recursos de Infraestrutura
- **Domínio**: hardlab.exemplo.com
- **SSL**: Certificado válido
- **Backup**: Estratégia de backup definida
- **Monitoramento**: Logs e métricas

---

## ⚠️ 9. Riscos e Mitigações

### 9.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade do QR Code | Média | Alto | Usar bibliotecas testadas |
| Performance do upload | Alta | Médio | Implementar progress indicators |
| Compatibilidade mobile | Média | Alto | Testar em múltiplos dispositivos |
| Sincronização offline | Alta | Alto | Usar TanStack Query persist |

### 9.2 Riscos de Prazo

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade inesperada | Média | Alto | Buffer de 20% no cronograma |
| Mudanças de requisitos | Baixa | Médio | Documentação clara |
| Problemas de integração | Média | Alto | Testes contínuos |

### 9.3 Riscos de Qualidade

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Bugs críticos | Média | Alto | Testes automatizados |
| Problemas de UX | Baixa | Médio | Prototipagem e feedback |
| Problemas de segurança | Baixa | Alto | Code review e testes |

---

## 📋 10. Aprovação

### 10.1 Stakeholders
- **Professor Orientador**: [Nome]
- **Coordenador da Disciplina**: [Nome]
- **Equipe de Desenvolvimento**: [Nomes]
- **Usuários Finais**: Professores e alunos do laboratório

### 10.2 Assinaturas

| Nome | Cargo | Data | Assinatura |
|------|-------|------|------------|
| [Nome] | Professor Orientador | [Data] | ____________ |
| [Nome] | Tech Lead | [Data] | ____________ |
| [Nome] | Desenvolvedor Backend | [Data] | ____________ |
| [Nome] | Desenvolvedor Frontend | [Data] | ____________ |

---

**HardLab** - Transformando a gestão de laboratórios de tecnologia 🚀

*Documento aprovado em: [Data]* 