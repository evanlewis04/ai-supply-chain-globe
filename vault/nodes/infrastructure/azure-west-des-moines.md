---
id: azure-west-des-moines
name: Microsoft Azure — West Des Moines campus
layer: infrastructure
type: data_center
operator: Microsoft (Azure)
ticker:
  symbol: MSFT
  exchange: NASDAQ
location:
  lat: 41.577
  lon: -93.711
  country: US
  region: West Des Moines, Iowa
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [azure, openai-training, gpt-4]
sources:
  - url: https://thehill.com/homenews/ap/ap-technology/ap-artificial-intelligence-technology-behind-chatgpt-was-built-in-iowa-with-a-lot-of-water/
    title: "AP: Artificial intelligence technology behind ChatGPT was built in Iowa — with a lot of water (syndicated)"
    date: 2023-09
    quote: "Microsoft's president, Brad Smith, disclosed that it had built its 'advanced AI supercomputing data center' in Iowa, exclusively to enable OpenAI to train what has become its fourth-generation model, GPT-4."
    supports: location, role in GPT-4 training
---

# Microsoft Azure — West Des Moines campus

Microsoft's data center cluster in West Des Moines, Iowa is — per Microsoft
president Brad Smith via AP reporting — the "advanced AI supercomputing
data center" built exclusively to enable OpenAI to train GPT-4. It is the
concrete geographic answer to "where was GPT-4 actually trained," which is
why it anchors the infrastructure layer of the v1 slice.

The AP reporting also documents the resource cost: ~11.5 million gallons of
water drawn in July 2022 (the month before GPT-4 finished training), about
6% of the district's usage — a preview of the water/power constraint
entities coming in later iterations.

Coordinates are the West Des Moines city centroid, precision `city`; the
campus consists of multiple sites.

**Reviewer notes:** (1) The source is AP syndicated via The Hill — swap in
the canonical apnews.com URL if preferred. (2) MW capacity is `null`;
Microsoft does not publish campus power figures — note rather than guess.
