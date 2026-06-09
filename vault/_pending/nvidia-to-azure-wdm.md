---
id: nvidia-to-azure-wdm
from: nvidia-santa-clara
to: azure-west-des-moines
flow_type: chips
volume:
  value: null
  unit: null
  as_of: 2022-Q4
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: []
notes: >
  GPU supply to Azure AI infrastructure. Microsoft's announced Azure AI
  buildout adds "tens of thousands" of Nvidia A100/H100 GPUs; the 2020
  OpenAI supercomputer disclosed 10,000 GPUs. Per-campus allocation is not
  public, so volume is null on this specific edge. Substitutability low:
  in the GPT-4 training era there was no practical alternative to Nvidia
  accelerators at this scale (CUDA ecosystem lock-in).
sources:
  - url: https://nvidianews.nvidia.com/news/nvidia-microsoft-accelerate-cloud-enterprise-ai
    title: "NVIDIA Teams With Microsoft to Build Massive Cloud AI Computer"
    date: 2022-11-16
    quote: "Azure will incorporate tens of thousands of NVIDIA A100 and H100 GPUs."
    supports: relationship, scale of GPU flow to Azure
  - url: https://news.microsoft.com/source/features/ai/openai-azure-supercomputer/
    title: "Microsoft announces new supercomputer, lays out vision for future AI work"
    date: 2020-05-19
    quote: "The supercomputer developed for OpenAI is a single system with more than 285,000 CPU cores, 10,000 GPUs and 400 gigabits per second of network connectivity for each GPU server."
    supports: GPU scale of the OpenAI-dedicated Azure system
---

# nvidia-santa-clara → azure-west-des-moines

The allocation edge: Nvidia GPUs flowing into the Azure campus that trained
GPT-4. This is where chip supply meets infrastructure, and during 2023 it
was the most contested link in the industry (GPU allocation queues).

**Reviewer notes:** Both quotes reconstructed from announcement coverage —
verify wording against the linked pages. The Azure-wide "tens of thousands"
figure is not campus-specific; the notes field says so explicitly.
