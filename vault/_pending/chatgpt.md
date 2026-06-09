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
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [consumer, chatbot]
sources:
  - url: https://openai.com/index/chatgpt/
    title: "Introducing ChatGPT"
    date: 2022-11-30
    quote: "We've trained a model called ChatGPT which interacts in a conversational way."
    supports: existence, operator, launch date
---

# ChatGPT

The consumer application that terminates the v1 slice — launched
November 30, 2022 as a "research preview" and the proximate cause of the
demand shock that propagates backward through this entire graph: model
scale → infrastructure buildout → accelerator supply → packaging and wafer
capacity → grid and water constraints. The pull dynamic starts here.

**Location convention:** products are global, not geographic. By project
convention, application-layer nodes are anchored at the operator's HQ city
(`precision: city`). This keeps the schema uniform; the UI can render
application nodes differently if we choose.

**Reviewer notes:** Verify the quoted launch-post sentence against
openai.com/index/chatgpt/ — wording is from the launch announcement.
