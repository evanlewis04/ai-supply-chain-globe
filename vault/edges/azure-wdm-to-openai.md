---
id: azure-wdm-to-openai
from: azure-west-des-moines
to: openai-hq
flow_type: compute
volume:
  value: 2.0e+25
  unit: flop_training_total_gpt4_estimate
  as_of: 2023-03
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: []
notes: >
  Training compute. The West Des Moines campus hosted the supercomputer
  Microsoft built exclusively for OpenAI, on which GPT-4 was trained
  (training completed August 2022 per AP reporting). Volume is Epoch AI's
  GPT-4 training compute estimate (~2e25 FLOP, stated accurate within a
  factor of five) — an independent research estimate, not a disclosure.
  Substitutability low: Azure was OpenAI's exclusive cloud provider during
  this period.
sources:
  - url: https://thehill.com/homenews/ap/ap-technology/ap-artificial-intelligence-technology-behind-chatgpt-was-built-in-iowa-with-a-lot-of-water/
    title: "AP: Artificial intelligence technology behind ChatGPT was built in Iowa — with a lot of water (syndicated)"
    date: 2023-09
    quote: "Microsoft's president, Brad Smith, disclosed that it had built its 'advanced AI supercomputing data center' in Iowa, exclusively to enable OpenAI to train what has become its fourth-generation model, GPT-4."
    supports: relationship (GPT-4 trained on the Iowa campus)
  - url: https://news.microsoft.com/source/features/ai/openai-azure-supercomputer/
    title: "Microsoft announces new supercomputer, lays out vision for future AI work"
    date: 2020-05-19
    supports: exclusive Azure supercomputer built for OpenAI
  - url: https://epoch.ai/data-insights/models-over-1e25-flop
    title: "Over 30 AI models have been trained at the scale of GPT-4 (Epoch AI, accessed 2026-06)"
    date: 2026-06
    quote: "GPT-4 was the first model trained at this scale (~2e25 FLOP), released in March 2023."
    supports: volume (training compute estimate)
  - url: https://semianalysis.com/2023/07/10/gpt-4-architecture-infrastructure/
    title: "GPT-4 Architecture, Infrastructure, Training Dataset, Costs, Vision, MoE (SemiAnalysis)"
    date: 2023-07-10
    supports: training infrastructure analysis (cluster scale, parallelism)
---

# azure-west-des-moines → openai-hq

The compute edge that produced GPT-4. In M2 this gets refined: a
training-cluster node sited at the Azure campus, with the model artifact
as its output — this direct lab edge is the walking-skeleton version.
