# ADOPTABLE — ranked proposals for bringing ETTZ closer to how real brains work

**Status: FOR OWNER REVIEW. Nothing builds from this until he rules.**

Deliverable 2 of 3 — the mapping and evidence behind every proposal is in [NEURO-MAPPING.md](./NEURO-MAPPING.md);
the doctrine constraints every proposal was checked against are in
[DOCTRINE-CONFLICTS.md](./DOCTRINE-CONFLICTS.md). ETTZ mechanisms were cited from the owner's 2026-09-01 brief and
**verified on the wire on 2026-09-01** by the local session ([WIRE-VERIFICATION.md](./WIRE-VERIFICATION.md)); the
corrections that touch this docket are carried inline below, marked *Wire:*.

Fourteen proposals emerged from the adversarial mapping analysis; a cross-mapping judge ranked them into one order
by value-to-the-owner (against his named asks: new-pathway creation, use-dependent store-or-purge, decay, signaling
refinements, and the abstraction gap) versus cost versus doctrine risk, and identified four merges. The merged,
ranked docket:

| # | Proposal | Answers | Cost | Doctrine risk |
|---|----------|---------|------|---------------|
| 1 | **Completed-Handoff Enforcement** (ship A-002 as a hard gate) | store-or-purge (safety) | small | none — it *enforces* the law |
| 2 | **The Doctrine Gate** (verb ledger + doctrine block on proposals) | meta — makes everything below safe | small | negative |
| 3 | **RIPPLE-PASS** (nightly replay drafting candidate claims) | the abstraction gap | moderate | clean |
| 4 | **The CD47 Exemption** (usage renews dwell — extension-only) | use-dependent store-or-purge | small | lowest of any use-import |
| 5 | **Salience layer** (prediction-error/novelty gain, ordering-only) | signaling refinement; feeds #3/#6/#7 | small | low, guard-tested |
| 6 | **GIST-PROPOSER** (pattern miner + reversible index demotion) | abstraction + decay's dividend | moderate | needs the C4 ruling |
| 7 | **Capture Pass** (salience-triggered windowed retro-promotion) | abstraction (event-triggered mode) | moderate | low (inverse tagging deferred) |
| 8 | **The Silence Probe** (two-path read diagnostic) | instrument for all of the above | small | none — read-only |
| 9 | **Outcome-coupled BANK efficacy** (Hebbian ledger, derived-only) | Hebbian strengthening / myelination prerequisite | moderate | low |
| 10 | **Filopodial probe envelopes** (PROBE/RETRACT on watch-contracts) | new-pathway creation | small | clean by design |
| 11 | *(merged into #5)* SALIENCE envelope — adopt only if #7 needs a durable trigger record | — | — | — |
| 12 | **Probation window for new joiners** | growth hygiene | small | needs the C7 ruling |
| 13 | *(fallback subset of #3+#6)* FOLD-SPIKE — the minimal coincidence detector, if the owner prefers the smallest first step | — | — | — |
| 14 | *(folded into #4)* Use-tagged quarantine nominator — its use-evidence-in-.why.md idea survives inside #4 | — | — | — |

Sequencing rule from the judge: **#1 before anything else** (it closes the only live irreversible-loss exposure);
**#2 lands before the first verb-introducing proposal merges** (not before any is read); #5 before #6/#7 (they
presuppose its signal); #9 before any myelination-style precomputation (never compile a route on use-validity alone).

---

## 1. Completed-Handoff Enforcement — ship A-002 as a hard gate

**Biological principle.** Necrosis is not a different plan from apoptosis — it is apoptosis with an unacknowledged
handoff (Nagata 2018, PMID:29400998). The completed, *verified* transfer of contents to the recipient is the only
property separating silent orderly disposal from systemic damage; degradation happens inside the recipient, never in
the open (Kerr 1972, PMID:4561027).

**Why now.** *Wire:* the estate's single irreversible operation has run three times (two batches on 2026-07-30,
135.7 GB; one 0.99 GB test batch on 2026-08-09) and **no backup exists** — Custodian reports `NO BACKUP` on
2026-09-01, and the drive that would have held a Time Machine copy was erased that morning (the brief's "26%" is
unverifiable from the mini). The A-002 door is live and well-guarded on what it checks: a deep-SAFE cross-check
re-hashes every survivor from disk before the single `rmtree`. What it checks is a copy *on the same volume*. By the
estate's own standard — the claims class is protected by a guard *test*, not an intention — the handoff is not a
mechanism until the disposal verb refuses without a custodian confirming envelope. Authorization is not custody: the
owner-gate verifies permission to die and the survivor check verifies a twin in the same body; this verifies that a
phagocyte outside it actually holds the contents.

**The change.** (a) CUSTODIAN grows one query verb, `snapshot-holds?`, taking a batch's content-hash list and
emitting a confirming envelope (snapshot id in refs) only after verifying each hash in a verified restic snapshot.
(b) The kallimachos disposal verb refuses to run without that envelope for the exact batch — the estate's own
confirming-envelope idiom applied to its one irreversible act — and pins the confirming snapshot do-not-prune in the
same act. (c) A ninth guarantee in kallimachos's existing `tests/test_disposal.py` (which already pins the single `rmtree`
and the deep-SAFE refusal) fails if any disposal path skips the custodian envelope — and both repos get a CI runner,
since today neither memory-spine nor kallimachos has one and every guard is a manual per-file run. Optional and separable: a reflexive necrosis rule — content that vanishes *without* a
disposal envelope fires an alarm and auto-quarantines its dangling refs with a .why.md.

**Cost.** Small: one verb, one precondition, one guard test, one restic tag — every pattern already exists.
Per-batch hash verification is minutes at the current cadence (3 batches in the door's first six weeks).

**What could go wrong.** Starvation by design: with backups incomplete or the CUSTODIAN drive unmounted, disposal
blocks indefinitely and quarantine grows — the correct response is a stale-handoff alarm, and the temptation to add
a bypass flag must be refused (a bypass reintroduces exactly the unverified path). Verification must key on
**content hash**, never path+mtime (an older snapshot version would falsely acknowledge the current bytes). Without
the pin, restic retention can prune the snapshot a past disposal cited — an acknowledgment made retroactively false,
a failure mode biology doesn't even have.

**Owns it.** CUSTODIAN (the `snapshot-holds?` verb + pinning); kallimachos `disposal.py` / A-002 (the precondition + the
guard test).

## 2. The Doctrine Gate — a `doctrine` block on verb-introducing proposals, and a per-class verb ledger

**Biological principle.** Mark is separated from execute, the reader is scoped, and the last check sits at the
commitment point (C1q→C3→iC3b read by CR3 alone; CD47/SIRPα aborting the phagocytic cup — Stevens 2007,
PMID:18083105; Lehrman 2018, PMID:30308165). Wang 2020 (PMID:32029629) proves where policy lives: the tag, not the
executor. A system's destructive competence is defined by which reader holds the verb.

**The change.** (a) Proposal-time: any proposal introducing or modifying a verb that disposes, demotes, decays,
re-indexes or rewrites must carry a `doctrine` block answering the eleven adopter rules of the register (which verb;
reversible by what path; where is the manifest; who authorizes, attached to the *selection set* or only the run;
does it touch claims; does it change retrievability and does it *enumerate* what it demoted; is its polarity
default-deny; does it mutate on read; are thresholds re-derived from ETTZ statistics; does every mark carry a why;
does it add a second naming layer). A "no" does not fail the proposal — it routes it to the owner as a *named
law-change request*. (b) Build-time: generalize the existing claims delete-path guard into a table-driven per-class
verb allowlist in CI; adding a verb requires an owner-signed decision envelope ref'ing the doctrine block that
justified it.

**Cost.** Days: one optional envelope object, one register document, one widened test. Runtime ~zero. The real cost
is one owner review step per verb-introducing proposal — the trigger condition must stay narrow or the gate gets
routed around.

**What could go wrong.** Checkbox theatre is the highest-probability failure: a promotion pass that drops episodes
from the fold's index, truthfully reports "nothing deleted", and cannot *enumerate* what it demoted has performed
unrecorded erasure of retrievability with a compliance certificate attached — catching that one case is the gate's
whole job. Name-matching can't see destruction arriving through dependencies (`restic forget --prune`, log rotation,
a git gc) — the sharpest instance being CUSTODIAN's own retention policy pruning the snapshot that answered an
interlock. The gate must be default-deny (an unknown verb in an unknown class fails the build), never an expiring
exemption. And it should ship WITH the named owner-only single-item exception path for the claims class (see
DOCTRINE-CONFLICTS § the two-doctrine inconsistency) — or the first leaked credential in a claim's text gets resolved
by deleting the guard test under time pressure.

**Owns it.** ORGANON (the register as a conformance standard); memory-spine (the widened guard test); CUSTODIAN
(retention-policy coverage). If the owner intends to review every adoption personally at current scale, the honest
minimal version is the eleven-rule register as a document he reads before ruling.

## 3. RIPPLE-PASS — nightly bounded replay that drafts candidate claims

**Biological principle.** Active systems consolidation: the fast store's episodes are re-presented offline in
bounded, content-bearing packets, interleaved across contexts, so the slow store accumulates small updates whose
product is new abstracted structure (McClelland 1995, PMID:7624455; replay is causally necessary — Girardeau 2009,
PMID:19749750; its payload is non-substitutable — Fernández-Ruiz 2019, PMID:31197012; its measured output is
generalization — Durrant 2011, PMID:21335017). Selection is cue-addressable: the slow store queries the fast one
(Rothschild 2017, PMID:27941790; TMR — Rasch 2007, PMID:17347444).

**Why first among capability builds.** It is the first mover on the confirmed sharpest gap — the 71,585-vs-4+12
ratio finally moves — and the substrate is unusually ready: flow refs are already the ordered replay payload, claims'
trials are already the slow-store weight format, the ignorance graph is already both cue source and review inbox.

**The change.** One replay stage in memory-nightly, upstream of the render fold: nightly, sample a bounded batch of
**complete flow-ref threads** (whole ordered journeys — never synthetic summaries; shape without payload buys
nothing), preferring threads whose subject or `why` matches an open ignorance-graph question or desideratum, plus an
uncued random fraction. Mine for predicates that hold across ≥N independent replays spanning ≥2 sources (the
interleaving discipline; BINNA's parent-union is the natural interleaving set) and emit each survivor as an
append-only QUESTION envelope proposing a **candidate claim** — a checkable predicate at trials=0, its supporting
envelope hashes as refs — onto the ignorance graph for owner review. Promotion to a live claim remains an owner
decision envelope (a splice). Companion wire, less free than it looked: **M1 write-back** — *wire:* M1 today is a maths bench on generated
fixtures that exercises no claim or procedure, so the write-back needs a bench arm that runs procedures and predicates
first; once it does, +confirm/−fail/~anomalous trials land on the items exercised, giving the estate's one
replay-shaped mechanism real plasticity (today every trial on record was written at seed time).

**Cost.** A batch sampler, a motif miner with two thresholds, a question emitter, the M1 wire — roughly Collector
complexity. Runtime O(selected batch) nightly with a hard emission cap; asymptotically cheaper than the cold fold.

**What could go wrong.** Frontier flooding (spurious co-occurrence candidates burying the owner's real open
questions — the source-spread threshold and nightly cap are load-bearing); self-replay feedback (candidate and trial
envelopes are themselves spine events — the sampler must exclude its own src or motifs self-amplify); the
induced-ripple failure (pointing the miner at fold caches instead of raw ordered threads yields confident candidates
with no evidence); cue-bias narrowing (only-cued replay never abstracts from domains with no questions yet — hence
the random fraction).

**Owns it.** memory-nightly; M1 eval harness owns only the trial write-back.

## 4. The CD47 Exemption — usage renews dwell, and can only ever extend it

**Biological principle.** Use-dependence is carried by an activity-renewed *don't-eat-me veto*, not by the eat-me
tag — CD47-null microglia don't over-eat, they lose activity preference entirely (Lehrman 2018, PMID:30308165).
Being used renews an expiring exemption; being silent lets an exemption lapse. Polarity is the whole content of the
mechanism — and it is the only polarity DOCTRINE-CONFLICTS C7 declares lawful.

**The change.** One predicate in entropy's dwell evaluator plus one envelope kind. Before nominating a file, entropy
consults a nightly-materialized, content-hash-keyed touch index (*wire:* the bank has no balance derivation yet, so
this index would be the first fold over `used:` / `choice:` refs — build it as the bank's tick, not beside it). If any source *other than* kallimachos itself, CUSTODIAN/restic, or GRAPHIFY rendering referenced the
item within the dwell window, entropy emits an EXEMPTION envelope (why = the specific touches) and extends the clock
by one bounded increment. **Monotone-conservative by construction**: it never shortens a clock and never nominates
anything today's rule wouldn't — a guard test asserts it. Cumulative extension is capped (no immortality by noise);
on cap, the item proceeds normally with its exemption history attached to the .why.md (absorbing proposal #14's one
good idea: use-evidence in the manifest). **Tested exclusions**: procedures/ (no clock, by doctrine — and no rival
contends for a procedure's slot, so the comparator is undefined), claims/ (windows close; query rate anti-correlates
with value), the why-ledger, events/.

**Cost.** Roughly one focused session: a touch-index re-projection on the existing fold-cache discipline, one schema
addition, one predicate, three guard tests (monotonicity, exclusions, self-source exclusion).

**What could go wrong.** Self-touch contamination is the concrete killer: kallimachos's own scan envelopes count as
touches → everything permanently exempt → disposal stops silently while logs look healthy (the src exclusion list is
safety-critical and must be *tested*). Same class: backup-touch contamination (restic reads everything) and
GRAPHIFY's render loop (renders → touches → exempts → stays in graph — no denominator; threshold must be relative to
the batch's touch distribution). Cold-archive throughput leak: a meme touched weekly outlives a never-touched tax
PDF — the extension cap is the only bound. Key on content hash only, never path/subject strings (renames must not
reset clocks). And one M1 assertion must prove the veto actually actuates — a built-but-unconsulted view is a
comforting story.

**Owns it.** kallimachos/entropy A-003; the bank and memory-nightly are read-only dependencies; M1 owns the replay
assertion. **The exclusion list is the part that needs the owner's ruling before any code exists.**

## 5. The Salience layer — prediction-error/novelty gain for the fold, ordering-only

**Biological principle.** Salience is a broadcast commit-authorization signal *separate from content*: dopamine
prediction-error (fire on the unexpected, silence on the expected — Schultz 1997, PMID:9054347), locus-coeruleus
novelty converting ordinary memories into persistent ones (Takeuchi 2016, PMID:27602521), the D1/D5 gate on the
consolidation broadcast, and mismatch — not retrieval — opening records for update (Sevenster 2013, PMID:23413355).
Every promotion mechanism above presupposes this input; today nothing computes it — the gate with no upstream.

**The change (unifying three analyst specs into one).** A fold-time **derived** salience score per envelope —
computed, never stored in the envelope: +salience when an event contradicts or anomalously matches an open claim's
predicate (prediction error); +salience when it coincides with abnormal beat statistics from its source (disturbance
context); +salience when a later owner decision/CHOICE/chat envelope refs it (attention). memory-nightly consumes it
for **ordering only**: high-salience events fold first and populate the ranked candidate queue on the ignorance
graph. Normalized per-source per-window; the "salient" bar slides with recent salience rate (BCM) from day one.
Launch in shadow mode (log scores, actuate nothing) until precision is measured against owner verdicts. If proposal
#7 later needs a durable trigger record, mint the reverse-gap SALIENCE envelope as the persistence variant of this
same signal — one vocabulary, never three.

**What could go wrong.** The polarity inversion is the whole safety case: in biology, no salience means *no storage
at all* — imported literally that is algorithmic disposal. ETTZ must invert it — salience orders attention, never
gates retention — enforced by a guard test making salience provably unreachable from entropy/quarantine code paths.
Self-excitation (salient events spawn refs that raise their salience) requires the normalization; with 4 seeded
claims the prediction-error source is nearly mute and novelty over-fires, hence shadow mode.

**Owns it.** memory-nightly (scoring + consumption), reading beat stats from the mesh and predicates from claims/.

## 6. GIST-PROPOSER — the pattern miner that collects forgetting's dividend

**Biological principle.** Generalization is the residue of removing episode-specific detail from the active index
(Migues 2016, PMID:27013677; transience = regularization — Richards & Frankland 2017, PMID:28641107) — but natural
forgetting is an *accessibility switch on a surviving trace* (Ryan & Frankland 2022, PMID:35027710), and sleep's
downscaling is rank-preserving multiplicative demotion with a sparing predicate (de Vivo 2017, PMID:28154076). So
the dividend is collectible without erasure.

**The change.** In memory-nightly: (1) MINE a bounded incremental batch (cursor-based, O(new), tonic streams
excluded) for motifs recurring ≥N times across ≥K independent sources; (2) DRAFT a question envelope per survivor —
candidate claim at trials=0 or candidate procedure cued by the recurring situation, constituent hashes as refs;
(3) on the owner's confirming decision envelope, mark constituents `folded-into:<claim-id>` and demote their
salience rank in the fold/GRAPHIFY index — **a reversible index operation enumerating exactly what it demoted**;
files, hashes, why-ledger untouched, `--asof` reaches everything. This is the C4-compliant shape: abstraction paid
for in retrievability, never in bytes, with the demotion itself a first-class record.

**Relation to #3.** RIPPLE-PASS and GIST-PROPOSER are phase one and phase two of the *same* loop (the judge's
contradiction ruling: four analyst proposals compete for one mechanism slot — build one merged loop, not four
organs). #3 is the draft-only core; #6 adds the demotion dividend once the owner rules on C4. FOLD-SPIKE (#13) is
the minimal fallback if he prefers the smallest possible first step: coincidence-detection questions only.

**What could go wrong.** Junk-candidate flood (beats and n8n confirmations are the most recurrent motifs in any
71k corpus — the tonic exclusion and K-sources threshold are load-bearing); the false-gist trap (a wrongly-confirmed
claim plus demoted constituents makes the detail needed to falsify it hard to find — reversibility must be *tested*);
frequency-as-salience drift (without #5, the miner ranks by count; acceptable in v1 only because the owner's verdict
is the salience gate); review-bandwidth pricing (every candidate costs owner attention — precision is the product).
And the estate is also an archive: fidelity is terminal, not instrumental — demotion stays index-rank forever.

**Owns it.** memory-nightly; BINNA/owner downstream as the review gate; GRAPHIFY consumes the rank field.

## 7. Capture Pass — salience-triggered retroactive promotion (the event-triggered mode)

**Biological principle.** Synaptic tagging and capture: persistence = AND(cheap decaying local tag, salience-gated
broadcast) inside overlapping windows, order-independent — a later important event retroactively consolidates nearby
weak ones (Frey & Morris 1997/1998, PMID:9020359/9704995); novelty rescues weak memories, familiarity does not
(Moncada & Viola 2007, PMID:17626208). Biology also consolidates opportunistically between episodes, not only in a
batch window (awake replay — Jadhav 2012, PMID:22555434): nightly cadence alone is too coarse for a 1–2 h window.

**The change.** When a sparse, enumerated salience event fires (#5's classes), scan ±2 h **on event timestamps**
(the Collector delivers remote envelopes late) keeping only envelopes sharing a flow ref or subject with the trigger
(locality — the branch-compartment rule, Govindarajan 2011, PMID:21220104); append `capture` envelopes linking
trigger to captured; the next fold renders promotion candidates from them. Auto-minting of claims is excluded;
inverse tagging (demoting non-captured siblings) is **deferred entirely** — it changes what enters the disposal
pipeline and needs its own owner ruling.

**What could go wrong.** Salience inflation (a flapping heartbeat mints hundreds of error envelopes → hundreds of
overlapping scans → thousands of junk captures — rate-limit and normalize); false association by co-windowing
(12 interleaved sources make bare temporal proximity weak evidence — the shared-ref/subject condition is mandatory);
adopt after #5 exists.

**Owns it.** memory-nightly (semantics), n8n (the WHEN), spine (the envelope kind).

## 8. The Silence Probe — measure stored-but-unreachable before building retrieval

**Biological principle.** The silent engram: a memory can be fully stored yet unreachable by natural cues, and the
only way to distinguish silent from gone is to run the direct path and the cue path against the same item and
compare (Ryan 2015, PMID:26023136; the partial-cue phenotype — Nakazawa 2002, PMID:12040087).

**The change.** A read-only nightly probe over a rotating sample (claims and procedures exhaustively — there are 4
and 12; events sampled): attempt each item by direct path (content hash / flow ref / address) and by cue path
(subject, refs traversal, predicate lookup, `<situation>` cue) using degraded or, preferably, real historical cues;
publish "the estate holds N items it cannot reach from any cue it would plausibly be asked with" as first-class
ignorance-graph questions. Report counts and names, never percentages (4 claims cannot yield a rate). Repair remains
an O-8 splice under owner authorization — the probe observes, it never re-ingests (a re-ingest in a content-hash
store creates a *second* record of the same fact: the exact identity-join problem O-8 exists for).

**Why it ranks here.** It is the instrument: every larger engram import — completion index, ensemble id, graded
recall — is a bet on the size of a gap nobody has measured. Instrument before surgery; and it is the least
doctrinally exposed proposal in the docket.

**Owns it.** M1 eval harness (it *is* an eval), scheduled on memory-nightly's tail with a hard self-truncating
duration budget; the ignorance graph is the publication surface.

## 9. Outcome-coupled BANK efficacy — the Hebbian ledger, derived-only

**Biological principle.** Strengthen only on use-AND-outcome within a seconds-scale eligibility window on the same
flow ref (the NMDA AND-gate — Nowak 1984, PMID:6320006; window per behavioral-timescale plasticity — Bittner 2017,
PMID:28883072, not STDP milliseconds); depress considered-but-bypassed and error-flow items (Bi & Poo 1998,
PMID:9852584 — weakening as graded withdrawal, never destruction); **renormalize multiplicatively** so ratios
survive and total gain is bounded (Turrigiano 1998, PMID:9495341 — non-severable: pure Hebbian rules are unstable by
construction).

**The change.** (*Wire:* the bank holds no usage balances today — this proposal defines the first ones, so nothing
has to be migrated or unwound.) One derived, recomputable `efficacy` score per bank item, computed at fold time: credit when a
usage/CHOICE envelope shares a flow ref with a confirming envelope in-window; debit on bypassed-CHOICE and same-flow
errors; nightly multiplicative renormalization to a fixed sum. Actuation in v1 is the cheapest form only: retrieval/
suggestion **ranking** — no cache admission, no precompute. Efficacy is a state.json-style render: a full refold
must reproduce it bit-for-bit (the append-only guard). Prerequisite: land the CHOICE-envelope spec (the depress
branch cannot exist without it).

**Why it gates myelination.** The conductor pattern — proven pathways get cheaper (precomputed folds, warmed
caches, materialized routes) — is the right import of adaptive myelination (route-level credit on a two-key commit:
global trials AND local flow-ref tag — Gibson 2014, PMID:24727982; Wake 2011, PMID:21817014). But myelin entrenches
and suppresses rewiring (NgR1 closes critical periods — McGee 2005, PMID:16195464), carries standing maintenance
cost (Harris & Attwell 2012, PMID:22219296), and is explicitly NOT an answer to the abstraction gap: compiled
without a generalizer, the estate gets faster at exactly what it already over-uses. **No route gets compiled until
its strength is outcome-valid rather than use-valid, and every compiled route keeps a first-class retraction path.**

**What could go wrong.** Credit misassignment to bystanders (the two-key gate — same flow ref AND in-window — is
the mitigation); rank→choice→rank feedback lock-in (renormalization + a BCM rising bar ship in v1 or the feature is
unstable by construction); a narrow-context item outranking a better general one (the prediction-error follow-on);
and this must not be sold as progress on the abstraction gap — it is anti-generalization by nature and ships paired
with #3/#6.

**Owns it.** The bank (score + ranking); memory-nightly (fold-time computation).

## 10. Filopodial probe envelopes — PROBE/RETRACT on watch-contracts

**Biological principle.** Exploration is cheap, time-boxed, majority-fail probing beyond current contacts, sourced
by a want-gradient, stabilized only on a confirming handshake with a quorum, retracted by default — and retraction
is recycling, not destruction (Ziv & Smith 1996, PMID:8755481; Lohmann & Bonhoeffer 2008, PMID:18667153; quorum —
Lee 2012, PMID:22457515; self-avoidance — Lefebvre 2012, PMID:22842903).

**The change.** One envelope subtype and one keeper behavior, no new organ. A `probe` envelope: minted id, why
citing the desideratum/ignorance-graph node that motivated it (the gradient source), a target beyond current mesh
membership or link topology, a TTL (~7 days — estate-timescale filopodium), budgeted per-want with a *decaying*
budget for wants whose probes keep expiring (the mandatory gain control — Rosoff 2004, PMID:15162167). Stabilization:
≥N distinct confirming envelopes on distinct flow refs within TTL promotes the probe into the **existing**
watch-contracts join-proposal path — it never auto-wires. Expiry: the nightly fold collapses an unanswered probe
into one appended choice-envelope ("probed X for want W, no confirmation, retracted, because Z") — retraction as
append, feeding the bank so why-NOT-connected becomes learnable. Dedup guard: a (src, target) matching an existing
contact or unexpired probe is refused at mint. **Probes are restricted to read-only/describe verbs** — a probe that
mutates state is an unauthorized action wearing an exploratory name. Probes are exempt from silence alarms by type
(expected failure must not train the owner to ignore alarms).

**Why mid-table.** It is the only proposal that makes the estate *reach* rather than listen — the owner's
first-named ask — and it is doctrine-clean by design. It ranks tenth because its payoff at 10 sources is speculative
until frontier-cued promotion (#3) proves the want-signal plumbing it would steer by; today the owner is the
estate's growth cone, and the deficit — though permanently invisible to all existing telemetry — is not yet fatal.
One deliberate departure from biology: at 10 sources the candidate space is small, so emission should be
want-ranked, not uniform-random — stochasticity earns its keep only at biological parallelism.

**Owns it.** BINNA keepers/watch-contracts (emission, quorum, dedup — *wire:* the verb exists and has never been
ticked; wiring its cadence into the fabric is a precondition, not part of this proposal); memory-nightly (expiry sweep); explicitly NOT
kallimachos (probe expiry is an append, not a disposal — no quarantine, no custodian interlock).

## 12. Probation window for new joiners — use-gated graduation, quarantine-not-death

**Biological principle.** Retention of a new unit requires evidence of correlated use inside a fixed post-birth
window (Tashiro 2006, PMID:16906136); integration is staged listen-first (Ge 2006, PMID:16341203); the newest
cohort gets transient elevated scrutiny (Ge 2007, PMID:17521569); graduation requires a verified round trip on live
routes (Toni 2008, PMID:18622400). Executor substituted per doctrine: quarantine and owner verdict, never Bax.

**The change.** On registry drop: a birth envelope stamps the source PROBATIONARY with a 30-day clock (entropy's
clock pattern reused); an ignorance-graph question is minted ("is <source> carrying real traffic?" — the critical
period); participant→organ promotion requires one trigger-fabric loop closed by a confirming envelope arriving via a
**tenured** organ's flow ref (correlated-use, not self-emitted volume — and tenured-only confirmation defeats
colluding-pair Goodharting); verb doors stay closed until listen-only has produced clean beats + collected outbox
envelopes. At expiry with no evidence: watch-contracts emits a proposed-leave QUESTION with a .why.md — registration
quarantined pending the owner's verdict, never deleted, every envelope the source ever emitted staying in the spine
forever. Contracts gain an optional expected-duty-cycle field so rare-fire organs get a matching clock.

**Needs a ruling first.** Its expiry action makes absence-of-use generate a leave *proposal* — the polarity
DOCTRINE-CONFLICTS C7 forbids in general. The biologically-principled exception (biology itself distinguishes the
plastic newest cohort from annealed tenured units) is exactly the kind of named, owner-ruled exception C0 requires —
adopt only after he rules on it. The probationary/tenured boundary must be hard-coded: this clock applied to
tenured organs or procedures would directly violate the no-clock law.

**Owns it.** BINNA keepers/watch-contracts, reusing entropy's dwell-clock and manifest patterns.

---

## What was deliberately left out

- **Inverse tagging** (weakening non-participants on every commit — Okuno 2012, PMID:22579289): biology's version
  is demotion-not-destruction, so a mapped form is doctrine-compatible in principle, but it changes what enters the
  disposal pipeline and pushes routine healthy traffic toward review on every nearby anomaly. Separate ruling,
  separate proposal, not smuggled into #7.
- **Reconsolidation's labile rewrite** (Nader 2000): incompatible with append-only at the root; the safe
  prediction-error form is already live in claims. Resist any proposal that "adds reconsolidation".
- **An autonomous disposal path** and **anonymizing digestion** (dedup/compress that destroys identity): dead on
  arrival under owner law, stated in every relevant analyst report.
- **A completion/similarity index**: premature until the Silence Probe (#8) sizes the gap; when built, it must be
  a declared-disposable derived cache keyed by content hash, never a second system of record (embedding keys drift —
  Ziv 2013, PMID:23396101 — and rebuildability is what keeps drift from being data loss).

## Rulings the owner must make before any of this builds

1. **C4 — is retrievability covered by "never erase"?** The analysts' reading: yes — so index demotion is lawful
   only when recorded, enumerable and reversible (#6 is written to that standard; the Doctrine Gate exists to catch
   the unenumerated kind).
2. **C7 — may absence-of-use ever generate a disposal/leave proposal?** Default: no (use may only veto). The one
   requested exception: probationary new joiners (#12).
3. **The CD47 exclusion list (#4)** — confirm procedures/, claims/, why-ledger, events/ as tested exclusions, and
   rule on whether use may inform file-domain disposal at all.
4. **The claims-class exception path** — a named, owner-only, single-item remedy for secrets/personal data reaching
   a claim's text (see DOCTRINE-CONFLICTS § the two-doctrine inconsistency), so the first real incident is not
   resolved by deleting the guard test.
5. **Approximate matching** — exact-only retrieval may be doctrine or accident; the promotion path (#3/#6/#7)
   cannot detect "the same pattern" without *some* similarity computation. Rule: is approximate matching permitted
   in the promotion path while retrieval stays exact?
6. **Salience vocabulary (#5)** — one signal, one spec: derived score first, durable envelope only if #7 needs it.
