# HANDOFF-LOCAL — brief for the local session on the Mac mini

**Status: research and comparison only. No code, no changes to any running system. Nothing builds until the
owner rules.**

You are picking up work started by a cloud session on 2026-09-01. That session had **no wire access** to the
estate — no Mac mini, no memory spine, no NAS — so it produced a rigorous biology-side analysis and mapped it
against the owner's *written* brief of the ETTZ inventory. Your job is what it could not do: **verify the ETTZ
column on the wire**, correct what the wire contradicts, and prepare the docket for the owner's ruling.

## Where the work is

- Repo `developerclaude1-coder/openclaw-office`, branch `claude/neuro-memory-ettz-mapping-wxs3ro`, draft PR #7
  (mergeable, no CI, no review threads at handoff).
- `docs/` is **gitignored** in that repo; the deliverables were force-added. Keep using `git add -f docs/<file>`.
- The documents, in reading order:
  1. [`NEURO-MAPPING.md`](./NEURO-MAPPING.md) — the 14-row table (mechanism in the brain → ETTZ equivalent or
     NONE → verdict: have it / partial / missing / deliberately different), with per-mapping adversarial detail:
     what holds, what breaks, the strongest objection to each verdict and why it survived.
  2. [`NEURO-REFERENCES.md`](./NEURO-REFERENCES.md) — 164 PubMed-verified citations, each with the specific
     claim it supports, plus binding corrections. Do **not** build on: Drescher 1995's relative-threshold claim
     (misattributed — use Reber 2004 / Cheng & Flanagan 1995), PKMζ maintenance (contested — Volk 2013), the
     astrocytic D-serine gate (contested), Weinhard 2018's two-pathway separation (a null result), or the uncited
     Ramirez 2013 / Zhou 2009.
  3. [`ADOPTABLE.md`](./ADOPTABLE.md) — 14 proposals merged and ranked into one docket, each with principle /
     smallest change / cost / concrete failure modes / owning session; ends with the six rulings the owner must
     make before anything builds.
  4. [`DOCTRINE-CONFLICTS.md`](./DOCTRINE-CONFLICTS.md) — the C1–C11 register of deliberate biology-vs-ETTZ
     disagreements, each with the rule an adopter must follow, and the five ways adoption silently overrides
     owner law.
  5. [`neuro-research/`](./neuro-research/README.md) — the full working material: the twelve per-area
     literature files, the critic's corrections, the fourteen adversarial mapping analyses, and the judge's
     ruling. The deliverables above are the distillation; this is the argument behind every verdict. Where the
     judge (`neuro-research/mapping/00-JUDGMENT.md`) differs from an analyst file, the judge wins.

## What the analysis concluded — test these, don't re-derive them

1. **The owner's suspected sharpest gap is confirmed**: nothing promotes repeated episodic patterns into claims
   or procedures. Load-bearing evidence is the zero-fire fact — 71,225 episodic envelopes against 4 claims and
   12 procedures, all hand-seeded; the episodic→semantic path has never executed. The gap is two-sided: no loop
   upward, and no salience- or use-coupled demotion downward.
2. **One finding outranks it on operational risk**: the CUSTODIAN A-002 handoff interlock is specced, not live,
   and two quarantine batches were already disposed of while the first Time Machine copy stood at 26%. Biology's
   argument (Nagata 2018): necrosis is apoptosis with an unacknowledged handoff — the completed, verified transfer
   is the *only* property separating orderly disposal from catastrophe. ADOPTABLE #1.
3. **Nothing reaches; everything listens.** watch-contracts reconciles self-announcements; there is no probe, no
   TTL, no retraction vocabulary, no gradient — and no existing telemetry can ever surface that deficit.
4. **Use-dependent pruning is adoptable in exactly one polarity**: use may renew or extend an exemption (the CD47
   brake — Lehrman 2018); absence of use must never generate a disposal proposal. Procedures and claims are
   tested exclusions, since the comparator is undefined where nothing contends for the slot.
5. **The never-erase law is biology's own default**, not a divergence: natural forgetting is a reversible
   accessibility switch; only physical unit destruction truly erases. Close-the-window-never-delete is the
   biological mechanism with a manifest attached.

## Your tasks, in order

### 1. Verify the ETTZ column on the wire, and record the command you used for each

Every ETTZ-side statement is currently cited from the owner's brief, not observed. The claims arguments rest on,
in priority order:

| Claim from the brief | Why it matters | What to establish |
|---|---|---|
| 71,225 envelopes, 12 sources, 2026-07-15 → 09-01 | the "spike train" scale; the zero-fire ratio | actual counts, by source |
| 4 claims, 12 procedures, all hand-seeded | the zero-fire fact (conclusion 1) | counts, and whether *any* was machine-authored |
| A-002 is planned, not shipped; the disposal verb can run without a custodian envelope | conclusion 2, ADOPTABLE #1 | can kallimachos dispose today without a custodian confirming envelope? which batches ran, and when, relative to backup state? |
| The claims class has a guard test that fails if a delete path appears | the doctrine's enforcement standard; ADOPTABLE #2 generalizes it | the test exists, is in CI, and passes |
| The bank's usage balances have no consumer | mapping 2 (use signal stranded) and ADOPTABLE #4 | who reads balances, if anyone |
| memory-nightly renders state and mutates no claim / adds no trial | mapping 6 ("aggregation, not replay"); ADOPTABLE #3 | what the nightly job actually writes |
| The M1 eval harness re-runs episodes with no trial write-back | ADOPTABLE #3's companion wire | whether harness outcomes ever land as trials |
| Cold fold 60 s+ on 71k entries; exact-fingerprint cache | recurring diagnostic across mappings 6, 9, 10, 11 | current timing |
| watch-contracts diffs contracts vs mesh membership; proposes joins/leaves only from published contracts | mapping 1 (missing) | confirm it never proposes from observed traffic |
| Procedures have no clock; claims never delete; windows close on contradiction | C1, C6, C8 | confirm in code, not docs |
| `.why.md` manifests are written by the disposer at staging time | the judge's "receipt, not tag" correction | when and by whom the manifest is written |
| GRAPHIFY ~150k nodes on :9930; PHAROS snapshots | mapping 11 | node count; whether anything *retrieves* by traversing the graph |

Where the wire contradicts the brief, **correct the document and say so plainly** — a corrected row is worth more
than a confirmed one. If a correction changes a verdict, change the verdict and note the reason.

### 2. Replace the provenance caveat with evidence

The owner asked for the mapping "cited both ways." The biology side is cited; the ETTZ side currently carries a
caveat in `NEURO-MAPPING.md` § Provenance instead of commands. Add the command and its observed output for each
row (a short "verified on the wire" block per mapping, or one table), and rewrite the Provenance section to
state what was verified, when, and by which session.

### 3. Surface the six rulings for the owner

They gate everything in the docket (end of `ADOPTABLE.md`):

1. **C4** — is *retrievability* covered by "never erase"? (Index demotion is lawful only if recorded,
   enumerable and reversible.)
2. **C7** — may absence-of-use *ever* generate a disposal or leave proposal? Default no; the one requested
   exception is probationary new joiners.
3. **The CD47 exclusion list** — procedures/, claims/, why-ledger, events/ as tested exclusions; and whether use
   may inform file-domain disposal at all.
4. **The claims-class exception path** — a named, owner-only, single-item remedy for a secret or third-party
   personal data reaching a claim's text (quarantine is not containment; there is no destruction verb in the
   class).
5. **Approximate matching** — permitted in the promotion path while retrieval stays exact?
6. **One salience vocabulary** — derived score first; a durable envelope only if the Capture Pass needs it.

Put them in whatever form the owner reviews things in. Do not pre-decide them.

## Constraints — unchanged from the original brief

Read-only everywhere. Never touch Tailscale, mounts, launchd, or any running service. Bounded reads on
`/Volumes/NAS`. The private division applies to anything you quote. Commit and push to the same branch; the
orchestrator verifies from the wire.

## One caution

Do not let the biology drive an implementation. Every biological mechanism worth having arrives welded to a
destruction or in-place-rewrite verb, and `DOCTRINE-CONFLICTS.md` names the five ways owner law gets overridden
by accident — the index-demotion loophole (bytes kept, access erased, compliance certificate attached) and
polarity inversion (silence read as evidence for disposal) especially. Read every proposal for polarity before
reading it for merit.
