# NEURO-MAPPING — the formation of neurons in the brain, mapped against ETTZ's memory apparatus

**Status: research and comparison only. FOR OWNER REVIEW. Nothing builds from this until he rules.**

Owner-directed 2026-09-01. Deliverable 1 of 3 — see also [ADOPTABLE.md](./ADOPTABLE.md) (ranked proposals) and
[DOCTRINE-CONFLICTS.md](./DOCTRINE-CONFLICTS.md) (where biology and ETTZ deliberately disagree).
The full biology citation register, with the specific claim each source supports, is in
[NEURO-REFERENCES.md](./NEURO-REFERENCES.md).

---

## Provenance — read this before trusting anything below

**The biology side** was researched live for this report: a twelve-area literature sweep (~164 citations, every one
checked against PubMed for existence and support of its attached claim), followed by a verification critic that
re-fetched ~50 abstracts carrying quantitative or attributional claims, and then an adversarial analysis pass in which
each candidate mapping was argued both directions and a cross-mapping judge corrected over-claims and contradictions.
The critic's corrections are honored throughout and listed in [Citation integrity](#citation-integrity).

**The ETTZ side** was cited from the owner's session brief of 2026-09-01 by the cloud session that wrote this report
(no wire access), and then **verified on the wire on 2026-09-01 by the local session on the Mac mini** — the
commands and observed output are in [WIRE-VERIFICATION.md](./WIRE-VERIFICATION.md), summarized in the next section.
The agent shell on the mini is TCC-walled from `/Volumes/NAS` (every read of `.memory/` returns *Operation not
permitted*, instantly), so the spine was read through its faces (memory-face :8935, graphify :9930, PHAROS :9940,
Kalli :8931, BINNA :8960, the nerves runner :9931/:9932), the code was read from the repos, and the services were
read from their launchd plists and their logs under `~/Library/Logs`. Nothing was written, restarted or configured.

Three statements in the brief were **corrected** by the wire, and the text below now carries the corrected form.
(1) A-002 is not a planned interlock — it is the live owner-click disposal door (kallimachos `disposal.py`, shipped
2026-07-30); what is planned-not-built is the *custodian handoff* inside it. (2) `watch-contracts` is not a nerves
mechanism — it is a BINNA keeper verb, built and contract-published 2026-08-31, that has **never run**. (3) The bank
has no usage balances at all — no producer, no consumer, no `usage/` directory; the `bank-balance` tick is a plan
awaiting the owner. Two counts moved: three quarantine batches have been disposed, not two; GRAPHIFY holds 306,768
nodes, not ~150k. One statement is **unverifiable from here**: "the first Time Machine copy stood at 26%" —
`tmutil latestbackup` needs Full Disk Access, and the volume that would have held that copy was erased 2026-09-01.
No verdict in the table changed; several arguments did, and each is marked *Wire:* where it did.

**The test applied.** A mapping was accepted only at the level of *computational logic* — what is the signal, what is
the tag, what is the threshold, what is the timescale — never at the level of vocabulary. Verdicts:
**have it** (the logic is present under another name) · **partial** (a nameable piece present, a nameable piece
absent) · **missing** (no ETTZ mechanism carries the logic) · **deliberately different** (ETTZ diverges on purpose,
by owner doctrine — named as doctrine, not failure).

**The owner's attached figure.** The microscopy panel attached to the brief — dendritic filopodia counted at
microglial contact sites versus away, EM serial sections, filopodia tips in contact per 10 µm² compared across
microglia / astrocyte / bouton — corresponds to the findings of Weinhard et al. 2018 (PMID:29581545): microglial
contact *induces* spine-head filopodia (39% of contacted spines vs 7% uncontacted). It is the single best emblem of
this report's most counter-intuitive finding: biology's pruner is also a connection-promoter, and ETTZ's pruning
apparatus proposes nothing.

---

## Verified on the wire — 2026-09-01

Local session, Mac mini, read-only. Full commands and output: [WIRE-VERIFICATION.md](./WIRE-VERIFICATION.md).

| # | Claim in the brief | Observed on the wire | Status |
|---|---|---|---|
| 1 | 71,225 envelopes, 12 sources, 07-15 → 09-01 | memory-face `/api/status`: **71,585** events, span 2026-07-15T12:00Z → 2026-09-01T19:58Z, `verify_ok: true`, ledger 160. **10 sources** on 2 hosts: nerves 62,916 · memory-collector 5,119 · binna 2,383 · nerves-vm 561 · kalli 384 · pharos 113 · memory-spine 98 · musicarm 14 · omni 9 · scc 1 (mac-mini 70,724 / server-ai-staging 874) | confirmed; count moved, sources = 10 |
| 2 | 4 claims, 12 procedures, all hand-seeded | graphify `/api/stats`: claim 4, procedure 12. All 4 claims proposed by `memory-spine` (`scripts/seed_claims.py`); 10 procedures by `memory-spine` (`scripts/seed_procedures.py`, 08-01 → 08-18) and 2 by a build session writing as `kalli` (08-20, 08-21 — kallimachos has no procedure writer in code). **Every trial on record (14) was written at seed time; none has fired in use** | confirmed, sharpened |
| 3 | A-002 planned, not shipped; disposal can run without a custodian envelope | A-002 **is** the owner-click disposal door, live since 2026-07-30 (`kallimachos/disposal.py`, `POST /api/dispose` on Kalli :8931). Gate: a deep-SAFE cross-check (survivors re-hashed *on the same volume*) or `OWNER-AUTHORIZED.md`; **no custodian, snapshot or backup check exists anywhere in the package**. Three batches disposed: 2026-07-30 ×2 (18.51 GB + 117.17 GB, both deep-SAFE) and 2026-08-09-test-media (0.99 GB). Custodian `report --json` → `NO BACKUP`. Entropy has killed nothing (29 ticks, died 0) | **corrected** |
| 4 | Claims guard test exists, is in CI, passes | `tests/test_claims.py::NoDeletePath` pins the class by introspection (delete / prune / remove / drop / purge / compact); 16/16 green when run 2026-09-01. **No CI**: memory-spine has no `.github/`; the suite is a manual per-file `zsh tests/run-all.sh` | confirmed except CI |
| 5 | The bank's usage balances have no consumer | `levyio/bank` = README + 4 docs + 3 sources, no code, no `usage/`; PLAN.md: the `bank-balance` tick is build step 3, "owner approves before 3–5 build"; GAPS.md (2026-08-22): usage counters ❌ | **corrected**: no balances exist |
| 6 | memory-nightly renders state, mutates no claim, adds no trial | `com.ettz.memory-nightly` (03:00) → `spine nightly`: collect → consolidate → delta → snapshots → lifeboat. Writes one delta event, `collector/nightly-state.json`, `graph/*.jsonl`, `questions/state.json`, `claims/state.json`, `procedures/state.json` — folds rendered, nothing minted. Log 2026-09-01 03:31: `ledger +2; graph +434n/+438e … verify: ok (69515 entries)` | confirmed |
| 7 | The M1 eval harness re-runs episodes with no trial write-back | M1 is BINNA's council **maths bench** on generated fixtures (SPEC-COUNCIL §5; runs 08-18 and 08-20, n=21 × 6 arms). It writes stage envelopes to BINNA's outbox (episodic) and nothing to `claims/` or `procedures/` — `binna/src` has no trial writer. It never touches an episode | write-back confirmed; what M1 is, corrected |
| 8 | Cold fold 60 s+ on 71k entries; exact-fingerprint cache | Fold cache = (name, mtime_ns, size) over every `events/` file, **in-process only** (`claims.py:229`), so every CLI call is cold; the face's `_ReadCache` uses the same key. Measured on the face: `/api/status` (stats + full `verify`) 14.7 s, then 31.3 s; `/api/events` cache-hit 7.4 s. The 60 s+ figure was **not reproduced** (no NAS access from the agent shell) | mechanism confirmed; figure unreproduced |
| 9 | watch-contracts diffs contracts vs mesh; proposes joins/leaves only from published contracts | Lives in **BINNA** (`src/binna/keepers.py:119`), not nerves (nerves N62 left it deliberately unbuilt). Declared = `~/.ettz/*/outbox/contract.json` + registry heartbeat fields; live = runner `/mesh`; proposes *join* (declared-not-live) and *investigate* (beating-but-undeclared); never mutates; runner down → proposes nothing. Contract published 2026-08-31 with a 3600 s cadence — **zero runs**: no outbox line, no proposals dir, no log hit; the fabric fires `triggers` maps and BINNA published `verbs` | owner **corrected**; logic confirmed; never run |
| 10 | Procedures have no clock; claims never delete; windows close on contradiction | `procedures.py` §3 and `trial()` ("no clock, no disuse decay"; worked → verified, failed → contested); `claims.py` header (no delete, prune or compaction path) + the guard test; `claims.py` `propose(contradicts=)` retires the old claim at the new `valid_from`, both rows survive | confirmed in code |
| 11 | `.why.md` manifests are written by the disposer at staging time | Written by the **quarantine stager** (`quarantine.py` stage: `manifest.jsonl` fsynced first, then each file renamed, then its `<name>.why.md`), and by the inbox absorber for sidecars. It names date, batch, origin path, size, the reason and the byte-identical survivor — **no tag name, no threshold**. The disposer writes `.catalog/disposals/` (record, hash list, log) before `rmtree`, and no `.why.md` | author corrected; receipt-not-tag stands |
| 12 | GRAPHIFY ~150k nodes on :9930; PHAROS snapshots | `/health`: **306,768 nodes / 522,903 edges** (sqlite; event 211,470 · file 94,871 · service 134 · decision 112 · question 93 · procedure 12 · claim 4). Traversal exists only for the UI (`/api/node?id&depth`, `/api/vault`); no organ code calls it — BINNA reads memory-face `/api/events`. PHAROS snapshots: `~/.ettz/pharos/snapshots/<date>/` daily and on change (08-26 → 09-01) | count corrected; "nothing retrieves by traversal" confirmed |

---

## The mapping table

| # | Mechanism in the brain | ETTZ equivalent | Verdict |
|---|---|---|---|
| 1 | **Growth-cone exploration** — filopodia emitted *before* a target is known: cheap, TTL'd (~9.5 min), majority-fail, spatially bounded, steered by cue gradients read differentially with adaptive gain; stabilized only on a confirming handshake (Ziv & Smith 1996; Bentley & Toroian-Raymond 1986; Rosoff 2004; Lohmann & Bonhoeffer 2008) | watch-contracts (a BINNA keeper verb: a diff over *already-published* contracts and self-announced beats — reconciliation, not exploration; contract-published 2026-08-31, never run); DESIDERATA + IGNORANCE GRAPH (a static want-list, not a readable gradient); confirming envelopes (generic ack plumbing) | **missing** — nothing reaches; everything listens |
| 2 | **Microglial pruning** — self-written eat-me mark (PS) → complement tag (C1q→C3→iC3b) → one scoped executor (CR3); use-dependence carried by an activity-renewed *don't-eat-me veto* at the act site (CD47/SIRPα); competence time-boxed (P5→P9); the same contact also *induces* filopodia (Stevens 2007; Schafer 2012; Lehrman 2018; Weinhard 2018) | ENTROPY A-003 (dwell clocks, grace, heal-before-harm) + QUARANTINE (.why.md, owner-gated) + the live A-002 disposal door (act-site gate: same-volume survivor re-hash + owner click; the *custodian* handoff inside it is unbuilt) + BEATS surveillance; the bank's usage balances **do not exist yet** (no producer, no consumer) | **partial** — mark/execute separation, dwell-escalation, heal-before-harm and an act-site gate live; use signal absent; custody check unbuilt; no competence window; no constructive output; executor deliberately different |
| 3 | **Soma / dendrites / axon** — nonlinear afferent branch subunits (NMDA-spike coincidence detection), one factory/identity hub, one movable threshold (AIS), cargo-typed logistics with retrograde receipts, silence-of-supply as the death signal (NMNAT2/SARM1), compartment-scoped vs identity death (Major 2013; Kole 2008; Grubb & Burrone 2010; Maday 2014; Coleman & Hoke 2020) | Organ core/harness (S-4) = soma; verb doors/outbox = axon; n8n WHEN-node = AIS; confirming envelope = retrograde receipt; BEATS law = dead-man's switch; capability-removal vs organ-death = pruning vs apoptosis | **partial** — efferent half and silence-as-failure are genuine, non-generic matches; the dendritic half is absent: the afferent path is *linear union* (SPEC-SPINE-READ) where biology's payload is thresholded coincidence detection; the threshold never self-tunes |
| 4 | **Hebbian plasticity / LTP-LTD** — correlation-gated (NMDA AND-gate), synapse-local, bidirectional, non-destructive weight updates; stabilized by BCM sliding threshold + multiplicative homeostatic scaling (Nowak 1984; Dudek & Bear 1992; Bi & Poo 1998; Turrigiano 1998) | Procedures' worked→verified / failed→contested and claims' trials **are** two-factor, use-AND-outcome, item-local, bidirectional, actuating weights — but every trial on record was written at seed time; none has fired in use. The BANK's usage balances (the owner's named carrier) do not exist yet; as planned they would be use-only: no outcome coupling, no actuation, no LTD, no normalization | **partial** |
| 5 | **Synaptic tagging & capture** — a cheap *decaying* per-item eligibility tag (<3 h) set optimistically by weak events; a salience-gated cell-wide broadcast; persistence = AND(tag alive, broadcast fired), order-independent, so a later important event retroactively consolidates nearby weak ones (Frey & Morris 1997/1998; Redondo & Morris 2011; behavioral tagging: Moncada & Viola 2007) | **NONE.** Flow refs are permanent identity threads (no decay, no promotion); claims' trials are slow weights on already-promoted objects; memory-nightly is circadian and salience-blind; entropy's clock runs toward disposal, not promotion | **missing** — and the append-only spine makes the missing loop unusually cheap to add (order-independence comes free from the log) |
| 6 | **Sleep replay / systems consolidation** — fast sparse writer + slow structured store (CLS); thousands of small content-bearing replay packets (SPW-Rs) delivered into gated windows train the slow store; global downscaling makes the survivor-*ratio* the memory; product is gist (McClelland 1995; Girardeau 2009; Buzsáki 2015; Tononi & Cirelli 2014; Durrant 2011; awake replay: Jadhav 2012) | events/ + claims/ + procedures/ **is** a textbook CLS store pair, doctrine-enforced (no direct fast→slow write; contradiction closes windows). But memory-nightly is an *aggregation*, not a replay: it renders state, changes no claim, adds no trial (confirmed in code and in its log). The M1 harness is BINNA's maths bench on generated fixtures — it exercises no claim or procedure and writes no trial | **partial** — most of the machine, with the connecting shaft missing: the hippocampus→neocortex path has fired **zero** times |
| 7 | **Neurogenesis / staged integration** — niche-restricted birth, fixed migration streams, mandatory stage order (tonic listening → input → output), use-gated survival checkpoints inside fixed windows, transient high-plasticity critical period, over-provision-then-select (Doetsch 1999; Ge 2006/2007; Tashiro 2006; Toni 2008; Akers 2014) | ORGANON JOINING.md + one registry drop (the niche — genuine); participant→organ→system levels (staging — genuine); confirming envelopes (round-trip substrate). No probation window, no use-gated graduation, no critical-period scrutiny, no enforced stage order; a registered organ that never carries traffic persists undetectably forever | **partial** |
| 8 | **Active forgetting / forgetting-to-generalise** — decay is a driven, always-on process orthogonal to writing (dopamine→Rac1→cofilin; Syt3/GluA2 removal); *blocking forgetting blocks generalization* (Migues 2016); transience = regularization (Richards & Frankland 2017); natural forgetting is mostly a reversible accessibility switch (Ryan & Frankland 2022) | Close-the-window-never-delete **is** the accessibility switch (live, guard-tested); contradiction-closes-window **is** interference-triggered demotion; procedures' fail-on-trial matches mismatch-driven retention. ENTROPY is apoptosis (disposal discipline), *not* forgetting (regularization). The promotion/abstraction loop — episodes → claims/procedures — is absent | **partial**, containing the confirmed sharpest gap |
| 9 | **Signal substrate** — spike trains; tonic firing where deviation-from-baseline is the signal; efferent command with retrograde ack; deafferentation detection; neuromodulatory broadcast gain (dopamine RPE, LC novelty) scaling what gets durably written (Schultz 1997; Takeuchi 2016; Coleman & Hoke 2020) | ENVELOPES = the event substrate, but a *flight recorder*, not a spike code (a doctrinal choice: perfect recall + provenance, no free pattern-completion). BEATS = tonic firing — the strongest single analogy in the project (NMNAT2/SARM1 dead-man's-switch logic, down to local execution). Trigger fabric = efferent-with-ack. Neuromodulatory gain: **NONE** — all 71,585 envelopes are gain-flat forever | **partial** |
| 10 | **Astrocytes** — territory-owning, non-participant homeostatic controller: worst-case-sized clearance with backpressure, uptake-coupled fuel gating durable writes, staged silent-then-unsilence synapse construction, activity-tagged lifelong pruning (MEGF10/MERTK), exclusive tiling (Lehre & Danbolt 1998; Suzuki 2011; Chung 2013; Lee 2021; Bushong 2002) | Tiling = the fractal law + one-owner-per-element homing (genuine, load-bearing). Everything else: fragments. No intake controller sized against simultaneous discharge (alarms detect *silence*, not *flood*); no use-derived retirement selector; no per-organ pre-staged fold state (the cold fold is the missing fuel depot) | **partial** — resting on tiling; the judge discounted the clearance credit (quarantine's hold/dispose split is one generic feature claimed under three biological templates) |
| 11 | **Engrams** — memory as a sparse *pattern* across units; competitive allocation by excitability; pattern completion from partial cues; silent engrams (stored-but-unaddressable ≠ gone); redundant distribution (~117 regions); address = (unit set × input pathway) (Josselyn & Tonegawa 2020; Yiu 2014; Ryan 2015; Nakazawa 2002; Roy 2022; Abdou 2018) | Deliberate anti-engram on the addressing axis (a belief must be quotable, carry a why — doctrine, credited as such). Refs/flow refs = connectivity; trials/balances = weights (the Ryan 2015 split, already separated). But: content-hash addressing is *anti*-completion by construction (a perfect pattern-separator, no CA3); ETTZ's "distribution" is partitioned, not redundant — one claim = one file = one point of accidental Han-2009 ablation; no ensemble noun; no graded recall; no read-time arbitration | **partial** |
| 12 | **Apoptosis vs necrosis** — two-phase orderly disposal: tag → contained packaging → *verified phagocytic handoff* → degradation inside the recipient; necrosis is the same plan with an unacknowledged handoff (Kerr 1972; Nagata 2018); sub-lethal scoped use of the death machinery (caspase-3 in LTD, Li 2010) | ENTROPY pipeline: dwell → grace → heal-before-harm → _Quarantine with .why.md → the A-002 door (live: deep-SAFE same-volume survivor re-hash or owner authorization, records written before the single `rmtree`); the *custodian* handoff acknowledgment inside it is unbuilt. Necrosis in ETTZ = un-manifested deletion (owner-delete-residue was post-hoc phagocytosis of exactly that) | **partial** — packaging, grace, gated execution and a same-volume survivor check live; the one property separating orderly from catastrophic disposal (a verified *off-volume* handoff) is designed, **not built**, and the estate has already run the door three times with no backup in existence. Judge correction, refined on the wire: the .why.md manifest is a *receipt* written by the quarantine stager at the rename, not a pre-decision item-local *tag* |
| 13 | **The disposal/rewrite verbs themselves** — biology's destruction and in-place-rewrite primitives (engulfment, Rac1 decay, reconsolidation's labile rewrite, ablation) | The entire ETTZ surface that refuses those verbs: append-only spine, close-window guard test, quarantine-not-destruction, owner-gated disposal, splice-not-rewrite | **deliberately different** — the eleven-conflict register in [DOCTRINE-CONFLICTS.md](./DOCTRINE-CONFLICTS.md) |
| 14 | **Cross-cutting mechanisms no single mapping owned** — neuromodulatory salience broadcast; reconsolidation-on-retrieval gated by prediction error; pattern separation/completion; critical periods that close; metaplasticity; homeostatic renormalization; inhibition/divisive normalization; backpressure; awake/idle replay; schema-dependent fast consolidation; cue-staleness detection | Mostly NONE. Judge correction: the prediction-error gate is **partial**, not missing — a failing/contradicting trial mechanically closes a claim's window, which is the safe (Sevenster 2013) form of reconsolidation, already live; what is missing is anything firing it at read/ingest time | **missing** (aggregate), one item partial |

---

## What the mapping found — the six load-bearing conclusions

### 1. The owner's law is biology's default, not its opposite

The strongest external validation in the project. Natural forgetting is predominantly a **reversible
accessible→inaccessible state switch** on a surviving trace (Ryan & Frankland 2022, PMID:35027710); under
protein-synthesis-blockade amnesia the engram's connectivity survives intact and direct activation still retrieves the
memory — only addressability was lost (Ryan 2015, PMID:26023136); extinction does not delete the old record but writes
a competing, context-keyed new one, with the old response recoverable (renewal, spontaneous recovery — Bouton 2004,
PMID:15466298); and the *only* demonstrated true erasure in the engram literature is physically destroying the
allocated units (Han 2009, PMID:19286560). **Close-the-window-never-delete is not an eccentricity; it is the
biological default with a manifest attached.** A superseded claim as "the record of how understanding changed" is
biology's silent engram made queryable. Bi-temporal windows with `--asof` are context-gated retrieval — Bouton's
mechanism, implemented better than biology implements it.

Two further convergences: biology places its final disposal veto at the **act site**, not the decision site
(CD47/SIRPα aborts the phagocytic cup at the moment of commitment — Lehrman 2018, PMID:30308165), which is exactly
where the A-002 door already sits (its survivor re-hash runs at the moment of commitment); and biology treats **absence of tonic supply as the death signal** (axon survival is a lease
renewed by NMNAT2 delivery; silence arms SARM1 — Coleman & Hoke 2020, PMID:32152523), which is the BEATS law —
"silence is the one thing a heartbeat may never produce" — as executable biochemistry.

### 2. The sharpest gap is CONFIRMED: nothing promotes episodes into claims or procedures

The owner's hypothesis survives adversarial testing on three independent grounds:

- **The zero-fire fact.** 71,585 episodic envelopes (wire, 2026-09-01) against 4 claims and 12 procedures — every one
  hand-authored: the claims and ten procedures by the spine's seed scripts, two procedures by a build session writing
  as `kalli`; the only trials on record (14) were written at seed time, and none has fired in use since. The
  episodic→semantic path has never executed once in the estate's life. The fast store has no consolidation path.
- **Three literature clusters converge on it from different directions.** Deletion *manufactures* generalization
  (blocking AMPAR removal preserves specific memories AND abolishes generalization — Migues 2016, PMID:27013677);
  replay's measured product is gist (Durrant 2011, PMID:21335017; Klinzing 2019, PMID:31451802); and
  neurogenesis-driven forgetting *presumes* prior consolidation-out to cortex (Akers 2014, PMID:24812394).
- **Five analysts landed on the same hole from five unrelated mechanisms**: the afferent path's absent coincidence
  detector (soma), the absent capture conjunction (tagging), the never-fired transfer loop (sleep), the absent
  promotion (forgetting), and the flight-recorder-that-defers-abstraction (signal substrate).

Two riders sharpen it. First, the gap is **two-sided**: no loop upward (episodes→claims) *and* no salience- or
use-coupled demotion downward — the estate pays decay's labor (dwell clocks, manifests, interlocks) while collecting
none of abstraction's dividend. Second, the strongest rival — the missing **salience/neuromodulatory broadcast** — is
not a separate sharper gap but the load-bearing upstream *component* of this one: a promotion gate with no
commit-authorization input degenerates to frequency-mining (Schultz 1997, PMID:9054347; Takeuchi 2016, PMID:27602521).

### 3. One finding outranks the gap on a different axis: the unenforced handoff

Nagata 2018 (PMID:29400998) is unusually direct: **necrosis is not a different plan from apoptosis — it is apoptosis
with an unacknowledged handoff.** The completed, verified transfer of contents to the recipient is the *only* property
separating silent orderly disposal from systemic damage. *Wire:* the brief's picture was wrong in its labels and
right in its substance. A-002 is not a planned interlock; it is the live owner-click disposal door (kallimachos
`disposal.py`, shipped 2026-07-30, one `rmtree` in the package, pinned by an eight-guarantee test). Its gate at the
moment of commitment is a deep-SAFE cross-check — every survivor re-hashed from disk — or a recorded owner
authorization; that is a genuine act-site check, and it verifies that a byte-identical copy exists **on the same
volume**. Nothing in the package asks whether any copy exists *off* it: there is no custodian, snapshot or backup
check, and on 2026-09-01 Custodian reports `NO BACKUP` — the restic repository was never initialised, and the drive
that would have held a Time Machine copy was erased that morning. The door has run three times (two batches on
2026-07-30, 135.7 GB; one 0.99 GB test batch on 2026-08-09), each time with no backup in existence. By the estate's
own jurisprudence (the claims class is protected by a guard *test*, not an intention), the handoff does not exist
until the disposal verb refuses without a custodian confirming envelope. This is the project's only live
irreversible-loss exposure and ranks first in [ADOPTABLE.md](./ADOPTABLE.md).

### 4. The estate listens; nothing reaches

On the owner's first-named question — what actively explores for new connections — the adversarially-tested answer is:
**nothing**. watch-contracts reconciles self-announcements; it cannot extend toward anything that has not declared
itself — and on the wire it is a BINNA keeper verb that has never run (built and contract-published 2026-08-31 with an
hourly cadence nothing fires; zero proposals, zero outbox lines). Desiderata and the ignorance graph are a want-list, not a gradient (no differential "closer/farther" readout,
no probe budget, no adaptive re-zeroing — Rosoff 2004, PMID:15162167, shows gradient-reading *requires* continuous
gain control). There is no probe object with a TTL, no vocabulary for "tried and unanswered" distinct from "never
tried", and no repulsive "do-not-connect" cue class at all (biology's vetoes are ~1000× more sensitive than its
go-signals — Luo 1993, PMID:8402908). Bentley & Toroian-Raymond 1986 (PMID:3773996) gives the diagnosis teeth:
deprived of filopodia, growth cones still elongate but navigate blindly. **The estate will not halt for lack of
exploration — it will simply never discover a connection that did not announce itself, and no existing telemetry can
surface the deficit**, because silence-of-discovery is not a signal any organ emits. Today the owner himself is the
estate's only growth cone.

The doctrine objection ("ETTZ listens on purpose") was tested and fails: owner law gates *disposal* and *construction*,
not *inquiry* — and the estate already institutionalizes curiosity (the ignorance graph, desiderata "driving
acquisition"). Biological retraction is recycling, not destruction (actin monomers are reused), so a doctrine-clean
import exists: a failed probe collapses to one appended choice-envelope.

### 5. Use-dependence is adoptable — but only in one polarity

Biology's decisive result on use-dependent pruning is **not** "prune the least-used." Lehrman 2018 (PMID:30308165):
in CD47-null mice, microglia don't merely over-eat — they lose activity preference *entirely*. Use-dependence is
carried by the **brake**, not the tag: being used renews an expiring exemption; being silent lets an exemption lapse.
And Wang 2020 (PMID:32029629) shows policy lives in the tag, not the executor (engram-specific complement inhibition
alone blocks forgetting — the destroyer is dumb). Consequences for ETTZ:

- The **selector** is importable wholesale without touching doctrine; the **executor** stays quarantine (nothing
  computational is lost by the swap).
- The only lawful polarity is: *recent use may veto/extend a disposal proposal; absence of use must never generate
  one*. "Not used for N days → queue for disposal" is dead on arrival — it would make a broken metrics pipeline read
  as evidence for disposal, inverting the estate's own BEATS law.
- The comparator is undefined where nothing contends for the slot: procedures (no rival occupies a procedure's niche;
  a disaster-recovery procedure's use anti-correlates with its value) and claims (quiet precisely because nothing is
  wrong) must be **tested exclusions**, not documented intentions. Biology prunes by use only where rivals compete for
  shared territory (Schafer 2012, PMID:22632727 — the comparator is *relative*); disk is such a territory, entropy's
  file domain is the right jurisdiction.
- Pruning competence in biology is **time-boxed** (high at P5, gone by P9, capability intact) and the unwindowed case
  is documented pathology (the same machinery reactivating in adulthood is Alzheimer-model synapse loss — Hong 2016,
  PMID:27033548). Any ETTZ pruning mandate should be expiring and renewable, never ambient.

### 6. The claims layer already implements the safest thing in the reconsolidation literature

Reconsolidation makes a retrieved memory labile — it must be re-committed or it is lost (Nader 2000, PMID:10963596) —
but the gate is **prediction error**: a read that confirms leaves the record alone; only mismatch opens it
(Sevenster 2013, PMID:23413355). ETTZ's claims implement exactly the safe half: a failing trial closes the window and
a successor claim carries the new belief — update by splice, provenance intact. The labile in-place rewrite would break
the content-hash id contract and must never be imported; the two arrive welded together in the literature, which is how
a principle overrides a law by accident. What is genuinely missing is any *trigger* at read or ingest time — an
envelope contradicting an open claim's predicate goes unnoticed unless someone runs the predicate.

---

## Per-mapping detail

Each entry distills the adversarial analysis: what genuinely holds, what breaks, the strongest objection raised
against the verdict and why the verdict survived it. Missing pieces are enumerated because they are the raw material
for [ADOPTABLE.md](./ADOPTABLE.md).

### 1. Filopodia / growth cones → watch-contracts, desiderata? — MISSING

**Holds:** the *stabilization* half exists as structure — confirming envelopes gate commitment the way contact-evoked
calcium gates filopodium stabilization (Lohmann & Bonhoeffer 2008, PMID:18667153: transient frequency decides
stabilize-vs-retract in seconds; wrong partner class never stabilizes), and watch-contracts' propose-then-gate keeps
exploration separated from commitment. ORGANON's maturation levels mirror the probation-then-consolidation ladder
(thin spines: days; thick: months — Holtmaat 2005, PMID:15664179).
**Breaks:** all four defining filopodial properties are absent — pre-target emission, cheap disposability,
default retraction, TTL (Ziv & Smith 1996, PMID:8755481). The judge downgraded the analyst's "partial": the credited
stabilization machinery is the same generic ack primitive claimed by four other mappings, so for the growth-cone
mechanism *proper* the verdict is **missing** — with watch-contracts retained as the substrate the probe proposal
builds on.
**Wire (2026-09-01):** watch-contracts exists as BINNA's `keepers.watch_contracts` — declared contracts and registry
heartbeats diffed against the runner's `/mesh`, proposing *join* for the silent and *investigate* for the undeclared,
never mutating — and it has never executed: the contract advertises an hourly cadence, the fabric fires only
`triggers` maps, and no proposal, outbox line or log entry exists. Verdict unchanged; the substrate is real and idle.
**Also absent:** self-avoidance/duplicate-edge rejection (protocadherin identity codes — Lefebvre 2012,
PMID:22842903) and any quorum on stabilization (the 1:2:4 stoichiometric threshold that makes a single incidental
contact unable to trigger construction — Lee 2012, PMID:22457515).

### 2. Microglia → curator + entropy + quarantine — PARTIAL

**Holds (3 of 7 elements, per judge):** mark decoupled from execute (tag deposited, read later by a scoped reader ↔
candidate staged, disposed separately by a separate authority); dwell as the escalation variable (Wake 2009,
PMID:19339593 — ~5 min contacts hourly; commitment is signaled by contact *duration*, ~1 h before a bouton is lost ↔
entropy's time-in-state, rescaled ~10⁴); heal-before-harm ordering (the item's own condition established upstream of
the disposer — PS is upstream of complement, Scott-Hewitt 2020, PMID:32657463). *Wire:* the judge scored the
commitment-site veto as designed-but-absent because the brief called A-002 planned; on the wire the act-site check is
live (survivor re-hash and owner click at the moment of commitment) but carries no use signal — half of element (2),
not none. The verdict stands.
**Breaks:** the use signal is absent (*wire:* the bank's usage balances do not exist — no `usage/` directory, no
derivation tick, no code in the bank repo; the brief's "derived but unread" was one step ahead of the estate); polarity is inverted (accruing clock = positive
evidence for disposal vs lapsing veto = absence of evidence against — observably different failure modes); no
competence window; and the pruning scan — the estate's only whole-territory file scan — **proposes nothing** while
biology's equivalent contact induces filopodia (Weinhard 2018; Miyamoto 2016, PMID:27558646).
**Flagged as superficial:** `.why.md` manifests are *receipts written by the quarantine stager at the moment each file
is renamed into the batch* (after the manifest, before any disposal), naming the reason and the surviving copy — not
pre-decision, item-local, instruction-free tags (iC3b), and naming neither a tag nor a threshold. ETTZ has no "flagged, at T, by S, because Z" annotation that
precedes any disposal decision.
**Doctrine, recorded as improvement:** biology's executor is redundant (CR3/C3 nulls retain ~50% engulfment) with no
guard anywhere, and its errors are permanent. ETTZ's single-path-with-failing-guard-test is *strictly safer than the
biological design*.

### 3. Soma / dendrites / axon → organ core / harness — PARTIAL

**Holds (non-generic, falsifiable):** mandatory receipt-closure of every efferent loop (retrograde signaling endosomes
— Maday 2014, PMID:25374356); silence-of-supply as the primary failure detector with a supply-side check gating
disposal (NMNAT2/SARM1 — the interlock ordering matches); contract-as-identity at a single efferent choke point whose
loss dissolves the role (AIS polarity gate — Rasband 2010, PMID:20631711). The death taxonomy transfers: compartment
pruning with parent survival ↔ capability removal; apoptosis ↔ organ/registry death — which is exactly why CUSTODIAN
backs up the core.
**Breaks:** the dendrite leg is anatomy-flavored naming. Real dendrites compute — each thin branch is a sigmoidal
subunit firing only on ~10–20 clustered co-active inputs (NMDA spikes; the cell is a two-layer network — Poirazi 2003,
PMID:12670427); plasticity is branch-addressable; the AIS threshold self-tunes over hours–days (relocates up to
~17 µm — Grubb & Burrone 2010, PMID:20543823). ETTZ's afferent path is pull-transport into a *linear union* with no
coincidence detection anywhere — which is the same hole as gap #2 — and n8n's thresholds are static and estate-shared,
not organ-owned or homeostatic.

### 4. Hebbian strengthening → bank balances + verified counts — PARTIAL

**Holds:** procedures and claims carry the genuine Hebbian core: two-factor use-AND-outcome updates (a count moves
only when the item is *tried* and an *outcome* arrives — the AND-gate, Nowak 1984, PMID:6320006), item-local,
bidirectional (contested/superseded = LTD: graded withdrawal with the structure intact — Malinow & Malenka 2002,
PMID:12052905), and actuating (a superseded procedure is a permanent known-bad pointer that changes future behavior;
`--asof` answers change when windows close). Performance-driven-not-clock-driven matches LTD's requirement for
*activity*, not silence (900 low-frequency pulses — Dudek & Bear 1992, PMID:1350090). *Wire:* the 14 trials on
record were all written at seed time; the AND-gate has never fired in use.
**Breaks:** the owner's named carrier — bank usage balances — does not exist yet (*wire:* no `usage/`, no tick, no
code), and as planned is *not* Hebbian: use-only (strengthens a prompt that is
used often and fails often), no actuation (nothing ranks retrieval or admits to a cache — a weight that affects no
readout is a log, not a synapse), no LTD short of quarantine, and **no stability tier anywhere**: no multiplicative
renormalization (Turrigiano 1998, PMID:9495341), no sliding threshold (BCM), no read-time arbitration (Carandini &
Heeger 2012, PMID:22108672). Any ranking naively bolted onto balances is positive-feedback-unstable by construction.
Also missing: the seconds-scale, order-symmetric eligibility window real credit assignment runs on (behavioral-
timescale plasticity — Bittner 2017, PMID:28883072; the ±20 ms STDP window actively misleads here).

### 5. Synaptic tagging → flow refs? claims' trials? — MISSING

The owner's question, answered: **neither**. A flow ref marks participation and outlives the episode (like an engram
tag) but never decays and never promotes; trials are the *weight* layer, not the tag layer. STC's logic is a
consolidation window plus retroactive credit assignment: tag optimistically at every event (decay <3 h; rescue works
at 5 min–1 h, gone by 2–4 h — Frey & Morris 1998, PMID:9704995), broadcast on salience only (novelty, not familiarity
— behavioral tagging; the D1/D5 gate), persist = AND(tag alive, broadcast fired), order-independent. No ETTZ mechanism
evaluates that conjunction; nothing retroactively upgrades a weak event because something important happened nearby in
time. The strongest objection — "the append-only spine keeps everything, so nothing needs rescuing" — confuses
*retention* with *consolidation*: the selection problem (which of 71,585 weak traces deserve promotion into the stores
that shape behavior) is fully present and unsolved. The honest rider: ETTZ's substrate makes this unusually cheap —
the log's timestamps give order-independence for free.

### 6. Sleep replay → memory-nightly + M1 harness — PARTIAL

**Holds:** the CLS architecture is genuinely present and doctrine-enforced — fast sparse one-shot writer (events/),
slow store updated a little per exposure (claims' trials), no direct fast→slow write path, contradiction handled by
window-closure (Bouton's extinction-as-competing-record). memory-nightly even runs at the right phase (offline — the
low-acetylcholine mode, Diekelmann & Born 2010, PMID:20046194). The analogy is deep enough to diagnose ETTZ's own bug:
the cold fold — a monolithic re-derivation whose cache is per-process and keyed on every log file's (name, mtime,
size), so every CLI call starts from zero (*wire:* the face's full-log pass measured 15–31 s over 71,585 entries; the
brief's 60 s+ was not reproduced from the agent shell) — is precisely the pathology CLS predicts for re-derivation
instead of incremental interleaved re-presentation.
**Breaks:** memory-nightly is an aggregation, not a replay — it renders state, mints no predicate, adds no trial
(*wire:* confirmed in `nightly.py` / `consolidate.py` and in its log); the M1 harness is BINNA's maths bench on
generated fixtures — it never touches an episode, exercises no claim or procedure, and writes no trial, so the
estate's one replay-shaped mechanism is not yet even pointed at the stores. No packet shape (biology:
thousands of bounded, content-bearing, time-compressed threads — and payload is non-substitutable: induced ripples
with the right envelope but no real sequence content buy *nothing*, Fernández-Ruiz 2019, PMID:31197012); no cue-driven
selection (the ignorance graph and desiderata do not steer the fold — no TMR analog, Rasch 2007, PMID:17347444); no
downscaling for replay to select against; no awake/idle mode (Jadhav 2012); no schema fast-path (consistent items
consolidate orders of magnitude cheaper — Tse 2007, PMID:17412951).

### 7. Neurogenesis → new organs via ORGANON JOINING.md — PARTIAL

**Holds:** the admission-control half is computational, not decorative — units minted only at registered niches
(quiescence the default), identity specified at origin, staged maturation, and the round-trip graduation substrate
(a join closed only when the new node both receives and delivers on live routes — Toni 2008, PMID:18622400 ↔ the
confirming envelope). Even the estate's demography is normalized: mature systems throttling admission to near zero
while keeping the niche machinery is biologically ordinary (Sorrells 2018 vs Boldrini 2018).
**Breaks:** every *selective* stage is absent — no probation window (Tashiro 2006, PMID:16906136: retention requires
cell-autonomous evidence of correlated input inside a fixed window), no use-gated graduation criteria, no critical
period of elevated scrutiny (Ge 2007, PMID:17521569), no enforced listen-first stage order (Ge 2006, PMID:16341203:
skipping tonic-listening wrecks wiring). BEATS cannot substitute: **an organ can heartbeat perfectly forever while
carrying zero substantive traffic — beats measure aliveness, not use** — and watch-contracts diffs structure, not
traffic. A silent-but-beating limb is undetectable as unused. Deliberately different, by law: neurogenesis-induced
forgetting (growth remodels and degrades stored memory — Akers 2014) must have no ETTZ analog; a new source's arrival
must never trigger recompaction of existing records.

### 8. Active forgetting → entropy dwell clocks — PARTIAL (the sharpest gap lives here)

**Holds:** more than the hypothesis credited. The accessibility-switch (close-window ↔ Ryan & Frankland),
interference-as-executed-demotion (a contradicting trial closes the window — a step function on conflict, not a
clock), fail-on-use retention for procedures, and the full apoptotic disposal discipline in entropy/quarantine/A-002.
**Breaks:** entropy is **apoptosis, not forgetting** — a disposal discipline, not a regularizer. Its decision variable
(dwell time) matches no biological forgetting channel (biology demotes by *use* and by *mismatch*); it disposes
*files*, not retrieval rank; and nothing couples decay to abstraction — no claim, procedure, or coarsened index ever
falls out of what entropy removes. The estate pays forgetting's cost without collecting forgetting's dividend.
**The doctrine objection, resolved:** "never erase" does not forbid the computation — what produces generalization is
removal of detail *from the active index*, and biology's own dominant mechanism is the reversible accessibility
switch. The lawful ETTZ form is salience-rank demotion on a derived index, every byte and why-ledger entry intact,
`--asof` reaching everything — with the hard rule that a demotion must *enumerate what it demoted* or it is erasure
with extra steps (see C4 in DOCTRINE-CONFLICTS).

### 9. Signal substrate → envelopes / beats / trigger fabric — PARTIAL

**Holds:** BEATS = tonic firing (the project's strongest single analogy — the NMNAT2/SARM1 dead-man's switch is the
beats law as biochemistry, absence decoded against expected baseline, alarm executing locally); trigger fabric =
efferent command with retrograde receipt; flow refs = pathway tracing.
**Breaks:** envelopes are not spikes — the spine is a **flight recorder, not a nervous system**. Biology consumes its
spike train into weight changes at write time and discards it; ETTZ keeps the train and defers all abstraction to
fold time. This buys perfect recall, provenance, and time-travel (capabilities no brain has) and pays with no free
pattern-completion, no generalization, and the cold fold. This is doctrine (the law forces the flight recorder) and
is credited as such. The genuine absence with **no doctrine covering it**: neuromodulation. Nothing — no alert level,
no attention state, no novelty signal — modulates how strongly any envelope is weighted; every event is gain-flat
forever. Any promotion gate built without this input inherits the "gate with no upstream" defect.

### 10. Astrocytes → what in ETTZ? — PARTIAL

**Holds:** territorial tiling is the real match — exclusive non-overlapping domains whose union covers the field, one
owning controller per element (Bushong 2002, PMID:11756501) ↔ the fractal law, homed stores, SPEC-SPINE-READ.
Two warnings ride on it: watch-contracts should propose a *subject-space boundary* with every join (overlapping claims
to territory is the pathology tiling prevents), and GFAP reveals only ~15% of true astrocyte volume — treat
contract-declared scope and the GRAPHIFY-rendered connectome as *lower bounds* on real coupling.
**Breaks:** no organ occupies the astrocyte's actual role — a non-participant, per-territory controller that meters,
fuels, gates and prunes every exchange beside it. Specifically: no intake buffer sized against worst-case simultaneous
discharge (biology provisions 3–5× a full round from *every* producer — Lehre & Danbolt 1998, PMID:9786982 — and
clearance failure is runaway, not slow service: Tanaka 1997, PMID:9180080); **stale-fabric alarms detect silence, not
flood — the estate watches the wrong failure direction for this mechanism**; no use-derived retirement selector
consuming the bank's stream; no pre-staged per-organ fold state (the fuel-depot pattern behind "long-term memory has
an energy precondition short-term does not" — Suzuki 2011, PMID:21376239). The silent-then-unsilence secretome
(structurally complete synapses activated later by relocation, not synthesis — Allen 2012, PMID:22722203) is the
cleanest biological template for two-phase link construction / cache promotion ETTZ also lacks.

### 11. Engrams → where does a memory live in ETTZ? — PARTIAL

**Holds, credited as doctrine:** the addressable record is a deliberate anti-engram choice — an engram has no
provenance and no why (forcing a tagged ensemble optogenetically in a neutral context reproduces the memory; the
substrate cannot distinguish genuine cue from arbitrary driver — Liu 2012, PMID:22441246); the why-ledger requires a
record that can carry a reason, and such a record must have an address. ETTZ also already separates identity from
addressability (refs/flow refs = connectivity; trials/balances = weights — the Ryan 2015 split most systems conflate),
and its consolidation semantics match Kitamura 2017 (PMID:28386011): every copy written up front, what changes is
which copy answers — window-shift, not copy-operation.
**Breaks:** "distributed" means opposite things — biology's distribution is *redundant* (destroying random units
degrades nothing; ~117 regions hold one memory), ETTZ's is *partitioned* (one claim = one file = a targeted Han-2009
ablation performed by accident; *wire:* durability rests on no backup at all — Custodian reports `NO BACKUP`). Content-hash addressing is
*anti-completion by construction* — a cryptographic hash is a perfect pattern-separator (ETTZ built an excellent
dentate gyrus and no CA3 at all); the diagnostic phenotype is exact: full-cue recall intact, partial-cue recall
abolished (Nakazawa 2002, PMID:12040087) — and the cue an agent actually holds at question time is always partial.
No ensemble noun exists ("the set of records that together constitute this memory" cannot be named or measured); no
graded recall (BINNA's union is boolean; corroboration raises nothing); no read-time arbitration (the cold fold is
the symptom of an unranked read path over an unsparsified write path); and **stored-but-unreachable is currently
indistinguishable from gone** — the two-path read comparison (Ryan 2015's diagnostic) has never been run, so "no fact
is lost" is true of bytes and untested of knowledge.

### 12. Apoptosis vs necrosis → the entropy pipeline — PARTIAL

The tightest stage-for-stage correspondence in the project, tempered by the judge: contained packaging (membrane-bound
bodies, contents intact ↔ quarantine batches with manifests), silent-by-construction disposal (every death leaves an
auditable envelope trace), sub-lethal scoping (caspase-3 runs locally in dendrites for LTD, bounded by inhibitor
thresholds, cell survives — Li 2010, PMID:20510932 ↔ owner-authorization gates as blast-radius bounds), single
guardable executor. The estate has even exhibited both the disease and the immune response: `owner-delete-residue` —
deletion outside protocol — was quarantined with a manifest: post-hoc phagocytosis of necrotic debris, textbook.
**The break is §3 above:** authorization is not custody. The live gate verifies *permission* and a same-volume
*survivor*; Nagata's discriminator is *completed content transfer* to a recipient that outlives the death. Missing:
the enforced handoff (disposal blocking on a custodian confirming envelope, by content hash), the custody clause in
the existing disposal guard test (*wire:* `tests/test_disposal.py` already pins the single `rmtree` and the deep-SAFE
refusal; it does not pin a custody precondition), snapshot pinning
(restic retention could prune the very snapshot a disposal envelope cited — secondary necrosis *after* engulfment, a
failure mode biology doesn't even have), and a standing necrosis detector (content vanishing without a disposal
envelope should alarm and auto-quarantine its dangling refs reflexively, not ad hoc).
**Deliberately different, on purpose:** apoptosis ends in anonymous lysosomal recycling — true identity erasure; ETTZ
substitutes archive-then-release (A-002 preserves identity where biology destroys it), keeps every death reversible
until the owner rules, and accepts the throughput cost (3 batches in the door's first six weeks vs 10¹¹ deaths/day) as the price of
accountability.

### 13. The doctrine register — DELIBERATELY DIFFERENT

Eleven named conflicts (erasure vs windows-never-graves; destruction vs quarantine; autonomous vs owner-gated;
forgetting-to-generalise vs total recall; pattern vs record; use-it-or-lose-it vs no-clock; default-permit vs
default-deny; read-mutates vs append-only; sparse write vs total capture; instruction-free tags vs why-on-every-mark;
drift vs frozen vocabulary), each with biology's law, ETTZ's law, why the owner's law is the way it is, what each side
buys, and the rule an adopter must follow. Fully developed in [DOCTRINE-CONFLICTS.md](./DOCTRINE-CONFLICTS.md).

### 14. The reverse gap hunt — MISSING (aggregate)

**A-side** (brain mechanisms with no ETTZ analog, beyond those owned by mappings above): the neuromodulatory salience
broadcast; reconsolidation-on-retrieval (safe form live at trial time — judge's partial — but nothing fires at
read/ingest); pattern separation/completion; critical periods that close (entropy's pruning authority is ambient and
perpetual — biology time-boxes destructive *competence* independently of capability); metaplasticity (every ETTZ
threshold is a static constant); homeostatic renormalization (bank balances, once built as planned, would rise monotonically forever —
rich-get-richer lock-in is guaranteed, not risked); inhibition as a first-class signal and divisive normalization
(no negative signal class, no arbitration among matching items); backpressure (alarms watch silence, not flood);
awake/idle replay; schema-dependent fast consolidation; cue-staleness detection (content hashes never drift, but the
`<situation>` cue layer can go stale against how situations are actually described — nothing detects it).

**B-side** (ETTZ mechanisms with *no brain analog* — advantages to protect from naive bio-mimicry, not gaps):
the **why-ledger** (no neuron records its reason; biology's judgments are embodied and uninspectable — any proposal
replacing recorded reasons with implicit state destroys the estate's most non-biological asset); the **ignorance
graph** (biology signals novelty but has no queryable, in-advance frontier object); **bi-temporal claims + `--asof`**
(biology cannot query its past belief state — reconsolidation overwrites in place and leaves no prior version);
**content-hash identity** (biology's keys go stale by construction — representational drift, Ziv 2013,
PMID:23396101); the **append-only total archive with a failing guard test** (biology has redundant delete paths and
no guard anywhere); **owner-in-the-loop adjudication** (biology's closest analog is an automated brake that fails
silently when its ligand lapses); **CHOICE envelopes** (biology's roads-not-taken are invisible — "considered X,
picked Y, because Z" is counterfactual training data no nervous system possesses).

---

## Citation integrity

The verification critic's corrections, honored in this report and binding on anything built from it:

- **Drescher 1995 (PMID:7634326) is misattributed** in the sweep's topographic-mapping story: it did *not* show
  receptor-scaled relative addressing (its own abstract says an additional activity is needed for specificity). The
  matched reciprocal gradients are Cheng & Flanagan 1995 (PMID:7634327); the ratio-based relative-signalling result is
  Reber, Burrola & Lemke 2004 (PMID:15483613). RAGS is ephrin-A5, not ephrin-A2 (NLM's MeSH indexing masks this).
- **PKMζ as the LTP-maintenance molecule is contested**: Volk et al. 2013 (PMID:23283174) found normal LTP and memory
  in knockouts, and ZIP still reverses LTP in them. Nothing here rests on PKMζ; the tag-and-capture *logic* rests on
  the uncontested Frey & Morris core.
- **Astrocytic D-serine gating of LTP is contested** (IP3R2-knockout literature: Petravicz 2008, PMID:18463250;
  Agulhon 2010, PMID:20203048); it was struck as a mappable dependency.
- **Weinhard 2018's two-pathway claim** (trogocytosis independent of complement) rests on a null result (p = 0.37) and
  is used only as an existence proof of partial-edit-in-place plus the filopodia-induction statistics, corroborated in
  vivo by Miyamoto 2016 (PMID:27558646).
- **Govindarajan 2006** is a model paper; the experimental branch-level capture result is Govindarajan 2011
  (PMID:21220104). **Ramirez 2013 / Zhou 2009** were named in sweep prose without citation records and nothing was
  built on them. **Dudek & Bear's induction parameters**: 900 pulses at 1–3 Hz (15 min only at 1 Hz).
- Approximately 50 of ~164 PMIDs were re-fetched directly; apart from the Drescher case, no PMID/year/journal
  mismatches were found.

## Method

1. **Literature sweep** — 12 parallel research areas (neurogenesis; growth cones; synaptogenesis; Hebbian
   plasticity/LTP/LTD; synaptic tagging & capture; microglial pruning; astrocytes; neuron anatomy; myelination; sleep
   & systems consolidation; engrams; active forgetting & programmed cell death), every citation verified against
   PubMed with the claim it supports recorded.
2. **Completeness critique** — a verification critic flagged thin areas, misattributions and contested claims, and
   added eleven cross-cutting mechanisms the sweep missed (reconsolidation, prediction-error gating, pattern
   separation/completion, salience scoring, schema-dependent consolidation, awake replay, behavioral-timescale
   plasticity, indexing theory, representational drift, divisive normalization, extinction-as-competing-record).
3. **Adversarial mapping analysis** — 13 analysts, one per candidate mapping plus a doctrine analyst and a
   bidirectional gap-hunter; each required to argue both directions, state the strongest objection to its own verdict,
   and change the verdict if it did not survive.
4. **Cross-mapping judgment** — a judge corrected five over-claims, surfaced seven contradictions between analysts
   (all resolved in this text), ranked all proposals into the single order presented in ADOPTABLE.md, and ruled on the
   sharpest-gap hypothesis.
5. **Wire verification** — a local session on the Mac mini (2026-09-01) re-established every ETTZ-side statement the
   arguments rest on, through the estate's faces, its code and its logs, and corrected the text where the wire
   disagreed ([WIRE-VERIFICATION.md](./WIRE-VERIFICATION.md)).

Myelination — the owner's "conductor pattern" — is treated inside mappings 4 and 6 and in ADOPTABLE.md proposal 9:
its core lesson is that biology optimizes *routes* (flow refs), not items, on a two-key commit (global permissive
credit AND local site tag), that entrenchment actively suppresses rewiring (NgR1 closes critical periods — McGee 2005,
PMID:16195464) and carries standing maintenance cost (Harris & Attwell 2012, PMID:22219296) — and that
**myelination is explicitly NOT the answer to the abstraction gap**: it entrenches the specific route; built without
a generalizer, it makes the estate faster at exactly what it already over-uses.
