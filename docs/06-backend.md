# 06 — Backend

> **Documento:** Arquitetura e Padrões Backend  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Aprovado  
> **Última atualização:** Julho/2026  
> **Depende de:** `02-arquitetura.md`, `03-modelagem-do-banco.md`, `05-frontend.md` (aprovados)  
> **Stack:** Python 3.12+, Django 5.x, Django REST Framework, PostgreSQL 16, Redis 7, Celery 5

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Setup do Projeto](#2-setup-do-projeto)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Configuração Django](#4-configuração-django)
5. [Core — Infraestrutura Compartilhada](#5-core--infraestrutura-compartilhada)
6. [Multi-Tenant](#6-multi-tenant)
7. [Camadas e Responsabilidades](#7-camadas-e-responsabilidades)
8. [Módulos de Domínio](#8-módulos-de-domínio)
9. [Models](#9-models)
10. [Serializers](#10-serializers)
11. [Views e ViewSets](#11-views-e-viewsets)
12. [Services](#12-services)
13. [Selectors](#13-selectors)
14. [Autenticação e Permissões](#14-autenticação-e-permissões)
15. [URLs e Versionamento](#15-urls-e-versionamento)
16. [Cache e Redis](#16-cache-e-redis)
17. [Celery e Tarefas Assíncronas](#17-celery-e-tarefas-assíncronas)
18. [Tratamento de Erros](#18-tratamento-de-erros)
19. [Transações e Integridade](#19-transações-e-integridade)
20. [Upload de Arquivos](#20-upload-de-arquivos)
21. [Testes](#21-testes)
22. [Migrations e Seeds](#22-migrations-e-seeds)
23. [Docker e Ambiente Local](#23-docker-e-ambiente-local)
24. [Convenções de Código](#24-convenções-de-código)
25. [Próximos Documentos](#25-próximos-documentos)

---

## 1. Visão Geral

### 1.1 Objetivo

Este documento define **como o backend do Food Service é organizado, construído e mantido** — estrutura Django, padrões de código, multi-tenant, camadas de serviço, autenticação e integração com PostgreSQL, Redis e Celery.

### 1.2 Estilo Arquitetural

**Modular Monolith** — um deploy, múltiplos apps Django com responsabilidades claras.

```mermaid
graph TB
    subgraph HTTP["HTTP Layer"]
        URLS[urls.py]
        VIEWS[ViewSets / APIViews]
        SER[Serializers]
        PERM[Permissions]
    end

    subgraph APP["Application Layer"]
        SVC[Services]
        SEL[Selectors]
        TASKS[Celery Tasks]
    end

    subgraph DOMAIN["Domain Layer"]
        ENT[Entities / Enums]
        EXC[Exceptions]
        RULES[Business Rules]
    end

    subgraph INFRA["Infrastructure"]
        MODELS[ORM Models]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        SMTP[SMTP]
    end

    URLS --> VIEWS
    VIEWS --> SER
    VIEWS --> PERM
    VIEWS --> SVC
    VIEWS --> SEL
    SVC --> ENT
    SVC --> EXC
    SVC --> RULES
    SVC --> MODELS
    SEL --> MODELS
    MODELS --> PG
    SVC --> REDIS
    TASKS --> SVC
    TASKS --> SMTP
```

### 1.3 Princípios Backend

| Princípio | Descrição |
|-----------|-----------|
| **Thin views** | Views delegam para services; sem regra de negócio |
| **Fat services** | Toda lógica de domínio nos services |
| **Tenant by default** | Toda query filtra por `tenant_id` |
| **Fail secure** | Sem tenant = sem dados |
| **Atomic operations** | Pedidos e mutações críticas em `transaction.atomic()` |
| **Explicit is better** | Imports e dependências explícitas entre módulos |
| **Test the rules** | Services e isolamento de tenant são prioridade de testes |

---

## 2. Setup do Projeto

### 2.1 Dependências

```
# requirements/base.txt
Django>=5.1,<5.2
djangorestframework>=3.15,<4.0
djangorestframework-simplejwt>=5.3,<6.0
django-cors-headers>=4.4,<5.0
django-filter>=24.3,<25.0
psycopg[binary]>=3.2,<4.0
redis>=5.0,<6.0
celery>=5.4,<6.0
django-celery-beat>=2.7,<3.0
Pillow>=10.4,<11.0
python-dotenv>=1.0,<2.0
gunicorn>=22.0,<23.0

# requirements/development.txt
-r base.txt
pytest>=8.3,<9.0
pytest-django>=4.9,<5.0
pytest-cov>=5.0,<6.0
factory-boy>=3.3,<4.0
ruff>=0.6,<1.0
ipython>=8.26,<9.0
django-debug-toolbar>=4.4,<5.0

# requirements/production.txt
-r base.txt
sentry-sdk>=2.13,<3.0
```

### 2.2 Versões

| Componente | Versão |
|------------|--------|
| Python | 3.12+ |
| Django | 5.1.x |
| DRF | 3.15.x |
| PostgreSQL | 16+ |
| Redis | 7+ |

### 2.3 Comandos Iniciais

```bash
# Criar projeto (referência futura)
django-admin startproject config .
python manage.py migrate
python manage.py createsuperuser  # apenas dev/suporte
python manage.py runserver
```

---

## 3. Estrutura de Pastas

### 3.1 Árvore Completa

```
vendas_backend/
├── config/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── test.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
│
├── core/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── tenant_model.py
│   ├── tenancy/
│   │   ├── __init__.py
│   │   ├── context.py
│   │   ├── middleware.py
│   │   └── managers.py
│   ├── permissions/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── rbac.py
│   ├── exceptions/
│   │   ├── __init__.py
│   │   ├── domain.py
│   │   └── handlers.py
│   ├── pagination.py
│   ├── throttling.py
│   ├── renderers.py
│   └── utils/
│       ├── __init__.py
│       ├── phone.py
│       └── money.py
│
├── apps/
│   ├── accounts/
│   ├── companies/
│   ├── catalog/
│   ├── customers/
│   ├── orders/
│   ├── promotions/          # V1
│   ├── notifications/
│   ├── delivery/              # V2
│   └── reports/               # V1
│
├── templates/
│   └── emails/
│       ├── order_confirmation.html
│       └── order_status_update.html
│
├── media/
├── static/
├── locale/
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── entrypoint.sh
│
├── scripts/
│   ├── wait_for_db.sh
│   └── seed_dev.py
│
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
│
├── manage.py
├── pytest.ini
├── ruff.toml
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

### 3.2 Estrutura Interna de um App

```
apps/orders/
├── __init__.py
├── apps.py
├── domain/
│   ├── __init__.py
│   ├── entities.py
│   ├── enums.py
│   ├── exceptions.py
│   └── interfaces.py
├── services/
│   ├── __init__.py
│   ├── order_service.py
│   └── cart_validation_service.py
├── selectors/
│   ├── __init__.py
│   └── order_selectors.py
├── models.py
├── serializers/
│   ├── __init__.py
│   ├── order_serializers.py
│   └── checkout_serializers.py
├── views/
│   ├── __init__.py
│   ├── public_order_views.py
│   └── admin_order_viewset.py
├── permissions.py
├── urls.py
├── filters.py
├── signals.py
├── tasks.py
├── admin.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_order_service.py
    ├── test_cart_validation.py
    ├── test_views.py
    └── test_tenant_isolation.py
```

### 3.3 Regras de Importação

| De | Pode importar | Não pode importar |
|----|---------------|-------------------|
| `views/` | `services/`, `serializers/`, `selectors/`, `permissions/`, `core/` | `models` de outro app diretamente |
| `services/` | `domain/`, `models` do próprio app, services públicos de outros apps | `views/`, `serializers/` |
| `serializers/` | `models` do próprio app, `domain/enums` | `services/` (exceto método `create` leve) |
| `domain/` | Biblioteca padrão Python | Django, DRF, Redis |
| `selectors/` | `models`, `core/tenancy` | `services/` |

**Comunicação entre apps:**

```python
# ✅ Correto — via service público
from apps.catalog.services.product_service import ProductService

# ❌ Evitar em views
from apps.catalog.models import Product

# ✅ Aceitável em services (FK no ORM)
from apps.catalog.models import Product
```

---

## 4. Configuração Django

### 4.1 Settings por Ambiente

```python
# config/settings/__init__.py
import os

environment = os.environ.get("DJANGO_ENV", "development")

if environment == "production":
    from .production import *  # noqa: F403
elif environment == "test":
    from .test import *  # noqa: F403
else:
    from .development import *  # noqa: F403
```

### 4.2 base.py — Trechos Essenciais

```python
# config/settings/base.py — conceito
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "django_celery_beat",
    # Local
    "core",
    "apps.accounts",
    "apps.companies",
    "apps.catalog",
    "apps.customers",
    "apps.orders",
    "apps.notifications",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "core.tenancy.middleware.TenantMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "5/minute",
    },
    "EXCEPTION_HANDLER": "core.exceptions.handlers.custom_exception_handler",
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ["v1"],
}

# JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Celery
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/1")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"

# Cache
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    }
}

# Media
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

### 4.3 Variáveis de Ambiente

```bash
# .env.example
DJANGO_ENV=development
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,.foodservice.app

DATABASE_URL=postgres://foodservice:foodservice@localhost:5432/foodservice
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

JWT_ACCESS_LIFETIME_MINUTES=15
JWT_REFRESH_LIFETIME_DAYS=7

CORS_ALLOWED_ORIGINS=http://localhost:5173,https://*.foodservice.app

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@foodservice.app
```

---

## 5. Core — Infraestrutura Compartilhada

### 5.1 BaseModel

```python
# core/models/base.py
import uuid
from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

### 5.2 TenantAwareModel

```python
# core/models/tenant_model.py
from django.db import models
from core.models.base import BaseModel
from core.tenancy.managers import TenantManager


class TenantAwareModel(BaseModel):
    tenant = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="%(class)ss",
        db_column="tenant_id",
    )

    objects = TenantManager()
    all_objects = models.Manager()  # bypass para super admin / seeds

    class Meta:
        abstract = True
```

### 5.3 SoftDeleteModel

```python
# core/models/base.py — conceito adicional
class SoftDeleteModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    class Meta:
        abstract = True
```

### 5.4 Paginação Padrão

```python
# core/pagination.py
from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
```

### 5.5 Utilitários

```python
# core/utils/phone.py
import re

def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11:
        return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    if len(digits) == 10:
        return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    raise ValueError("Telefone inválido")


# core/utils/money.py
from decimal import Decimal, ROUND_HALF_UP

def round_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
```

---

## 6. Multi-Tenant

### 6.1 TenantContext

```python
# core/tenancy/context.py
from contextvars import ContextVar
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.companies.models import Company

_tenant: ContextVar["Company | None"] = ContextVar("tenant", default=None)


class TenantContext:
    @staticmethod
    def set(tenant: "Company") -> None:
        _tenant.set(tenant)

    @staticmethod
    def get() -> "Company":
        tenant = _tenant.get()
        if tenant is None:
            raise RuntimeError("Tenant context not set")
        return tenant

    @staticmethod
    def get_id():
        return TenantContext.get().id

    @staticmethod
    def clear() -> None:
        _tenant.set(None)
```

### 6.2 TenantMiddleware

```python
# core/tenancy/middleware.py
from django.http import Http404
from apps.companies.models import Company
from core.tenancy.context import TenantContext


class TenantMiddleware:
    """Resolve tenant por subdomínio (storefront) ou header/JWT (backoffice)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant = self._resolve_tenant(request)
        if tenant:
            TenantContext.set(tenant)
            request.tenant = tenant

        try:
            response = self.get_response(request)
        finally:
            TenantContext.clear()

        return response

    def _resolve_tenant(self, request) -> Company | None:
        # 1. Header explícito (backoffice API)
        tenant_id = request.headers.get("X-Tenant-ID")
        if tenant_id:
            return self._get_active_company(id=tenant_id)

        # 2. Subdomínio (storefront)
        host = request.get_host().split(":")[0]
        if host.endswith(".foodservice.app"):
            subdomain = host.replace(".foodservice.app", "")
            if subdomain and subdomain not in ("www", "api", "admin"):
                return self._get_active_company(subdomain=subdomain)

        # 3. Rotas sem tenant (auth, health, admin global)
        if request.path.startswith(("/api/v1/auth/", "/api/v1/health/")):
            return None

        return None

    def _get_active_company(self, **filters) -> Company:
        try:
            return Company.objects.get(status="active", **filters)
        except Company.DoesNotExist:
            raise Http404("Estabelecimento não encontrado")
```

### 6.3 TenantManager

```python
# core/tenancy/managers.py
from django.db import models
from core.tenancy.context import TenantContext


class TenantQuerySet(models.QuerySet):
    def for_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)


class TenantManager(models.Manager):
    def get_queryset(self):
        qs = TenantQuerySet(self.model, using=self._db)
        try:
            tenant_id = TenantContext.get_id()
            return qs.filter(tenant_id=tenant_id)
        except RuntimeError:
            return qs

    def for_tenant(self, tenant_id):
        return self.get_queryset().for_tenant(tenant_id)
```

### 6.4 Fluxo de Resolução

```mermaid
flowchart TD
    REQ[Request] --> PATH{Path?}
    PATH -->|/api/v1/public/*| SUB[Subdomínio Host]
    PATH -->|/api/v1/admin/*| JWT[JWT + X-Tenant-ID]
    PATH -->|/api/v1/auth/*| NONE[Sem tenant]

    SUB --> LOAD[Company.objects.get subdomain]
    JWT --> LOAD2[Company.objects.get id]
    LOAD --> CTX[TenantContext.set]
    LOAD2 --> CTX
    CTX --> VIEW[View / Service]
```

---

## 7. Camadas e Responsabilidades

### 7.1 Matriz de Responsabilidades

| Camada | Arquivo | Responsabilidade | Testes |
|--------|---------|------------------|--------|
| **View** | `views/*.py` | HTTP, status code, chamar service | Integration |
| **Serializer** | `serializers/*.py` | Validação de formato, serialização | Unit |
| **Service** | `services/*.py` | Regras de negócio, orquestração | Unit (prioridade) |
| **Selector** | `selectors/*.py` | Queries complexas de leitura | Unit |
| **Model** | `models.py` | Schema, constraints, métodos simples | — |
| **Domain** | `domain/*.py` | Entidades, enums, exceções puras | Unit |
| **Task** | `tasks.py` | Async, chama services | Integration |
| **Permission** | `permissions.py` | Autorização HTTP | Unit |

### 7.2 O que NÃO fazer em cada camada

| Camada | Proibido |
|--------|----------|
| View | `Order.objects.create(...)`, cálculos de preço, validação de negócio |
| Serializer | Lógica complexa de desconto, máquina de estados |
| Model | Chamar Celery, enviar e-mail, lógica cross-app |
| Service | Retornar `Response`, acessar `request` |

---

## 8. Módulos de Domínio

### 8.1 Mapa MVP

| App | Models | Services | Fase |
|-----|--------|----------|------|
| `companies` | Company, CompanySettings, BusinessHours | `CompanyService`, `OnboardingService` | MVP |
| `accounts` | Employee, Role, RolePermission, EmployeeRole | `AuthService`, `EmployeeService` | MVP |
| `catalog` | Category, Product, ProductImage, OptionGroup, Option, ProductOptionGroup | `ProductService`, `OptionGroupService`, `PriceCalculator` | MVP |
| `customers` | Customer, CustomerAddress | `CustomerService` | MVP |
| `orders` | Order, OrderItem, OrderItemOption, OrderStatusHistory, OrderPayment | `OrderService`, `CartValidationService` | MVP |
| `notifications` | NotificationLog | `NotificationService` | MVP |
| `promotions` | Coupon, CouponUsage | `CouponService` | V1 |
| `reports` | — | `ReportService`, selectors | V1 |
| `delivery` | Driver, Delivery | `DeliveryService` | V2 |

### 8.2 Dependências entre Apps

```mermaid
graph TD
    companies --> accounts
    companies --> catalog
    companies --> customers
    companies --> orders

    catalog --> orders
    customers --> orders
    accounts --> orders
    orders --> notifications
    orders --> promotions
    orders --> delivery
    orders --> reports
```

---

## 9. Models

### 9.1 Convenções

| Regra | Exemplo |
|-------|---------|
| Herdar `TenantAwareModel` | Toda entidade de negócio |
| `db_table` explícito | `db_table = "products"` |
| `related_name` explícito | `related_name="products"` |
| Enums como `TextChoices` | `class OrderStatus(models.TextChoices)` |
| `__str__` legível | `return f"#{self.order_number}"` |
| Indexes em Meta | `indexes = [models.Index(fields=["tenant", "status"])]` |
| `ordering` default | `ordering = ["-created_at"]` |

### 9.2 Exemplo — Order Model

```python
# apps/orders/models.py — trecho conceitual
from django.db import models
from core.models.tenant_model import TenantAwareModel
from apps.orders.domain.enums import OrderStatus, DeliveryType, OrderSource


class Order(TenantAwareModel):
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    order_number = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
    )
    delivery_type = models.CharField(max_length=20, choices=DeliveryType.choices)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="BRL")

    # Snapshots
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.JSONField(null=True, blank=True)
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    source = models.CharField(
        max_length=20,
        choices=OrderSource.choices,
        default=OrderSource.STOREFRONT,
    )

    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "order_number"],
                name="unique_order_number_per_tenant",
            ),
            models.CheckConstraint(
                check=models.Q(total__gte=0),
                name="orders_positive_total",
            ),
        ]
        indexes = [
            models.Index(fields=["tenant", "status", "-created_at"]),
            models.Index(fields=["tenant", "customer", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"#{self.order_number}"
```

### 9.3 Domain Enums

```python
# apps/orders/domain/enums.py
from django.db import models


class OrderStatus(models.TextChoices):
    PENDING = "pending", "Pendente"
    CONFIRMED = "confirmed", "Confirmado"
    PREPARING = "preparing", "Em preparo"
    READY = "ready", "Pronto"
    OUT_FOR_DELIVERY = "out_for_delivery", "Saiu para entrega"
    COMPLETED = "completed", "Concluído"
    CANCELLED = "cancelled", "Cancelado"


VALID_TRANSITIONS: dict[str, list[str]] = {
    OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    OrderStatus.CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    OrderStatus.PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
    OrderStatus.READY: [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
    ],
    OrderStatus.OUT_FOR_DELIVERY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    OrderStatus.COMPLETED: [],
    OrderStatus.CANCELLED: [],
}
```

---

## 10. Serializers

### 10.1 Convenções

| Tipo | Sufixo | Uso |
|------|--------|-----|
| Leitura | `*Serializer` | GET responses |
| Criação | `*CreateSerializer` | POST payloads |
| Atualização | `*UpdateSerializer` | PATCH payloads |
| Listagem resumida | `*ListSerializer` | Listas (menos campos) |
| Público | `*PublicSerializer` | Storefront (sem dados internos) |

### 10.2 Regras

- Validação de **formato** no serializer (campos obrigatórios, tipos)
- Validação de **negócio** no service (estoque, transição de status, preço)
- `create()` e `update()` delegam para service quando há regras
- Nunca expor `password_hash`, campos internos
- Campos read-only para snapshots (`product_name`, `unit_price`)

### 10.3 Exemplo

```python
# apps/orders/serializers/checkout_serializers.py
from rest_framework import serializers
from apps.orders.domain.enums import DeliveryType, PaymentMethod


class CheckoutAddressSerializer(serializers.Serializer):
    street = serializers.CharField(max_length=255)
    number = serializers.CharField(max_length=20)
    complement = serializers.CharField(max_length=100, required=False, allow_blank=True)
    neighborhood = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=2)
    zip_code = serializers.CharField(max_length=9)
    reference = serializers.CharField(max_length=255, required=False, allow_blank=True)


class CheckoutItemOptionSerializer(serializers.Serializer):
    option_id = serializers.UUIDField()


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=99)
    options = CheckoutItemOptionSerializer(many=True, default=list)
    notes = serializers.CharField(max_length=255, required=False, allow_blank=True)


class CheckoutCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    delivery_type = serializers.ChoiceField(choices=DeliveryType.choices)
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices)
    items = CheckoutItemSerializer(many=True, min_length=1)
    address = CheckoutAddressSerializer(required=False)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    change_for = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )

    def validate(self, data):
        if data["delivery_type"] == DeliveryType.DELIVERY and not data.get("address"):
            raise serializers.ValidationError(
                {"address": "Endereço obrigatório para delivery"}
            )
        return data
```

```python
# apps/orders/serializers/order_serializers.py
class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "customer_name",
            "total", "delivery_type", "created_at",
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = OrderPaymentSerializer(read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
```

---

## 11. Views e ViewSets

### 11.1 Organização por Contexto

| Contexto | Prefixo URL | Views | Auth |
|----------|-------------|-------|------|
| Público (storefront) | `/api/v1/public/` | `APIView` / `GenericAPIView` | AllowAny |
| Admin (backoffice) | `/api/v1/admin/` | `ModelViewSet` | IsAuthenticated + RBAC |
| Auth | `/api/v1/auth/` | `APIView` | Variável |

### 11.2 Padrão ViewSet Admin

```python
# apps/orders/views/admin_order_viewset.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.orders.selectors.order_selectors import OrderSelector
from apps.orders.serializers.order_serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderStatusUpdateSerializer,
)
from apps.orders.services.order_service import OrderService
from apps.orders.permissions import HasOrderPermission
from apps.orders.filters import OrderFilter


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [HasOrderPermission]
    filterset_class = OrderFilter
    search_fields = ["order_number", "customer_name", "customer_phone"]
    ordering_fields = ["created_at", "total", "status"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderListSerializer

    def get_queryset(self):
        return OrderSelector.list_orders()

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = OrderService.update_status(
            order_id=pk,
            new_status=serializer.validated_data["status"],
            employee=request.user.employee,
            notes=serializer.validated_data.get("notes"),
        )

        return Response(OrderDetailSerializer(order).data)
```

### 11.3 Padrão APIView Pública

```python
# apps/orders/views/public_order_views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.orders.serializers.checkout_serializers import CheckoutCreateSerializer
from apps.orders.serializers.order_serializers import OrderPublicSerializer
from apps.orders.services.order_service import OrderService
from core.tenancy.context import TenantContext


class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = OrderService.create_from_checkout(
            tenant=TenantContext.get(),
            data=serializer.validated_data,
        )

        return Response(
            OrderPublicSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderTrackingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_id):
        order = OrderService.get_public_order(
            tenant=TenantContext.get(),
            order_id=order_id,
        )
        return Response(OrderPublicSerializer(order).data)
```

### 11.4 Convenções de Views

| Regra | Descrição |
|-------|-----------|
| Uma responsabilidade | View fina; lógica no service |
| Status codes corretos | 201 create, 204 delete, 400 validation |
| `raise_exception=True` | Em `is_valid()` |
| Sem queryset global | Sempre via selector ou `get_queryset()` |
| `@action` para sub-recursos | `/orders/{id}/status/` |

---

## 12. Services

### 12.1 Padrão de Service

Services são **classes com métodos estáticos ou de classe** — sem estado global.

```python
# apps/orders/services/order_service.py
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from apps.orders.domain.enums import OrderStatus, VALID_TRANSITIONS
from apps.orders.domain.exceptions import InvalidOrderTransition, EmptyCartError
from apps.orders.models import Order, OrderItem, OrderItemOption, OrderStatusHistory
from apps.orders.services.cart_validation_service import CartValidationService
from apps.catalog.services.price_calculator import PriceCalculator
from apps.customers.services.customer_service import CustomerService
from core.utils.money import round_money


class OrderService:
    @staticmethod
    @transaction.atomic
    def create_from_checkout(*, tenant, data) -> Order:
        if not data.get("items"):
            raise EmptyCartError()

        validated_items = CartValidationService.validate(
            tenant=tenant,
            items=data["items"],
        )

        customer = CustomerService.get_or_create_from_checkout(
            tenant=tenant,
            name=data["customer_name"],
            phone=data["customer_phone"],
            email=data.get("customer_email"),
        )

        order_number = OrderService._generate_order_number(tenant)
        subtotal = sum(item["total_price"] for item in validated_items)
        delivery_fee = OrderService._calculate_delivery_fee(tenant, data, subtotal)
        total = round_money(Decimal(subtotal) + Decimal(delivery_fee))

        order = Order.objects.create(
            tenant=tenant,
            customer=customer,
            order_number=order_number,
            status=OrderStatus.PENDING,
            delivery_type=data["delivery_type"],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            customer_name=data["customer_name"],
            customer_phone=data["customer_phone"],
            delivery_address=data.get("address"),
            notes=data.get("notes", ""),
        )

        for item_data in validated_items:
            order_item = OrderItem.objects.create(
                tenant=tenant,
                order=order,
                product_id=item_data["product_id"],
                product_name=item_data["product_name"],
                unit_price=item_data["unit_price"],
                quantity=item_data["quantity"],
                total_price=item_data["total_price"],
                notes=item_data.get("notes", ""),
            )
            for opt in item_data["options"]:
                OrderItemOption.objects.create(
                    tenant=tenant,
                    order_item=order_item,
                    option_group_name=opt["group_name"],
                    option_name=opt["name"],
                    price_modifier=opt["price_modifier"],
                    option_id=opt.get("option_id"),
                )

        OrderService._create_payment(order, data)
        OrderService._record_status(order, None, OrderStatus.PENDING)
        # OrderService._send_confirmation_async(order)  # via signal ou task

        return order

    @staticmethod
    @transaction.atomic
    def update_status(*, order_id, new_status, employee, notes=None) -> Order:
        order = Order.objects.select_for_update().get(id=order_id)
        current = order.status

        if new_status not in VALID_TRANSITIONS.get(current, []):
            raise InvalidOrderTransition(current, new_status)

        order.status = new_status
        now = timezone.now()

        if new_status == OrderStatus.CONFIRMED:
            order.confirmed_at = now
        elif new_status == OrderStatus.COMPLETED:
            order.completed_at = now
        elif new_status == OrderStatus.CANCELLED:
            order.cancelled_at = now
            order.cancellation_reason = notes or ""

        order.save()
        OrderService._record_status(order, current, new_status, employee, notes)
        return order

    @staticmethod
    def _generate_order_number(tenant) -> str:
        last = (
            Order.all_objects.filter(tenant=tenant)
            .order_by("-created_at")
            .values_list("order_number", flat=True)
            .first()
        )
        if last:
            num = int(last.replace("#", "")) + 1
        else:
            num = 1
        return f"#{num:04d}"

    @staticmethod
    def _record_status(order, from_status, to_status, employee=None, notes=None):
        OrderStatusHistory.objects.create(
            tenant=order.tenant,
            order=order,
            from_status=from_status,
            to_status=to_status,
            changed_by=employee,
            notes=notes,
        )
```

### 12.2 Inventário de Services MVP

| Service | Métodos principais |
|---------|-------------------|
| `AuthService` | `login`, `refresh`, `get_permissions` |
| `CompanyService` | `get_public`, `update_settings`, `is_open` |
| `OnboardingService` | `create_company`, `setup_defaults` |
| `ProductService` | `create`, `update`, `delete`, `get_by_slug` |
| `OptionGroupService` | `create`, `attach_to_product` |
| `PriceCalculator` | `calculate_item_price` |
| `CartValidationService` | `validate` |
| `CustomerService` | `get_or_create_from_checkout` |
| `OrderService` | `create_from_checkout`, `update_status` |
| `NotificationService` | `send_order_confirmation` |

### 12.3 Exceções de Domínio

```python
# apps/orders/domain/exceptions.py
from core.exceptions.domain import DomainException


class InvalidOrderTransition(DomainException):
    code = "INVALID_ORDER_TRANSITION"

    def __init__(self, from_status: str, to_status: str):
        super().__init__(
            f"Transição inválida: {from_status} → {to_status}"
        )


class EmptyCartError(DomainException):
    code = "EMPTY_CART"
    message = "Carrinho vazio"
```

```python
# core/exceptions/domain.py
class DomainException(Exception):
    code: str = "DOMAIN_ERROR"
    message: str = "Erro de domínio"

    def __init__(self, message: str | None = None):
        self.message = message or self.__class__.message
        super().__init__(self.message)
```

---

## 13. Selectors

Selectors encapsulam **queries de leitura** otimizadas (padrão CQRS leve).

```python
# apps/orders/selectors/order_selectors.py
from django.db.models import Prefetch, Count, Q
from apps.orders.models import Order, OrderItem, OrderItemOption


class OrderSelector:
    @staticmethod
    def list_orders(*, status=None, active_only=False):
        qs = Order.objects.select_related("customer")

        if status:
            qs = qs.filter(status=status)

        if active_only:
            qs = qs.exclude(status__in=["completed", "cancelled"])

        return qs

    @staticmethod
    def get_order_detail(order_id):
        return (
            Order.objects
            .select_related("customer")
            .prefetch_related(
                Prefetch("items", queryset=OrderItem.objects.prefetch_related("options")),
                "status_history",
                "payment",
            )
            .get(id=order_id)
        )

    @staticmethod
    def dashboard_stats(tenant_id):
        today = timezone.now().date()
        return Order.objects.filter(
            tenant_id=tenant_id,
            created_at__date=today,
        ).aggregate(
            total_orders=Count("id"),
            pending=Count("id", filter=Q(status="pending")),
            revenue=Sum("total", filter=Q(status="completed")),
        )
```

```python
# apps/catalog/selectors/catalog_selectors.py
class CatalogSelector:
    @staticmethod
    def get_active_products(tenant_id, category_slug=None):
        qs = (
            Product.objects
            .filter(is_active=True)
            .select_related("category")
            .prefetch_related("images", "product_option_groups__option_group__options")
        )
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return qs.order_by("sort_order")
```

---

## 14. Autenticação e Permissões

### 14.1 JWT com simplejwt

```python
# apps/accounts/views/auth_views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.serializers.auth_serializers import LoginSerializer
from apps.accounts.services.auth_service import AuthService


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AuthService.login(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        return Response(result, status=status.HTTP_200_OK)
```

### 14.2 AuthService

```python
# apps/accounts/services/auth_service.py
class AuthService:
    @staticmethod
    def login(*, email: str, password: str) -> dict:
        try:
            employee = Employee.objects.select_related("tenant").get(
                email=email, is_active=True
            )
        except Employee.DoesNotExist:
            raise AuthenticationFailed("Credenciais inválidas")

        if not employee.check_password(password):
            raise AuthenticationFailed("Credenciais inválidas")

        refresh = RefreshToken.for_user(employee)
        refresh["tenant_id"] = str(employee.tenant_id)
        refresh["employee_id"] = str(employee.id)

        permissions = AuthService.get_permissions(employee)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": EmployeeSerializer(employee).data,
            "tenant": CompanyMinimalSerializer(employee.tenant).data,
            "permissions": permissions,
        }

    @staticmethod
    def get_permissions(employee) -> list[str]:
        if employee.is_owner:
            return ALL_PERMISSIONS
        return list(
            RolePermission.objects
            .filter(role__employee_roles__employee=employee)
            .values_list("permission", flat=True)
            .distinct()
        )
```

### 14.3 Permissões DRF

```python
# core/permissions/rbac.py
from rest_framework.permissions import BasePermission


class HasPermission(BasePermission):
    def __init__(self, permission: str):
        self.permission = permission

    def has_permission(self, request, view):
        employee = getattr(request.user, "employee", None)
        if not employee:
            return False
        if employee.is_owner:
            return True
        return AuthService.employee_has_permission(employee, self.permission)


# apps/orders/permissions.py
from rest_framework.permissions import BasePermission

class HasOrderPermission(BasePermission):
    def has_permission(self, request, view):
        employee = request.user.employee
        if employee.is_owner:
            return True

        action_permissions = {
            "list": "orders.view",
            "retrieve": "orders.view",
            "update_status": "orders.manage",
        }
        perm = action_permissions.get(view.action, "orders.view")
        return AuthService.employee_has_permission(employee, perm)
```

### 14.4 Employee como User

`Employee` não estende `AbstractUser` diretamente. Para JWT, usar **custom user model** ou adapter:

**Decisão MVP:** `Employee` implementa interface mínima para simplejwt (`pk`, `is_authenticated`). Authentication backend customizado mapeia JWT → Employee.

```python
# apps/accounts/authentication.py
class EmployeeJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        employee_id = validated_token.get("employee_id")
        return Employee.objects.select_related("tenant").get(id=employee_id)
```

---

## 15. URLs e Versionamento

### 15.1 Estrutura Global

```python
# config/urls.py
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("api/v1/health/", HealthCheckView.as_view()),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/public/", include("apps.public_urls")),   # storefront
    path("api/v1/admin/", include("apps.admin_urls")),     # backoffice
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 15.2 URLs Públicas

```python
# apps/public_urls.py
from django.urls import path, include

urlpatterns = [
    path("company/", include("apps.companies.public_urls")),
    path("catalog/", include("apps.catalog.public_urls")),
    path("orders/", include("apps.orders.public_urls")),
]
```

### 15.3 URLs Admin

```python
# apps/admin_urls.py
from rest_framework.routers import DefaultRouter
from apps.orders.views.admin_order_viewset import AdminOrderViewSet
from apps.catalog.views.admin_product_viewset import AdminProductViewSet

router = DefaultRouter()
router.register("orders", AdminOrderViewSet, basename="admin-orders")
router.register("products", AdminProductViewSet, basename="admin-products")

urlpatterns = router.urls + [
    # views avulsas
]
```

### 15.4 Mapa de Endpoints MVP

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/health/` | Health check |
| POST | `/api/v1/auth/login/` | Login backoffice |
| POST | `/api/v1/auth/refresh/` | Refresh token |
| GET | `/api/v1/public/company/` | Dados públicos do tenant |
| GET | `/api/v1/public/catalog/categories/` | Categorias |
| GET | `/api/v1/public/catalog/products/` | Produtos |
| GET | `/api/v1/public/catalog/products/{slug}/` | Detalhe produto |
| POST | `/api/v1/public/orders/checkout/` | Criar pedido |
| GET | `/api/v1/public/orders/{id}/` | Tracking |
| GET | `/api/v1/admin/orders/` | Listar pedidos |
| GET | `/api/v1/admin/orders/{id}/` | Detalhe pedido |
| PATCH | `/api/v1/admin/orders/{id}/status/` | Atualizar status |
| CRUD | `/api/v1/admin/products/` | Gestão produtos |
| CRUD | `/api/v1/admin/categories/` | Gestão categorias |
| CRUD | `/api/v1/admin/option-groups/` | Grupos de opções |

> Detalhamento completo no documento **07-api.md**.

---

## 16. Cache e Redis

### 16.1 Padrão de Chaves

```python
# core/cache/keys.py
def tenant_key(tenant_id: str, *parts: str) -> str:
    return f"tenant:{tenant_id}:{':'.join(parts)}"

# Exemplos
# tenant:uuid:catalog:categories
# tenant:uuid:catalog:product:slug-name
# tenant:uuid:company:settings
```

### 16.2 Cache em Selectors

```python
from django.core.cache import cache

class CatalogSelector:
    @staticmethod
    def get_categories(tenant_id):
        key = tenant_key(str(tenant_id), "catalog", "categories")
        cached = cache.get(key)
        if cached is not None:
            return cached

        data = list(Category.objects.filter(is_active=True).order_by("sort_order"))
        cache.set(key, data, timeout=300)  # 5 min
        return data
```

### 16.3 Invalidação

```python
# apps/catalog/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=Product)
def invalidate_catalog_cache(sender, instance, **kwargs):
    tenant_id = str(instance.tenant_id)
    cache.delete_pattern(f"tenant:{tenant_id}:catalog:*")  # ou keys específicas
```

---

## 17. Celery e Tarefas Assíncronas

### 17.1 Configuração

```python
# config/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("foodservice")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

### 17.2 Tasks MVP

```python
# apps/notifications/tasks.py
from celery import shared_task
from apps.notifications.services.notification_service import NotificationService


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation(self, order_id: str):
    try:
        NotificationService.send_order_confirmation(order_id)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def send_order_status_update(order_id: str, new_status: str):
    NotificationService.send_status_update(order_id, new_status)
```

### 17.3 Disparo de Tasks

```python
# apps/orders/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.orders.models import Order
from apps.notifications.tasks import send_order_confirmation

@receiver(post_save, sender=Order)
def on_order_created(sender, instance, created, **kwargs):
    if created:
        send_order_confirmation.delay(str(instance.id))
```

### 17.4 Celery Beat (Periódicas)

| Task | Schedule | Fase |
|------|----------|------|
| `cleanup_expired_carts` | Diário 3h | V1 |
| `generate_daily_report` | Diário 6h | V1 |

---

## 18. Tratamento de Erros

### 18.1 Exception Handler Customizado

```python
# core/exceptions/handlers.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from core.exceptions.domain import DomainException


def custom_exception_handler(exc, context):
    if isinstance(exc, DomainException):
        return Response(
            {"detail": exc.message, "code": exc.code},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    response = exception_handler(exc, context)

    if response is not None:
        # Normalizar formato
        if "detail" not in response.data and isinstance(response.data, dict):
            response.data = {
                "detail": "Erro de validação",
                "code": "VALIDATION_ERROR",
                "fields": response.data,
            }

    return response
```

### 18.2 Formato Padrão de Erro

```json
{
  "detail": "Mensagem legível para o usuário",
  "code": "ERROR_CODE",
  "fields": {
    "email": ["Este campo é obrigatório."]
  }
}
```

### 18.3 Mapeamento HTTP

| Exceção | HTTP | Code |
|---------|------|------|
| `ValidationError` (DRF) | 400 | `VALIDATION_ERROR` |
| `AuthenticationFailed` | 401 | `AUTHENTICATION_FAILED` |
| `PermissionDenied` | 403 | `PERMISSION_DENIED` |
| `NotFound` / `Http404` | 404 | `NOT_FOUND` |
| `DomainException` | 422 | Custom |
| Unhandled | 500 | `INTERNAL_ERROR` |

---

## 19. Transações e Integridade

### 19.1 Regras

| Operação | Transação |
|----------|-----------|
| Criar pedido | `@transaction.atomic` |
| Atualizar status | `@transaction.atomic` + `select_for_update` |
| Criar produto com opções | `@transaction.atomic` |
| Leitura de listagem | Sem transação |
| Aplicar cupom (V1) | `@transaction.atomic` |

### 19.2 Concorrência em Pedidos

```python
order = Order.objects.select_for_update().get(id=order_id)
# Impede race condition em mudança de status simultânea
```

### 19.3 Idempotência (Futuro)

Header `Idempotency-Key` em checkout para evitar pedidos duplicados por retry.

---

## 20. Upload de Arquivos

### 20.1 Configuração

| Aspecto | MVP | V1 |
|---------|-----|-----|
| Storage | `FileSystemStorage` local | S3 / compatível |
| Tamanho máximo | 5MB | 5MB |
| Formatos | JPEG, PNG, WebP | + AVIF |
| Path | `media/{tenant_id}/products/{uuid}.webp` | Mesmo padrão |

### 20.2 Validação

```python
# apps/catalog/validators.py
from django.core.exceptions import ValidationError

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_product_image(file):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError("Formato de imagem não suportado")
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError("Imagem deve ter no máximo 5MB")
```

### 20.3 Endpoint

```
POST /api/v1/admin/products/{id}/images/
Content-Type: multipart/form-data
```

---

## 21. Testes

### 21.1 Stack

| Ferramenta | Uso |
|------------|-----|
| **pytest** | Runner |
| **pytest-django** | Integração Django |
| **factory-boy** | Factories |
| **pytest-cov** | Coverage |

### 21.2 Configuração

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
python_files = tests.py test_*.py
addopts = --reuse-db --cov=apps --cov-report=term-missing
```

### 21.3 Prioridade de Testes

| Prioridade | O quê |
|------------|-------|
| **P0** | `OrderService` (criar, status, transições) |
| **P0** | `CartValidationService` |
| **P0** | `PriceCalculator` |
| **P0** | Isolamento de tenant |
| **P1** | `AuthService` |
| **P1** | Views de checkout e status |
| **P2** | Serializers |
| **P2** | Selectors |

### 21.4 Exemplo — Teste de Isolamento

```python
# apps/orders/tests/test_tenant_isolation.py
import pytest
from apps.orders.models import Order

@pytest.mark.django_db
def test_tenant_a_cannot_access_tenant_b_order(tenant_a, tenant_b, order_factory):
    order = order_factory(tenant=tenant_a)

    with pytest.raises(Order.DoesNotExist):
        Order.objects.for_tenant(tenant_b.id).get(id=order.id)
```

### 21.5 Factories

```python
# apps/orders/tests/conftest.py
import pytest
import factory
from apps.orders.models import Order

class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order

    tenant = factory.SubFactory("apps.companies.tests.CompanyFactory")
    customer = factory.SubFactory("apps.customers.tests.CustomerFactory")
    order_number = factory.Sequence(lambda n: f"#{n:04d}")
    status = "pending"
    subtotal = 50.00
    total = 50.00
    customer_name = "Test User"
    customer_phone = "(11) 99999-9999"
    delivery_type = "delivery"
```

---

## 22. Migrations e Seeds

### 22.1 Convenções

| Regra | Exemplo |
|-------|---------|
| Uma migration por alteração lógica | `0003_add_option_groups` |
| Nunca editar migration aplicada | Nova migration corretiva |
| Data migrations separadas | `0004_populate_default_roles.py` |
| Nome descritivo | `0005_order_status_history` |

### 22.2 Seed de Desenvolvimento

```python
# scripts/seed_dev.py
"""
Cria tenant demo com:
- Company (demo.foodservice.app)
- Settings + business hours
- Roles e permissions
- Employee owner (admin@demo.com / demo1234)
- Categorias e produtos genéricos
- Option groups de exemplo
"""
```

```bash
python manage.py shell < scripts/seed_dev.py
# ou
python manage.py seed_dev  # management command futuro
```

### 22.3 Onboarding de Tenant

```python
# apps/companies/services/onboarding_service.py
class OnboardingService:
    @staticmethod
    @transaction.atomic
    def create_company(*, trade_name, subdomain, owner_email, owner_password):
        company = Company.objects.create(...)
        CompanySettings.objects.create(tenant=company)
        BusinessHoursService.create_defaults(company)
        RoleService.create_system_roles(company)
        employee = EmployeeService.create_owner(company, owner_email, owner_password)
        return company, employee
```

---

## 23. Docker e Ambiente Local

### 23.1 docker-compose.dev.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: foodservice
      POSTGRES_USER: foodservice
      POSTGRES_PASSWORD: foodservice
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db
      - redis

  celery:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    command: celery -A config worker -l info
    volumes:
      - .:/app
    env_file: .env
    depends_on:
      - db
      - redis

volumes:
  pgdata:
```

### 23.2 Fluxo de Desenvolvimento

```bash
# 1. Subir infra
docker compose -f docker-compose.dev.yml up -d db redis

# 2. Instalar deps
pip install -r requirements/development.txt

# 3. Migrar
python manage.py migrate

# 4. Seed
python scripts/seed_dev.py

# 5. Rodar
python manage.py runserver
# Em outro terminal:
celery -A config worker -l info
```

---

## 24. Convenções de Código

### 24.1 Nomenclatura Python

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Módulos | `snake_case` | `order_service.py` |
| Classes | `PascalCase` | `OrderService` |
| Funções/métodos | `snake_case` | `create_from_checkout` |
| Constantes | `SCREAMING_SNAKE` | `VALID_TRANSITIONS` |
| Privado | `_prefix` | `_generate_order_number` |
| Models | singular PascalCase | `Order`, `Product` |
| Serializers | `*Serializer` | `OrderDetailSerializer` |
| ViewSets | `*ViewSet` | `AdminOrderViewSet` |

### 24.2 Type Hints

Obrigatórios em services, selectors e domain:

```python
def create_from_checkout(*, tenant: Company, data: dict) -> Order:
    ...
```

### 24.3 Ruff (Linting)

```toml
# ruff.toml
target-version = "py312"
line-length = 100

[lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM"]
```

### 24.4 Docstrings

Apenas em services e lógica não óbvia:

```python
def validate(cls, *, tenant, items) -> list[dict]:
    """
    Valida itens do carrinho contra o catálogo atual.
    Retorna itens com preços calculados ou levanta CartValidationError.
    """
```

---

## 25. Próximos Documentos

| # | Documento | Relação |
|---|-----------|---------|
| 07 | `07-api.md` | Contratos REST detalhados |
| 08 | `08-regras-de-negocio.md` | Regras implementadas nos services |
| 10 | `10-padroes-de-codigo.md` | Git, commits, PRs |
| 12 | `12-checklist-mvp.md` | Escopo backend MVP |

---

## Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | Jul/2026 | — | Versão inicial — aprovado |

---

## Apêndice A — Checklist Backend MVP

- [ ] Projeto Django + config/settings
- [ ] core/ (BaseModel, TenantAwareModel, TenantMiddleware)
- [ ] apps/companies (Company, Settings, BusinessHours)
- [ ] apps/accounts (Employee, Roles, JWT auth)
- [ ] apps/catalog (Product, Category, OptionGroups)
- [ ] apps/customers (Customer, Address)
- [ ] apps/orders (Order, checkout, status)
- [ ] apps/notifications (e-mail confirmação)
- [ ] Public + Admin URL structure
- [ ] Docker Compose dev
- [ ] Seed script
- [ ] Testes P0 (order, cart, tenant isolation)
- [ ] Exception handler
- [ ] Cache de catálogo

## Apêndice B — Ordem de Implementação Sugerida

```mermaid
graph TD
    A[core + companies] --> B[accounts + auth]
    A --> C[catalog]
    B --> D[customers]
    C --> D
    D --> E[orders + checkout]
    E --> F[notifications]
    F --> G[admin views completas]
```

---

> **Documento aprovado.** Próximo: `07-api.md`.
