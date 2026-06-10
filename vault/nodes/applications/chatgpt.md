---
id: chatgpt
name: ChatGPT
layer: applications
type: product
operator: OpenAI
location:
  lat: 37.7749
  lon: -122.4194
  country: US
  region: San Francisco, California
  precision: city
capacity:
  value: 800000000
  unit: weekly_active_users
  as_of: 2025-10
status: operational
constraints: []
tags: [consumer, chatbot]
sources:
  - url: https://openai.com/index/chatgpt/
    title: "Introducing ChatGPT"
    date: 2022-11-30
    quote: "We've trained a model called ChatGPT which interacts in a conversational way."
    supports: existence, operator, launch date
  - url: https://techcrunch.com/2025/10/06/sam-altman-says-chatgpt-has-hit-800m-weekly-active-users/
    title: "Sam Altman says ChatGPT has hit 800M weekly active users (TechCrunch)"
    date: 2025-10-06
    supports: capacity (800M weekly active users, announced at DevDay October 2025)
  - url: https://techcrunch.com/2026/05/05/openai-releases-gpt-5-5-instant-a-new-default-model-for-chatgpt/
    title: "OpenAI releases GPT-5.5 Instant, a new default model for ChatGPT (TechCrunch)"
    date: 2026-05-05
    supports: current model generation powering the product (GPT-5.5 Instant default since May 2026)
---

# ChatGPT

The consumer application that terminates the v1 slice — launched
November 30, 2022 as a "research preview" and the proximate cause of the
demand shock that propagates backward through this entire graph: model
scale → infrastructure buildout → accelerator supply → packaging and wafer
capacity → grid and water constraints. The pull dynamic starts here.

The pull has only grown: 800M weekly active users as of October 2025
(Altman, DevDay), with the default model upgraded to the GPT-5.5
generation (GPT-5.5 Instant) in May 2026. Every model generation since
GPT-4 — GPT-5 (2025), GPT-5.5 (April 2026) — has ratcheted the demand
signal running backward through this graph.

**Location convention:** products are global, not geographic. By project
convention, application-layer nodes are anchored at the operator's HQ city
(`precision: city`). This keeps the schema uniform; the UI can render
application nodes differently if we choose.

**Reviewer notes:** Verify the quoted launch-post sentence against
openai.com/index/chatgpt/ — wording is from the launch announcement.
