# DOCTRINE-CONFLICTS — where biology and ETTZ deliberately disagree

**Status: FOR OWNER REVIEW. Nothing builds from this until he rules.**

Deliverable 3 of 3 — companion to [NEURO-MAPPING.md](./NEURO-MAPPING.md) and [ADOPTABLE.md](./ADOPTABLE.md).

Purpose, in the owner's terms: name every point where biology and ETTZ disagree **on purpose**, so that adopting any
biological principle never silently overrides owner law. Biology's disposal and abstraction primitives all terminate
in an irreversible, unpermissioned, unlogged destruction or in-place-rewrite verb; the estate is defined by its
refusal of that verb. The failure mode this register exists to prevent is not adoption — it is *silent override*:
a correct, well-cited biological mechanism whose destructive half rides in welded to the half worth having.

**The meta-rule (C0).** This register is a checklist for proposals, not a veto on capability. A proposal that
conflicts with a law is not rejected — it is escalated to the owner as a *named law-change request* with the conflict
stated in these terms.

Each conflict below: biology's law / ETTZ's law / why the owner's law is the way it is / what each side buys /
**the adopter rule**.

---

## C1. Erasure vs windows-never-graves

**Biology:** traces are physically removed. Rac1/cofilin depolymerises the actin holding a spine, orthogonal to the
write path — retention is write-strength minus a continuously running deletion pressure (Shuai 2010, PMID:20178749;
Davis & Zhong 2017, PMID:28772119). Syt3 reads Ca²⁺ and internalises GluA2; knockouts learn normally but *do not
forget* (Awasthi 2019, PMID:30545844) — decay is an executed removal call, not a TTL.
**ETTZ:** a contradicted belief has its validity window closed; the superseded claim IS the record of how
understanding changed; no delete path exists in the class and a guard test fails if one appears.
**Why:** auditability of belief change. A closed window plus a why-ledger entry answers "what did the estate think on
2026-08-03 and what changed its mind" — a question an erased trace can never answer, and the question the owner is
actually building for.
**Buys:** biology buys a bounded substrate and the ability to be wrong cheaply. ETTZ buys `--asof`, non-repudiation,
and auditable reasoning drift; it pays in monotonic growth and the cold fold (a full-log pass measured 15–31 s over
71,585 entries on 2026-09-01 — NEURO-MAPPING § Verified on the wire).
**Adopter rule:** you may import the decay *signal* and the decay *schedule* — a rate, a threshold, an always-on
pressure — but never the removal verb. Every imported decay lands as a state transition on a retained record (window
closed, status demoted, rank lowered) plus a why-ledger entry naming the pressure. If a proposal cannot state what
the record looks like *after* the decay fires, it has imported the verb.

## C2. Microglial destruction vs quarantine

**Biology:** engulfment is unrecoverable; the ingesting cell digests the material (Kerr 1972, PMID:4561027; Nagata
2018, PMID:29400998). The pathway is *redundant* with no guard anywhere — CR3/C3 nulls retain ~50% of engulfment —
and its errors are permanent into adulthood (Schafer 2012, PMID:22632727).
**ETTZ:** nothing is deleted directly; suspect material moves to a _Quarantine batch with a .why.md manifest; owner
authorization gates disposal. Reversible by construction, documented by construction.
**Why:** reversibility under uncertainty. Quarantine is a bet that the classifier is fallible; the manifest is how a
wrong classification is found and undone later by someone not present at the decision.
**Buys:** biology buys immediate volume and metabolic budget. ETTZ buys recourse — and pays with a second estate
(quarantine) that itself accumulates, and with the fact that quarantined material remains *readable*: quarantine is
not a containment primitive for anything that must actually stop being readable.
**Adopter rule:** import the tagging half in full — item-local marks, upstream self-declared weakness signals,
plural context-specific tag families, a single scoped reader — the executor is always quarantine-with-manifest,
never digestion. Wang 2020 (PMID:32029629) licenses this: the decision point is the tag, not the phagocyte, so
nothing computational is lost in the swap. The .why.md must name the tag and its threshold, not just the batch.

## C3. Autonomous pruning vs owner-gated disposal

**Biology:** no cell asks permission; ~10¹⁰–10¹¹ cells are cleared daily with no operator (Nagata 2018). What
checking exists is a local, expiring, *act-site* brake: CD47/SIRPα aborts the phagocytic cup at the moment of
commitment (Lehrman 2018, PMID:30308165) — and competence is time-boxed rather than permissioned, with the
unwindowed case being documented pathology (Hong 2016, PMID:27033548).
**ETTZ:** owner authorization gates disposal, by law. Three batches through the A-002 door in its first six weeks
(two owner clicks on 2026-07-30, one on 2026-08-09); entropy's clocks have killed nothing.
**Why:** accountability. Disposal is the one operation with no undo, so it sits with the only party who can be
accountable for it. Hidden inside the disagreement is a structural *agreement*: both systems put the last check at
the commitment point, not the plan — A-002 and CD47/SIRPα occupy the same socket.
**Buys:** biology buys throughput. ETTZ buys accountability and pays with a human bottleneck whose failure mode is
an unreviewed backlog, not data loss.
**Adopter rule:** autonomy is granted per-verb by reversibility, never per-agent. An automated agent may PROPOSE,
TAG, and execute reversible acts (quarantine, demotion, de-caching, rank change); it may never execute an
irreversible one — and the owner's authorization must attach to the **selection set**, not merely the run.
Authorizing a batch is not authorizing whatever a surveyor put in it. Make the custodian handoff mandatory inside the live A-002 door (the act-site
veto), and time-box any granted disposal competence — expiring and renewable, never ambient.

## C4. Forgetting-to-generalise vs total recall — the sharpest edge in the register

**Biology:** abstraction is causally the residue of deletion — blocking AMPAR removal preserves specific memories
AND abolishes generalization (Migues 2016, PMID:27013677); transience is regularization (Richards & Frankland 2017,
PMID:28641107); even adding storage is destructive (neurogenesis-induced forgetting scales with insertion rate —
Akers 2014, PMID:24812394).
**ETTZ:** every envelope kept forever; the fold recomputes rather than compacts; nothing promotes episodes into
claims or procedures at all.
**Why:** the why-ledger. Generalisation-by-deletion destroys the evidence *for* the generalisation; the estate's
whole value proposition is that a belief can be walked back to the episodes that produced it.
**Buys:** biology buys cheap abstraction and bounded storage. ETTZ buys provenance and pays by having to build an
abstraction mechanism it does not yet have.
**The legal route exists and is stated here as doctrine so no implementer discovers it alone:** natural forgetting
is predominantly a reversible accessible→inaccessible switch (Ryan & Frankland 2022, PMID:35027710); identity lives
in connectivity while weights govern only addressability (Ryan 2015, PMID:26023136); a compact index can age
independently of bulk content (Teyler & Rudy 2007, PMID:17696170). So ETTZ may demote *retrievability* while keeping
*content*.
**Adopter rule:** abstraction may be paid for in retrievability, never in bytes — and the demotion must itself be a
first-class record. A promotion that folds N episodes into a claim must emit (a) the claim, (b) **the explicit list
of demoted episode ids**, (c) the why, and (d) a reversal path. An index demotion that does not enumerate what it
demoted is erasure with extra steps and must fail the doctrine check even though no delete verb appears in it. This
is the sharpest place a biological principle can silently override owner law — an implementer chasing the cold-fold
problem can drop episodes from the render index, keep every byte, truthfully report "nothing was deleted", and have
performed an unauditable erasure of access.

## C5. Distributed pattern vs addressable record — *downgraded: hazard, not doctrine*

**Biology:** there is no record and no address; content IS the pattern, recall is completion from partial cues
(Nakazawa 2002, PMID:12040087), the address is (cell set × input pathway) (Abdou 2018, PMID:29903972), and no unit
holds the memory (Roy 2022, PMID:35379803).
**ETTZ:** content-hash ids, one record per event, exact addressing.
**Why:** an auditor must be able to name the thing — "the estate believed X" has to resolve to a citable record, or
the why-ledger is rhetoric.
**Downgrade:** biology has no addressing because it has no addresses — closer to an inevitability of substrate than
a decision; do not cite this entry to reject a proposal.
**Adopter rule (kept):** similarity/pattern-completion retrieval may be added as an *additional* read path, but
every result must resolve to a content-hash-addressed record with a why; expose the two-path read (cue-driven and
id-addressed) so stored-but-unreachable is distinguishable from absent.

## C6. Use-it-or-lose-it vs no-clock procedures — *downgraded: a choice between two biological families*

**Biology is split, and the split is the point:** the intrinsic-decay family says disuse kills (tonic
dopamine→Rac1, running regardless of use — Berry 2012, PMID:22578504); the depression family says the opposite —
LTD requires *activity*, 900 low-frequency pulses, not silence (Dudek & Bear 1992, PMID:1350090), and weakening is
graded withdrawal with the structure intact.
**ETTZ:** a procedure never decays from disuse, only from failing when tried.
**Why:** a procedure's truth is a property of the world, not of attention. An unused backup-restore procedure is not
less true for being unused; a clock would punish exactly the rare, high-stakes knowledge the estate exists to hold.
**Downgrade:** ETTZ's rule has a biological warrant (the LTD family) — defend it on that ground, not as a
divergence.
**The honest cost, named:** unearned confidence. A procedure last verified in July carries the same "verified" as
one that worked yesterday, and the estate cannot tell them apart. That belongs in the ignorance graph
(last-verified-at surfaced as staleness questions), never in a decay clock. Confidence may be *reported* as
unearned; status may only change on a trial outcome.

## C7. Default-permit-with-expiring-veto vs default-deny-with-affirmative-authorization

**Biology:** deletion is the default, blocked by an active, expiring exemption — CD47-null microglia don't merely
over-eat, they lose activity preference *entirely* (Lehrman 2018): use-dependence is carried by the brake. Being
used renews an exemption; being silent lets it lapse.
**ETTZ:** disposal is default-denied; the guard test enforces the denial in code; authorization is an affirmative
act.
**Why:** this polarity is what makes the estate safe to leave unattended. Under biology's polarity, a broken
usage-metrics pipeline queues the whole estate for disposal; under ETTZ's, a broken pipeline queues nothing. Silence
is a *fault signal* in ETTZ ("silence is the one thing a heartbeat may never produce"); in biology silence is
*evidence for disposal*. These cannot both be true in one system.
**Adopter rule:** the polarity is not importable under any framing. Usage/recency may act as a veto that
*suppresses* a disposal proposal; absence of that signal must never by itself *generate* one. Any rule of the form
"if not used for N, then queue for disposal" is dead on arrival; the legal form is "if proposed for disposal, then
recent use blocks the proposal." (The one requested exception — probationary new joiners, where biology itself
distinguishes the plastic newest cohort from annealed tenured units — is escalated as a named C0 law-change request
in ADOPTABLE #12, not assumed.)

## C8. Reconsolidation (read mutates) vs append-only splice — the newest and least-guarded conflict

**Biology:** a successful retrieval destabilises the stored item, which must be re-committed to persist; blocking
protein synthesis inside that window erases the memory (Nader 2000, PMID:10963596). Prediction error gates it —
a read that confirms leaves the record alone; a read that contradicts opens it (Sevenster 2013, PMID:23413355).
Retrieval is also a write on *neighbours*, suppressing strong competitors specifically (Anderson 1994,
PMID:7931095).
**ETTZ:** reads are idempotent; the estate is append-only at its core; a repair is a splice.
**Why:** content-hash ids are only meaningful if the content behind them never changes; in-place update destroys the
id contract and every ref that points at the record.
**Buys:** biology buys update-on-access and a principled edit point. ETTZ buys immutability and referential
integrity — and *already implements the safe form*: a failing trial closes the window and a successor claim carries
the new belief. The estate is ahead of a naive biological port here; resist proposals that "add reconsolidation."
**Adopter rule:** import the prediction-error GATE, never the labile rewrite. Confirm → untouched; contradict →
question envelope; resolved → decision envelope closing the old window and opening a successor. No retrieval may
mutate the record it returned, and retrieval-induced suppression of competitors may only touch a separate, recorded
ranking layer — never a competitor's stored content. The two halves arrive welded together in the literature; this
rule is the saw.

## C9. Sparse, competitive, thresholded write vs total capture

**Biology:** the substrate never writes everything — allocation is winner-take-most on relative excitability
(Yiu 2014, PMID:25102562), sparsity is enforced by lateral inhibition (~2–5% of dentate granule cells), tags latch
only inside open windows (Reijmers 2007, PMID:17761885).
**ETTZ:** every event, action, decision and observation is one envelope with a mandatory why — 71,585 on 2026-09-01 and rising.
**Why:** an audit trail with a sampling threshold is not an audit trail.
**Buys:** biology buys capacity protection and a built-in salience judgement. ETTZ buys completeness and pays the
whole bill at fold time — the cold fold is the cost of refusing sparsity at capture.
**Adopter rule:** no biological threshold, sparsity fraction or window length transfers numerically — all were
tuned against a scarce substrate ETTZ does not have. Every imported threshold must be re-derived from ETTZ's own
envelope statistics and recorded as a metaplastic parameter in the why-ledger (an auditable threshold-change
judgment — Abraham & Bear 1996, PMID:8658594). Sparsity may be applied only at the index/ranking/attention layer.
**Capture stays total.**

## C10. Instruction-free tags and a dumb executor vs a why on every mark

**Biology:** the opsonin iC3b says only "flagged" and carries no reason; policy lives entirely in the labelling and
the destroyer is dumb (Wang 2020); tag families are plural and context-specific (Gunner 2019, PMID:31209379).
**ETTZ:** every judgment carries its reason, never deleted.
**Why:** this is the one place ETTZ is strictly *richer* than biology, stated as a positive requirement so that
importing the elegant mark/execute separation does not import the reasonlessness with it.
**Buys:** biology buys a tiny, fast, composable mark. ETTZ buys a mark that can be argued with six months later.
**Adopter rule:** every mark an imported mechanism writes must carry a why, a timestamp, an author organ and its
threshold — even where biology's equivalent carries none. A bare boolean flag on an item is a doctrine violation
regardless of how faithful it is to the opsonin it models.

## C11. Representational drift vs frozen vocabulary

**Biology:** the code moves under the function — the neurons representing a place turn over across days while
behaviour is stable (Ziv 2013, PMID:23396101); stored keys go stale relative to the encoder by construction.
**ETTZ:** frozen four-layer vocabulary, content-hash ids.
**Why:** a graph you can still read in two years; drift is what makes long-horizon audit impossible.
**Buys:** biology buys continuous re-encoding without migration. ETTZ buys stable keys — and pays by having no
mechanism for the *meaning* of a frozen term shifting: if "verified" comes to mean something else operationally, no
id changes and nothing flags it.
**Adopter rule:** imported mechanisms may not introduce a second, mutable naming layer. Learned/embedded keys are a
derived cache keyed by content hash, rebuildable and never authoritative. Semantic drift in a frozen term is raised
as an ignorance-graph question, not absorbed silently.

---

## Where biology and ETTZ already agree

Recorded so the register reads as a test, not a defence:

- **Non-destruction is biology's default too.** Natural forgetting is a reversible accessibility switch (Ryan &
  Frankland 2022); the silent engram keeps connectivity intact under amnesia (Ryan 2015); extinction is a competing
  context-keyed record with the old one surviving — renewal, spontaneous recovery, reinstatement (Bouton 2004,
  PMID:15466298); LTD recycles rather than destroys. Close-the-window-never-delete is the biological default with a
  manifest attached. True erasure requires destroying the units (Han 2009, PMID:19286560) — and ETTZ has the one
  artifact biology entirely lacks: a test that fails the build if a delete path appears. Biology's redundant
  delete paths with no guard, and their permanent errors, are the *argument for* the owner's law, quoted back to him
  as such.
- **Mandatory acknowledged handoff.** Apoptosis without completed engulfment collapses into secondary necrosis and
  inflammation (Nagata 2018) — the literature-grade case that the custodian handoff must be a mandatory
  precondition of the live A-002 door, not a plan (ADOPTABLE #1).
- **Compartment-scoped demolition.** Caspase-3 runs sub-lethally in dendrites for LTD, bounded by explicit inhibitor
  thresholds, and the cell survives (Li 2010, PMID:20510932) — the precedent for owner-authorization gates as
  blast-radius bounds.
- **The act-site veto.** CD47/SIRPα and A-002 occupy the same socket: the last check at the commitment point (C3).
- **Silence as the failure signal.** Axon survival is a lease renewed by continuous delivery; cessation — not an
  error message — arms the executioner (NMNAT2/SARM1, Coleman & Hoke 2020, PMID:32152523). The BEATS law, as
  biochemistry.
- **Prediction-error-gated update.** Claims' close-on-contradiction is Sevenster 2013's safe reconsolidation,
  already shipped (C8).

## An internal inconsistency the owner should rule on

Files can be disposed of under owner authorization (the owner has put three batches through the A-002 door;
entropy itself has never disposed of anything). Claims cannot be disposed of at
all, ever, by construction. So the estate has **two incompatible disposal doctrines**, and the boundary between them
is decided by *ingestion routing*, not by policy. If a secret, a credential, or third-party personal data reaches a
claim's text or a why-ledger entry, the doctrine currently has **no remedy**: quarantine is not containment
(quarantined material remains readable), and there is no destruction verb in the class. This is not an argument to
weaken the law. It is an argument that the law needs a **named, owner-only, single-item exception path with its own
manifest** — so the exception is exercised deliberately, rather than by someone quietly adding a delete method and
deleting the guard test with it, under time pressure, out of hours, from a legitimate need.

## The five ways adoption silently overrides law — watch for these in every proposal

1. **The index-demotion loophole (C4).** Bytes kept, access erased, compliance certificate attached. The tell: a
   demotion that cannot enumerate what it demoted.
2. **Polarity inversion (C7).** The most attractive result in the pruning literature — usage renews an exemption —
   imported with its polarity intact makes silence evidence for disposal. Read every use-dependence proposal for
   polarity before reading it for merit.
3. **Authorization attached to the run, not the selection set (C3).** Automate the labelling, let the owner
   authorize only execution, and owner-gated disposal has been formally preserved and substantively abolished. This
   is the likeliest way the law gets overridden without anyone noticing they did it.
4. **Welded pairs (C8, C2).** Prediction-error gate + labile rewrite; tagging architecture + destruction executor.
   The literature ships them fused; every import must state which half it took and prove the other stayed behind.
5. **Numeric transplants (C9).** A 3-hour tag decay, a 2–5% sparsity, a 30-day window from a paper — every
   biological constant was tuned against a scarce substrate. Imported numbers are unrecorded judgments; re-derive
   from estate statistics and log the threshold as a why-ledger judgment.

## Evidence hygiene

Nothing in this register rests on: PKMζ maintenance (contested — Volk 2013, PMID:23283174), Drescher 1995's
misattributed relative-threshold claim (use Reber 2004, PMID:15483613 / Cheng & Flanagan 1995, PMID:7634327), the
uncited Ramirez 2013 / Zhou 2009 results, the contested astrocytic D-serine gate, or Weinhard 2018's null-result
two-pathway separation (used only for the corroborated filopodia-induction observation). See
NEURO-MAPPING.md § Citation integrity.

## Rulings requested

The consolidated list is at the end of [ADOPTABLE.md](./ADOPTABLE.md): C4 (is retrievability covered by "never
erase"?), C7 (may absence-of-use ever generate a proposal — and the probation exception), the CD47 exclusion list,
the claims-class exception path, approximate matching in the promotion path, and the single salience vocabulary.
