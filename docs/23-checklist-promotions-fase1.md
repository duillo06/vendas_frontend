# 23 — Checklist Promoções Fase 1

> **Documento:** Escopo fechado — produto em oferta (Campanha `product_price`)  
> **Produto:** Food Service *(nome comercial provisório)*  
> **Versão:** 1.0  
> **Status:** Em implementação  
> **Última atualização:** Julho/2026  
> **Depende de:** `20-promotions-philosophy.md`, `21-marketing-engine.md`, `22-promotions-architecture.md`

---

## Backend

- [x] App `promotions` + model `Campaign` + migration
- [x] `CampaignService` (criar / pausar / validar preço)
- [x] `CampaignResolver` (janela, weekdays, indicadores, selos)
- [x] Admin API `/admin/campaigns/`
- [x] Public API `/public/promotions/offers/`
- [x] Permissão `promotions.manage`
- [x] Checkout usa preço promocional
- [x] Serializers públicos sobrescrevem De/Por quando há oferta
- [x] Testes pytest (criação, weekday, checkout, offers, admin)

## Frontend backoffice

- [x] Nav + rota `/promocoes`
- [x] Lista de campanhas + pausar/reativar
- [x] Assistente conversacional (objetivo → produto → preço → recorrência → superfícies)

## Frontend storefront

- [x] Carrossel de ofertas na Home (some se vazio)
- [x] Selos / De-Por no cardápio e detalhe via `promotion`

## Docs

- [x] `22-promotions-architecture.md`
- [x] Cross-refs leves em `03` / `07` / `08`

## Fora do escopo (próximas fases)

- [ ] Combo / frete grátis / brinde
- [ ] Cupons
- [ ] Calendário / campanhas prontas / sistema proativo

---

> Marcar itens ao validar em ambiente local (API 8001, storefront 5174, backoffice 5175).
