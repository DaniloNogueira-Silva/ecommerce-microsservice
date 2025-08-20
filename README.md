# Backend para E-commerce: Arquitetura de Microsserviços

Este projeto é uma implementação completa do backend de um sistema de e-commerce, desenvolvido em um monorepo NestJS. Ele simula um ambiente de produção real, focando em práticas de engenharia de software para construir sistemas distribuídos que são **resilientes, escaláveis, seguros e observáveis**.

A arquitetura é baseada em eventos e utiliza um conjunto de tecnologias modernas para resolver desafios comuns de backend.

## Tecnologias Utilizadas 🚀

| Categoria | Tecnologia |
| :--- | :--- |
| **Arquitetura & Padrões** | Microsserviços, Arquitetura Orientada a Eventos (EDA), API Gateway |
| **Framework Principal** | NestJS (TypeScript) |
| **Segurança & Autenticação** | Kong (API Gateway), Keycloak (Identity Provider - OIDC) |
| **Mensageria** | RabbitMQ |
| **Banco de Dados** | PostgreSQL (Dados Transacionais), Redis (Cache/Estoque) |
| **Observabilidade** | Prometheus (Métricas), Grafana (Dashboards), Jaeger (Tracing) |
| **Integrações Externas** | Stripe (Gateway de Pagamento) |
| **Containerização** | Docker |

## Arquitetura do Sistema 🗺️

O diagrama abaixo ilustra a interação entre os diferentes componentes da arquitetura, desde a requisição do cliente até o processamento assíncrono dos eventos.

```mermaid
%% Diagrama de Arquitetura para Sistema de E-commerce com Microsserviços
%% Autor: Danilo Nogueira
%% Data: 2025-08-19

graph TD
    %% --- Definição de Estilos ---
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef client fill:#D4E6F1,stroke:#1A5276;
    classDef gateway fill:#A9DFBF,stroke:#1E8449;
    classDef service fill:#FAD7A0,stroke:#B9770E;
    classDef messaging fill:#F5B7B1,stroke:#943126;
    classDef database fill:#D2B4DE,stroke:#5B2C6F;
    classDef external fill:#AEB6BF,stroke:#2C3E50;
    classDef observability fill:#E5E7E9,stroke:#5D6D7E;

    %% --- Atores Externos ---
    subgraph "Usuário"
        user([Cliente<br>Browser/Mobile App]);
    end
    class user client;

    %% --- Camada de Borda e Segurança ---
    subgraph "Edge & Segurança"
        kong([Kong API Gateway]);
        keycloak([Keycloak<br>Identity Provider]);
    end
    class kong,keycloak gateway;
    
    %% --- Plataforma de E-commerce (Nossos Microsserviços) ---
    subgraph "Plataforma E-commerce (NestJS)"
        orders_service([Orders Service]);
        payments_service([Payments Service]);
        inventory_service([Inventory Service]);
        notifications_service([Notifications Service]);
    end
    class orders_service,payments_service,inventory_service,notifications_service service;

    %% --- Infraestrutura de Mensageria ---
    subgraph "Infraestrutura de Mensageria"
        rabbitmq((RabbitMQ));
    end
    class rabbitmq messaging;

    %% --- Camada de Persistência ---
    subgraph "Camada de Persistência"
        postgres_db[(PostgreSQL)];
        redis_db[(Redis)];
    end
    class postgres_db,redis_db database;

    %% --- Serviços Externos ---
    subgraph "Serviços Externos"
        stripe([Stripe API]);
    end
    class stripe external;

    %% --- Stack de Observabilidade ---
    subgraph "Stack de Observabilidade"
        prometheus([Prometheus]);
        grafana([Grafana]);
        jaeger([Jaeger]);
    end
    class prometheus,grafana,jaeger observability;
    
    %% --- Conexões e Fluxos ---
    
    %% Fluxo de Autenticação
    user -- "1. Autenticação (OIDC)" --> keycloak;
    keycloak -- "2. Emissão de Token JWT" --> user;
    
    %% Fluxo de Requisição Principal
    user -- "3. Requisição API com JWT<br>/orders" --> kong;
    kong -- "4. Valida Token & Roteia" --> orders_service;
    
    %% Fluxo de Eventos (Criação de Pedido)
    orders_service -- Salva Pedido --> postgres_db;
    orders_service -- "Evento: order_created" --> rabbitmq;
    
    %% Consumidores do Evento 'order_created'
    rabbitmq -- "Consome evento" --> payments_service;
    
    %% Fluxo de Pagamento
    payments_service -- "Cria Payment Intent" --> stripe;
    stripe -- "Webhook: Pagamento OK" --> payments_service;
    payments_service -- "Evento: payment_processed" --> rabbitmq;

    %% Consumidores do Evento 'payment_processed'
    rabbitmq -- "Consome evento" --> inventory_service;
    rabbitmq -- "Consome evento" --> notifications_service;

    %% Interação Final com a Persistência
    inventory_service -- "Atualiza Estoque (Idempotente)" --> redis_db;
    notifications_service -- "Registra Notificação (Opcional)" --> postgres_db;
    
    %% Conexões da Stack de Observabilidade
    prometheus -- "Scrape /metrics" --> kong;
    prometheus -- "Scrape /metrics" --> orders_service;
    prometheus -- "Scrape /metrics" --> payments_service;
    prometheus -- "Scrape /metrics" --> inventory_service;
    prometheus -- "Scrape /metrics" --> notifications_service;

    kong -- "Envia Traces" --> jaeger;
    orders_service -- "Envia Traces" --> jaeger;
    payments_service -- "Envia Traces" --> jaeger;
    inventory_service -- "Envia Traces" --> jaeger;
    notifications_service -- "Envia Traces" --> jaeger;

    prometheus -- "DataSource" --> grafana;
    jaeger -- "DataSource" --> grafana;
```

-----
