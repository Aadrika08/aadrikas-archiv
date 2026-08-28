---
title: Cross-Session EEG Biometrics
slug: cross-session-eeg-biometrics
period: 2024–2025 · IEEE TNSRE SUBMISSION
order: 1
summary: Standard EEG biometric benchmarks overstate accuracy by 25.96 points because they evaluate within a single session.
featured: true
draft: false
---

Replicated the problem at scale on 83 subjects (PhysioNet Motor Imagery), then proposed DA-EEGNet — a domain-adversarial EEGNet using gradient reversal to learn session-invariant identity representations. It reached 85.11% leave-one-session-out accuracy against 71.53% (SVM) and 63.95% (EEGNet) baselines. A first systematic cross-session channel ablation showed 8 electrodes retain 80% of full 64-channel performance, with a sharp cliff below 4.
