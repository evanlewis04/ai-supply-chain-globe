---
id: openai-to-chatgpt
from: openai-hq
to: chatgpt
flow_type: model_weights
volume:
  value: null
  unit: null
  as_of: 2022-Q4
lead_time_weeks: null
constraint_level: low
substitutability: low
constraints: []
notes: >
  Model deployment: OpenAI's trained models power ChatGPT. Intra-
  organization edge — constraint level low (no external dependency), but
  substitutability low by definition (the product is the model).
sources:
  - url: https://openai.com/index/chatgpt/
    title: "Introducing ChatGPT"
    date: 2022-11-30
    quote: "We've trained a model called ChatGPT which interacts in a conversational way."
    supports: relationship (OpenAI model behind the ChatGPT product)
---

# openai-hq → chatgpt

The final edge of the slice: model becomes product. This is where the pull
dynamic originates — ChatGPT's demand shock propagates backward through
every edge upstream of this one.
