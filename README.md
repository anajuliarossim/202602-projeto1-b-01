# [Bulbe Jornada]

> Projeto em Ciência de Dados I · Ibmec BH · 2º semestre de 2026
> Cliente: **Bulbe Energia** · Turma **[B]** · Squad **[01]**

[Solução que orienta novos clientes da Bulbe desde a adesão até o início da economia, com informações claras sobre etapas, faturas e pagamentos]

---

## 1. Problema

[Qual parte da dor da Bulbe o squad escolheu atacar e por quê. Use pelo menos um dado da apresentação da Bulbe como evidência.]

- **Dor escolhida:** [ex.: clientes que não recebem ou não entendem a 1ª fatura]
- **Evidência:** [ex.: cerca de 20% de falha na entrega de mensagens de WhatsApp]
- **Indicador que a solução pretende mover:** [pagamento da 1ª fatura | churn do 1º mês | entregabilidade das comunicações]

## 2. Persona e jornada

- **Persona 1:** 
- **Nome e idade:** [Sérgio, 45 anos]
- **Contexto:** [Conheceu a empresa pela indicação de um colega de trabalho]
- **Objetivo:** [Procura reduzir as despesas para direcionar o dinheiro a projetos pessoais]
- **Medos e dúvidas:** [ "O que a empresa ganha com isso?" "O desconto vale mesmo a pena?" "Tenho que pagar duas contas?" ]
- **Canais que usa:** [ Usa whatsapp apenas para mensagens importantes ou conversas com pessoas próximas e só visualiza questões de serviços e profissionais por email]

- **Mapa de jornada:** [docs/jornada.md](docs/jornada.md)

- **Persona 2:**
- **Nome e idade**: [Maria, 39 anos]
- **Contexto**: [Conheceu a Bulbe por meio de uma publicação nas redes sociais]
- **Objetivo**: [Quer diminuir os gastos fixos da casa para conseguir guardar mais dinheiro todos os meses]
- **Medos e dúvidas**: ["Essa empresa existe mesmo? Esse desconto é garantido?" "Como sei se realmente estou economizando?""Tem fidelidade ou multa para cancelar?"]
- **Canais que usa**: [Usa WhatsApp para tudo, não entra no e-mail]

## 3. Solução

[Descrição curta da solução e das principais telas.]

| Tela | O que faz | História relacionada |
| --- | --- | --- |
| [Início] | [ ] | [HU01] |
| [ ] | [ ] | [ ] |

- **Histórias de usuário:** [docs/historias.md](docs/historias.md)
- **Wireframes:** [docs/wireframes/](docs/wireframes/)

## 4. Tecnologias

- HTML, CSS e JavaScript puro (vanilla)
- Dados fictícios em JSON, lidos com `fetch` (pasta [`data/`](data/))
- Git e GitHub (Issues, Projects e Pull Requests)

## 5. Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/[usuario]/202602-projeto1-[turma]-[squad].git
   ```
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server** (o VS Code vai sugerir automaticamente).
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

> Abrir o `index.html` direto no navegador (duplo clique) não funciona: o `fetch` dos arquivos JSON exige um servidor.

## 6. Estrutura do repositório

```
├── index.html            # Página inicial
├── pages/                # Demais telas da solução
├── assets/
│   ├── css/style.css     # Estilos
│   ├── js/main.js        # Lógica da página inicial
│   ├── js/api.js         # Leitura dos dados (fetch)
│   └── img/              # Imagens e ícones
├── data/                 # Dados fictícios em JSON
├── docs/                 # Jornada, histórias, wireframes e sprints
└── .github/              # Modelos de Issue e de Pull Request
```

## 7. Quadro do projeto

- **GitHub Projects:** [link para o quadro do squad]

## 8. Equipe

| Integrante | GitHub | Papel principal |

| [Ana Júlia Rossi] | [@anajuliarossim](https://github.com/anajuliarossim) | [Product Owner] |
| [Luiz Balestrassi] | [@LuizBalestrassi](https://github.com/LuizBalestrassi) | [Scrum Master] |
| [Bernardo Neto] | [@bernardogonacalvesdasilvaneto-cyber](https://github.com/bernardogoncalvesdasilvaneto-cyber) | [Developer] |
| [Giovanni ] | [@GiovanniLZMG] (https://github.com/GiovanniLZMG) | [Developer] |

## 9. Entregas

| Marco | Aula | Status |
| --- | --- | --- |
| Mapa de jornada | 19 | [ ] |
| Histórias de usuário | 20 | [ ] |
| Wireframes | 21–23 | [ ] |
| Sprint Review I | 24 | [ ] |
| Implementação | 25–28 | [ ] |
| Sprint Review II | 29 | [ ] |
| Versão final | 30 | [ ] |

---

> Todos os dados deste repositório são fictícios. Nenhum dado real de cliente da Bulbe Energia é utilizado.
