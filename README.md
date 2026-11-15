# Rishabh Arora — Space Portfolio v8.3

This release removes the client-side request-flow simulator from the Bonus Promotions case study.

## Retained
- Cinematic Three.js space portfolio and continuous flight navigation.
- Guided journey and Return to Top control.
- Contact actions, copy-email feedback, resume download and accessibility improvements from v8.0.
- Bonus Promotions architecture case study with selectable reference scales: 1, 100, 10K and 1M concurrent users.
- The architecture view updates its application, Redis, PostgreSQL and Kafka descriptions and scale-specific design notes.
- Modal keyboard focus handling, Escape-to-close, and mobile-friendly layout.

## Removed in v8.3
- Request scenario selectors (eligibility cache hit, cache miss, lifecycle write).
- RUN REQUEST animation, request trace track, execution log, timers and flow highlighting.
- All CSS dedicated to the request-flow simulator.

## Architecture notes
The scale selector is an illustrative architecture walkthrough, not a live benchmark or a claim that these exact node counts were deployed. Redis accelerates hot reads; PostgreSQL remains the durable system of record; Kafka represents the asynchronous event path. The 10M+ RPM metric is retained as the figure already stated in the portfolio.

## Deploy
Replace the repository files with the contents of this ZIP, then run:

```bash
git add .
git commit -m "Remove request flow simulator from Bonus Promotions case study"
git push origin main
```

Vercel should deploy automatically after the push.
