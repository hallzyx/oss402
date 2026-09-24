# Esquema OSS402

Qué vamos a construir en el MVP: un agente descubre un artefacto oficial de compatibilidad, decide comprarlo porque sale más barato que rehacerlo, paga 0.05 USDC con x402 en Stellar Testnet, aplica el patch y los tests pasan. El maintainer cobra.

Paquete demo: `fastjson-x` v2.0. Runtime roto a propósito: Node.js 28.

## 1. Contexto

Quién habla con el sistema y qué queda fuera.

```mermaid
flowchart LR
  dev["Developer"] -->|"politica de gasto"| agent["Coding Agent"]
  maintainer["OSS Maintainer"] -->|"publica el artefacto"| oss402["OSS402"]
  agent -->|"MCP: descubre, compara, compra"| oss402
  agent -->|"npm test y git apply"| demo["demo-broken-app y fastjson-x"]
  oss402 -->|"402 y settlement USDC"| stellar["Stellar Testnet x402"]
  stellar -->|"0.05 USDC"| wallet["Wallet del maintainer"]
  maintainer -->|"ve la compra"| dash["Maintainer Dashboard"]
  dash --> oss402
```

El código, los docs públicos y el release estable de `fastjson-x` siguen gratis. OSS402 solo vende el trabajo extra del maintainer.

## 2. Contenedores

```mermaid
flowchart TB
  subgraph agentSide ["Lado del agente"]
    agent["Coding Agent"]
    mcp["OSS402 MCP"]
    policy["Politica de gasto"]
  end

  subgraph product ["OSS402"]
    api["OSS402 Server"]
    catalog["Catalogo y registro de proyectos"]
    store["Artefactos protegidos"]
    records["Compras y hashes"]
    dash["Maintainer Dashboard"]
  end

  subgraph demo ["Demo OSS"]
    app["demo-broken-app"]
    pkg["fastjson-x v2.0"]
    artifact["node28 compatibility artifact"]
  end

  stellar["Stellar Testnet x402"]

  agent --> mcp
  mcp --> policy
  mcp -->|"HTTP"| api
  api --> catalog
  api --> store
  api --> records
  dash --> records
  store --> artifact
  api -->|"402, verifica y liquida"| stellar
  agent --> app
  app --> pkg
  agent -->|"aplica compatibility.patch"| app
```

Herramientas MCP del MVP:

| Tool | Para qué |
| --- | --- |
| `discover_services` | Lista servicios de un proyecto, por ejemplo `fastjson-x` |
| `inspect_service` | Precio, publisher, runtime objetivo y resultado esperado |
| `wallet_balance` | Saldo USDC de la wallet del agente |
| `check_budget` | Compara el precio contra el límite autónomo |
| `purchase_resource` | Pide el recurso, paga el 402 y guarda el artefacto |

Manifiesto público del proyecto, sin pago: `/.well-known/oss402.json`.

Recurso protegido: `GET /api/resources/node28-compatibility`. Sin pago responde `402`. Con prueba de pago válida responde `200` y entrega el artefacto.

## 3. Flujo de la demo

Objetivo de pitch: unos 90 segundos. Nadie pulsa un botón de compra.

```mermaid
sequenceDiagram
  participant Agent as Coding Agent
  participant App as demo-broken-app
  participant MCP as OSS402 MCP
  participant API as OSS402 Server
  participant Chain as Stellar Testnet
  participant Wallet as Wallet del maintainer

  Agent->>App: npm test
  App-->>Agent: 41 passed, 1 failed
  Note over Agent: fastjson-x v2.0 no es compatible con Node.js 28
  Agent->>MCP: discover_services fastjson-x
  MCP->>API: leer catalogo
  API-->>Agent: Official Node.js 28 Compatibility Artifact, 0.05 USDC
  Agent->>MCP: inspect_service y check_budget 0.05
  MCP-->>Agent: permitido, queda 0.95 de 1.00
  Note over Agent: Rehacerlo cuesta mas tiempo y compute. Decision BUY
  Agent->>MCP: purchase_resource
  MCP->>API: GET /api/resources/node28-compatibility
  API-->>MCP: 402 Payment Required
  MCP->>Chain: autoriza y liquida 0.05 USDC
  Chain-->>Wallet: settlement
  Chain-->>MCP: transaction hash
  MCP->>API: reintenta con prueba de pago
  API-->>MCP: 200 artefacto
  MCP-->>Agent: .oss402/node28-compatibility/
  Agent->>App: git apply compatibility.patch
  Agent->>App: npm test
  App-->>Agent: 42 passed, 0 failed
```

Timing previsto:

| Tiempo | Qué se ve |
| --- | --- |
| 0:00–0:10 | El problema: la IA usa upstream y el maintainer no cobra |
| 0:10–0:20 | `npm test` falla |
| 0:20–0:35 | Descubre el artefacto oficial |
| 0:35–0:50 | Compara rehacerlo contra comprarlo |
| 0:50–1:05 | Pago x402 en Stellar y hash visible |
| 1:05–1:20 | Aplica el patch |
| 1:20–1:30 | Tests en verde y +0.05 USDC en el dashboard |

## 4. Decisión económica

El agente compra solo si el precio cabe en el límite autónomo y rehacerlo sale peor: más caro, más riesgoso, o con menos confianza que el artefacto oficial.

```mermaid
flowchart TD
  start["Problema de compatibilidad"] --> free["Primero mira codigo, docs y tests publicos"]
  free --> found{"Hay recurso OSS402 oficial?"}
  found -->|no| solo["Lo resuelve solo"]
  found -->|si| est["Estima rehacerlo: tiempo, compute, riesgo, confianza"]
  est --> price{"Precio menor o igual a 0.10 USDC?"}
  price -->|no| deny["DENEGADO: hace falta aprobacion humana"]
  price -->|si| better{"Rehacerlo es mas caro, mas riesgoso o menos confiable?"}
  better -->|no| solo
  better -->|si| buy["BUY"]
  buy --> pay["x402: 402, pago, 200"]
  pay --> apply["Aplica el artefacto y sigue"]
```

Ejemplo del caso demo:

| Opción | Costo | Riesgo | Confianza |
| --- | --- | --- | --- |
| Rehacer el patch | ~15–20 min, ~0.20–0.30 USD de compute | Medio | ~0.72 |
| Comprar el artefacto oficial | 0.05 USDC | Bajo, lo respalda el maintainer | ~0.98 |

Decisión: comprar. El límite autónomo es 0.10 USDC, así que no pide confirmación.

Por encima del límite, por ejemplo 3.00 USDC, el MCP rechaza la compra y pide aprobación humana. En el MVP esa política vive en el MCP. Smart accounts de Stellar quedan como stretch.

## 5. Artefacto que se entrega

```text
fastjson-node28-compat/
├── compatibility.patch
├── manifest.json
└── compatibility-report.md
```

`manifest.json` declara proyecto, versión pública `2.0.0`, runtime `node` 28, tipo `official_compatibility_patch`, publisher y hash.

## 6. Dashboard del maintainer

Después del pago se ve, como mínimo:

```text
OSS402
fastjson-x
Revenue          0.05 USDC
AI consumers     1
Node 28 Compatibility Artifact
0.05 USDC · 1 purchase
```

Gráficos, saldo y ranking de recursos son opcionales. No son parte del loop que hay que cerrar primero.

## 7. Qué no entra en el MVP

No es un marketplace de paquetes, ni un paywall del repo, ni donaciones, ni docs de pago, ni un token, ni reparto de revenue entre dependencias, ni mainnet.

El criterio de cierre es un solo loop fiable: tests rojos, descubrimiento, comparación, 402, settlement en Stellar Testnet, artefacto aplicado, tests verdes, hash visible y dashboard actualizado.

Detalle de requisitos, manifiesto, criterios de aceptación y stretch goals: [PRD.md](PRD.md).
