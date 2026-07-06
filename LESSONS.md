# Lessons Learned

Lessons recorded during AI-assisted development. Each entry captures a mistake, correction, or insight worth remembering in future sessions.

---

- [2026-07-01] Never guess dimension values in DS documentation — always read the actual Figma component properties. All CxPortal DS dimensions follow a 4px grid; any value not divisible by 4 (e.g. 29px) is wrong and must be verified before writing.
- [2026-07-01] Never assume how two adjacent components connect — read the actual spacing/margin from Figma. The Input combo uses -1px margin between independent fields, not a shared border seam. Describe what the component IS, not what it looks like at a glance.
