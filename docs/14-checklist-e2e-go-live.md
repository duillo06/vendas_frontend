# Checklist E2E — Go-Live (Sprint 10)

Marque cada item antes de liberar para clientes reais.

## Storefront (consumidor)

- [ ] Abrir `https://{tenant}.foodservice.app` — cardápio carrega
- [ ] Categorias e produtos exibem preços corretos
- [ ] Produto com opções: selecionar tamanho/adicionais e ver preço atualizar
- [ ] Adicionar itens ao carrinho
- [ ] Checkout retirada: finalizar pedido com pagamento na entrega
- [ ] Checkout entrega: preencher endereço e finalizar
- [ ] Página de acompanhamento do pedido (`/pedido/{id}`) atualiza status
- [ ] Loja fechada (horário/config): checkout bloqueado com mensagem clara
- [ ] Testar em mobile (Chrome DevTools ou celular)

## Backoffice (operador)

- [ ] Login em `https://admin.foodservice.app` com subdomínio + credenciais
- [ ] Dashboard exibe métricas
- [ ] Lista de pedidos: novo pedido aparece (polling)
- [ ] Detalhe do pedido: mudar status `pending → confirmed → preparing → ready → completed`
- [ ] Registrar pagamento como pago
- [ ] Cancelar pedido com motivo

## Catálogo (dono)

- [ ] Criar categoria
- [ ] Criar produto com preço e imagem
- [ ] Criar grupo de opções com acréscimos (máscara R$)
- [ ] Vincular grupo ao produto
- [ ] Produto aparece no storefront após salvar
- [ ] Desativar produto — some do cardápio

## Configurações

- [ ] Alterar nome/logo da empresa
- [ ] Configurar horários de funcionamento
- [ ] Configurar taxa de entrega e pedido mínimo
- [ ] Tema/cores refletem no storefront

## E-mail (produção)

- [ ] Checkout com e-mail do cliente → confirmação recebida (verificar spam)
- [ ] Celery worker rodando (`docker compose logs celery`)

## Infraestrutura

- [ ] `DEBUG=False` em produção
- [ ] TLS ativo (cadeado no browser)
- [ ] Backup do banco testado (restore em staging)
- [ ] Sentry recebendo erros de teste

## Métricas de validação (primeira semana)

| Métrica | Meta |
|---------|------|
| Pedidos reais completos | ≥ 10 |
| Tempo médio checkout | < 3 min |
| Uptime horário de pico | 100% |
| Dono alterou cardápio sozinho | Sim |

## Registro de pedidos de validação

| # | Data | Valor | Status final | Observação |
|---|------|-------|--------------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
