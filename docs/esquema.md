# Esquema OSS402

Qué construye el MVP: un agente lee la política de producción, compra una corrida de certificación oficial de `odyssey-auth` por 0.05 USDC con x402 en Stellar Testnet, GitHub Actions ejecuta la suite sobre el workspace exacto, y solo un PASS escribe una atestación del maintainer. El pago no compra un certificado.

Biblioteca demo: `odyssey-auth` v1.0.0. Apps: `demo-valid` (PASS) y `demo-invalid` (FAIL `AUTH-017`).

## 1. Contexto

```mermaid
flowchart LR
  dev["Developer"] -->|"production ready"| agent["Coding Agent"]
  maintainer["Odyssey Auth Maintainers"] -->|"define la suite"| oss402["OSS402"]
  agent -->|"MCP y skill"| oss402
  oss402 -->|"workflow_dispatch"| gha["GitHub Actions"]
  gha -->|"corre la suite"| apps["demo-valid o demo-invalid"]
  oss402 -->|"402 y settlement USDC"| stellar["Stellar Testnet x402"]
  stellar -->|"0.05 USDC"| wallet["Wallet del maintainer"]
  oss402 -->|"PASS only"| att["Soroban attestation"]
  att --> verify["Verification page"]
  maintainer --> dash["Maintainer dashboard"]
  dash --> oss402
```

El código, los docs y el release estable de `odyssey-auth` siguen gratis. OSS402 vende la autoridad de correr la suite oficial y atestar el resultado.

## 2. Contenedores

```mermaid
flowchart TB
  subgraph agentSide ["Lado del agente"]
    agent["Coding Agent"]
    skill["oss402-certification skill"]
    mcp["OSS402 MCP"]
    policy["Politica en oss402.yml"]
  end

  subgraph product ["OSS402"]
    api["OSS402 API"]
    catalog["Catalogo y manifiesto"]
    runs["Certification runs"]
    dash["Dashboard"]
  end

  subgraph demo ["Demo monorepo"]
    valid["demo-valid"]
    invalid["demo-invalid"]
    lib["odyssey-auth"]
    suite["odyssey-auth-conformance"]
  end

  gha["GitHub Actions"]
  stellar["Stellar Testnet"]
  soroban["Soroban attestation"]

  agent --> skill
  skill --> mcp
  mcp --> policy
  mcp -->|"HTTP"| api
  api --> catalog
  api --> runs
  dash --> runs
  api -->|"402"| stellar
  api -->|"dispatch"| gha
  gha --> suite
  suite --> valid
  suite --> invalid
  valid --> lib
  invalid --> lib
  api -->|"PASS only"| soroban
```

Herramientas MCP:

| Tool | Para qué |
| --- | --- |
| `oss402_discover` | Servicios de certificación de una dependencia |
| `oss402_inspect` | Precio, suite, si emite atestación |
| `oss402_purchase_certification` | 402, pago, `runId` |
| `oss402_certification_status` | running / passed / failed |
| `oss402_verify_attestation` | Metadata y validez del sujeto |

## 3. Secuencia: pago, suite, PASS o FAIL

```mermaid
sequenceDiagram
  participant Agent as Coding Agent
  participant MCP as OSS402 MCP
  participant API as OSS402 API
  participant Chain as Stellar Testnet
  participant GHA as GitHub Actions
  participant App as Demo workspace

  Agent->>Agent: Lee oss402.yml production required
  Agent->>MCP: oss402_discover odyssey-auth
  MCP->>API: catalogo
  API-->>Agent: conformance v1, 0.05 USDC
  Agent->>MCP: inspect y check budget 0.05
  MCP-->>Agent: permitido bajo 0.10 autonomo
  Agent->>MCP: purchase_certification
  MCP->>API: POST certifications
  API-->>MCP: 402 Payment Required
  MCP->>Chain: liquida 0.05 USDC
  Chain-->>MCP: tx hash
  MCP->>API: reintenta con prueba de pago
  API-->>MCP: 200 runId queued
  API->>GHA: workflow_dispatch
  GHA->>App: checkout commit, start, suite
  App-->>GHA: PASS o FAIL
  GHA->>API: callback resultado
  alt PASS
    API->>Chain: escribe attestation hash
    API-->>Agent: passed + attestationId
  else FAIL
    API-->>Agent: failed + AUTH-017, sin attestation
  end
```

## 4. Contraste de las dos apps

Misma librería, misma suite, mismo workflow. Solo cambia la configuración.

```mermaid
flowchart TD
  subgraph both ["Ambas apps"]
    unit["Unit tests PASS"]
    build["Build PASS"]
    lint["Lint PASS"]
  end

  both --> suite["Odyssey Auth Conformance v1"]

  suite --> validPath["apps/demo-valid"]
  suite --> invalidPath["apps/demo-invalid"]

  validPath --> pass["30 / 30 PASS"]
  pass --> att["Maintainer attestation on Stellar"]
  pass --> badge["README badge opt-in"]

  invalidPath --> fail["29 / 30 FAIL"]
  fail --> code["AUTH-017 Expired token was accepted"]
  fail --> none["No attestation"]
```

Esto prueba que el pago no garantiza aprobación y que la suite evalúa el proyecto, no un resultado hardcodeado.

## 5. Binding de la atestación y stale

La atestación no se ata solo a `repository + commit`. Las dos demos viven en el mismo repo y pueden compartir commit.

```mermaid
flowchart TD
  subject["Subject hash"] --> repo["repository"]
  subject --> commit["commit"]
  subject --> workspace["workspace path"]
  subject --> dep["dependency version"]
  subject --> suiteVer["suite version"]
  subject --> config["configuration or build hash"]

  check{"Current subject matches attestation?"}
  subject --> check
  check -->|yes| ok["Maintainer Conformant"]
  check -->|no| stale["CERTIFICATION STALE"]
```

Stale significa: este build no está certificado. No significa que falló la certificación.

## 6. Precio y política

| Concepto | Valor |
| --- | --- |
| Precio por corrida | 0.05 USDC |
| Incluye | intento inicial + 1 remediation retry |
| Límite autónomo | 0.10 USDC |
| Presupuesto de sesión | 1.00 USDC |
| Red | stellar-testnet |

Detalle de requisitos: [PRD.md](PRD.md).
