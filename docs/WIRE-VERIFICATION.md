# WIRE-VERIFICATION — the ETTZ column, re-established on the estate

**Host:** Mac mini (100.90.97.7) · **Session:** local Claude Code session, 2026-09-01 ~19:30–20:15 UTC · **Mode:** read-only.
Nothing was written, restarted, configured or POSTed. No service, mount, launchd job or Tailscale setting was touched.

**The constraint that shaped the method.** The agent shell is TCC-walled from `/Volumes/NAS`: every read of `.memory/`
answers `Operation not permitted` instantly (a permission wall, not an I/O stall — the estate's own diagnostic). So
the spine was read through its faces, the mechanisms through their code, and the services through their launchd plists
and logs under `~/Library/Logs`. Where a fact lives only on the NAS filesystem (`.catalog/disposals/log.jsonl`, the
entropy state files) it is reported as **unverifiable from here** and the nearest wire evidence is given instead.

**Corrections to the brief** (the deliverables now carry the corrected form, marked *Wire:*):

1. **A-002 is live, not planned.** It is the owner-click disposal door (kallimachos `disposal.py`, shipped 2026-07-30).
   Its gate is a same-volume survivor re-hash or a recorded owner authorization. The *custodian handoff* inside it is
   what is unbuilt — there is no custodian, snapshot or backup check anywhere in the package.
2. **watch-contracts belongs to BINNA, not nerves**, was built and contract-published 2026-08-31, and has never run.
3. **The bank has no usage balances** — no `usage/`, no tick, no code. "No consumer" understated it: there is no producer.
4. **Three batches disposed, not two** (2026-07-30 ×2, 2026-08-09 ×1).
5. **GRAPHIFY holds 306,768 nodes**, not ~150k.
6. **"The first Time Machine copy stood at 26%" is unverifiable** from the mini, and the volume that would have held it
   was erased 2026-09-01. What the wire does say: Custodian reports `NO BACKUP`.

No verdict in NEURO-MAPPING changed. Conclusions 2, 3 and 4 and mappings 1, 2, 4, 6, 9, 11, 12 and 14 were re-argued
on the corrected facts.

---

## 1. Envelope count, sources, span

**Claim.** 71,225 envelopes, 12 sources, 2026-07-15 → 09-01.

```bash
curl -s http://100.90.97.7:8935/api/status
# {"events": 71585, "ledger": 160, "sessions": 0,
#  "sources": ["binna","kalli","memory-collector","memory-spine","musicarm","nerves","nerves-vm","omni","pharos","scc"],
#  "hosts": ["mac-mini","server-ai-staging"],
#  "span": ["2026-07-15T12:00:00Z","2026-09-01T19:58:22Z"], "verify_ok": true}

for s in binna kalli memory-collector memory-spine musicarm nerves nerves-vm omni pharos scc; do
  curl -s "http://100.90.97.7:8935/api/events?src=$s&limit=1" | python3 -c "import json,sys; print(json.load(sys.stdin)['matched'])"
done
# binna 2383 · kalli 384 · memory-collector 5119 · memory-spine 98 · musicarm 14 · nerves 62916
# nerves-vm 561 · omni 9 · pharos 113 · scc 1          (queried ~20:05Z; the log had grown to 71,598)
# host=mac-mini 70724 · host=server-ai-staging 874
```

**Verdict.** Confirmed in shape; count moved with the clock; **10 source names on 2 hosts**, not 12. `kalli` last
wrote 2026-08-21, `scc` once on 2026-08-06; nerves is 88% of the log.

## 2. Claims and procedures — count and authorship

**Claim.** 4 claims, 12 procedures, all hand-seeded.

```bash
curl -s http://100.90.97.7:9930/api/stats | python3 -c "import json,sys; print(json.load(sys.stdin)['by_node_kind'])"
# {... 'claim': 4, ... 'procedure': 12, ...}

curl -s "http://100.90.97.7:8935/api/events?contains=claim:&limit=200"      # 8 transitions
# 4 × proposed + 4 × trial confirmed, all src=memory-spine, ts 07-15, 08-13, 08-16, 08-18 (seed-dated)
curl -s "http://100.90.97.7:8935/api/events?contains=procedure:&limit=300"  # 22 transitions
# 10 × proposed + 10 × trial worked, src=memory-spine, 08-01 → 08-18 (seed-dated, noon-exact)
#  2 × proposed, src=kalli, 2026-08-20T21:04:21Z and 2026-08-21T15:05:16Z — no trial
ls memory-spine/scripts        # seed_claims.py  seed_procedures.py  seed_session_f.py  seed_week_20260808.py
grep -rn "Procedures(" kallimachos/kallimachos/*.py   # (no writer — the two kalli-sourced proposals came from a session's CLI)
```

**Verdict.** Confirmed and sharpened: every claim and procedure was **hand-authored** (seed scripts, plus two written
by a build session under `src=kalli` on 08-20/21 as post-mortems of SPEC-026). The only trials on record — 14 — were
written at seed time; **no trial has fired in use, ever**. Nothing was derived from episodes by code.

## 3. A-002 — what it is, what gates it, what has run through it

**Claim.** A-002 is planned, not shipped; the disposal verb can run without a custodian envelope.

```bash
git -C kallimachos log --format='%h %ad %s' --date=short -- kallimachos/disposal.py
# 583be24 2026-08-09 A-002.1: one-click disposal with summary confirm + owner-auth path
# 64e1a3e 2026-07-30 Deletion log hardened: disposals carry their own per-file hash lists
# 4470b7a 2026-07-30 A-002 approved and shipped: owner-click disposal, live on :8931
sed -n 28,97p kallimachos/kallimachos/disposal.py
#   basis = "deep-SAFE cross-check"  if verify report head has deep && safe_to_empty
#   basis = "owner-authorized (A-002.1)" if OWNER-AUTHORIZED.md in the batch
#   else: raise SystemExit("refusing: ...")
#   writes .catalog/disposals/{batch}.json, {batch}.hashes.jsonl, log.jsonl  BEFORE
#   shutil.rmtree(root)  # A-002: the single delete site in this repository
grep -rn -i custodian kallimachos/kallimachos/*.py     # only doctor.py: a role label. No check.
grep -n '"/api/dispose"' kallimachos/kallimachos/workbench.py   # POST handler on Kalli :8931 → disposal.dispose()
python3 kallimachos/tests/test_disposal.py | tail -4   # 8 guarantees … "all green"
```

What has run through the door (spine, `src=kalli`, `contains=dispos`):

```
2026-07-30T21:40:53Z  action       _Quarantine/2026-07-30-duplicates       disposed 1,185 files (18.5 GB)
2026-07-30T21:40:55Z  observation  entropy:2026-07-26-tmp.driveupload      disposed: owner clicked delete (A-002)
2026-08-14T00:12:20Z  action (backfill from .catalog/)  2026-07-26-tmp.driveupload  6062 file(s), 117.17 GB freed
2026-08-14T00:12:20Z  action (backfill)                 2026-07-30-duplicates       1185 file(s), 18.51 GB freed
2026-08-14T00:12:20Z  action (backfill)                 2026-08-09-test-media       5 file(s), 0.99 GB freed
```

Journal `kallimachos/build/JOURNAL/2026-07-30-q-first-deletions.md`: both 07-30 batches deep-SAFE, records written
before each `rmtree`, 135.7 GB freed. `2026-08-09-c-one-click.md`: the test-media batch verified the A-002.1 click
live. Entropy: `~/Library/Logs/entropy.log` — 29 ticks, `died 0` on every one (`healed 252` once). Backup state:

```bash
custodian/bin/custodian report --json     # {"status": "NO BACKUP", "reason": "No Custodian config ... Run `custodian init` first."}
tmutil destinationinfo                    # MINI-TM, Local, quota 1 TB  (created on the reformatted 3 TB, 2026-09-01)
tmutil latestbackup                       # requires Full Disk Access — unreadable from this shell
tmutil status                             # Running = 0
```

**Verdict.** **Corrected.** A-002 is the live door; its gate verifies a byte-identical survivor on the same volume (or
an owner authorization). No off-volume custody check exists. Three disposals, each with no backup in existence. The
"26%" figure cannot be verified here and the volume it referred to is gone.

## 4. The claims guard test

```bash
grep -n "class NoDeletePath" -A 6 memory-spine/tests/test_claims.py
#   forbidden = ("delete", "prune", "remove", "drop", "purge", "compact")   # pinned by introspection
/opt/homebrew/bin/python3 memory-spine/tests/test_claims.py     # Ran 16 tests … OK
ls -a memory-spine | grep -i github                             # (nothing) — no CI
head -12 memory-spine/tests/run-all.sh                          # manual per-file runner (discover is banned: false green)
```

**Verdict.** Exists, passes. **Not in CI** — no CI exists in memory-spine (nor in kallimachos). Procedures have no
equivalent introspection test; `procedures.py` narrates never-pruned but no test pins it.

## 5. The bank's balances

```bash
find bank -type f | grep -v .git/   # README.md, docs/{GAPS,DOOR-CONTRACT,PLAN,ACCEPTANCE}.md, sources/{napkin,pinokio,theresanaiforthat}.md
sed -n 28,42p bank/docs/PLAN.md     # "bank-balance verb … folds spine → usage/ tables" — Order: … 3. bank-balance tick … "Owner approves before 3–5 build."
grep -n "Usage counters" bank/docs/GAPS.md   # ❌ | no derivation tick, no promote-on-repeated-use  (2026-08-22)
```

**Verdict.** **Corrected.** No `usage/`, no tick, no code: balances do not exist. (`used:` / `choice:` refs cannot be
counted through the face — its `contains` filter excludes refs.)

## 6. memory-nightly

```bash
grep -A6 ProgramArguments ~/Library/LaunchAgents/com.ettz.memory-nightly.plist
#   /opt/homebrew/bin/python3  ~/Library/Application Support/memory-spine/bin/spine --root /Volumes/NAS/.memory nightly   (03:00)
sed -n 1,20p memory-spine/memory_spine/nightly.py       # collect → consolidate → delta vs previous night → questions snapshot
grep -n "spine.append\|write_text" memory-spine/memory_spine/nightly.py   # one delta event (line 99); nightly-state.json (120)
sed -n 160,185p memory-spine/memory_spine/consolidate.py # Procedures(...).snapshot(); Claims(...).snapshot()  — folds rendered to state.json
tail -5 ~/Library/Logs/memory-nightly.log
#   news: binna +93, nerves +2544, nerves-vm +36, pharos +5; ledger +2; graph +434n/+438e
#   lifeboat: 321 files, 276.5 MB, verified=True (checked 31), pruned 1 · recorded · verify: ok (69515 entries)
```

**Verdict.** Confirmed. It writes derived snapshots, one delta event, and a consolidation event when the ledger gained;
it mints no claim, no procedure, no trial.

## 7. The M1 eval harness

```bash
sed -n 118,127p binna/docs/SPEC-COUNCIL.md   # M1 — maths (deterministic verifiers): generated arithmetic chains, equations …
ls ~/.ettz/binna/runs                        # m1-20260820T103005Z.json, registrar-2026082…
head -8 binna/JOURNAL/2026-08-18-m1-run1.md  # Run m1-20260818T093946Z, n=21 fixtures × 6 arms, 203 stage envelopes in the outbox
grep -rn -E "\.trial\(|Procedures\(|Claims\(" binna/src   # (nothing) — binna/spine.py is the read-only face transport
```

**Verdict.** No trial write-back — confirmed. But M1 is a **bench on generated maths fixtures**; it does not re-run
episodes and exercises no claim or procedure. The write-back proposal needs a bench arm that touches the stores first.

## 8. The cold fold and its cache

```bash
sed -n 229,239p memory-spine/memory_spine/claims.py   # _fingerprint: (name, mtime_ns, size) per events/ file; self._cache in-process
sed -n 214,229p memory-spine/bin/spine-face             # _ReadCache: same key; "folding 31k entries is seconds"
curl -s -o /dev/null -w "%{time_total}\n" http://100.90.97.7:8935/api/status     # 14.73 s, then 31.27 s  (stats + full verify, uncached)
curl -s -o /dev/null -w "%{time_total}\n" "http://100.90.97.7:8935/api/events?limit=2"   # 7.44 s (cache hit)
```

**Verdict.** Exact-fingerprint cache confirmed; it lives in the process, so every CLI invocation folds cold. The 60 s+
figure was **not reproduced** — the fold itself cannot be timed from this shell.

## 9. watch-contracts

```bash
sed -n 636,650p nerves/build/DECISIONS.md      # N62: master.watch-contracts "Deliberately NOT built now — BINNA's first act of organic growth"
grep -n "def watch_contracts" -A 30 binna/src/binna/keepers.py
#   declared = contracts under ~/.ettz/*/outbox + registry heartbeat fields; live = runner /mesh members
#   join  ← declared but not in mesh;  investigate ← in mesh but undeclared (ring hosts excluded);  runner down → propose nothing
cat ~/.ettz/binna/outbox/contract.json          # verbs: watch-contracts cadence_s 3600 at /verb/watch-contracts; published 2026-08-31T10:51:56Z
grep -c watch-contracts ~/.ettz/binna/outbox/binna.outbox.jsonl   # 0
ls ~/.ettz/binna/proposals                       # No such file or directory
grep -c -i "watch-contracts" ~/.ettz/binna/log/binna.out.log ~/.ettz/binna/log/binna.err.log   # 0, 0
grep -rln -E "8960|watch-contracts" nerves/n8n/workflows        # (nothing)
curl -s http://127.0.0.1:9931/mesh               # members: binna (registry), mac-mini (ring), nas-vm (ring)
```

**Verdict.** **Corrected on owner**, confirmed on logic. It never proposes from traffic content — declarations and
self-announced beats only — and it has **never run**: the fabric fires `triggers` maps, BINNA published `verbs`.

## 10. Procedures' clock, claims' delete path, window closure

```bash
sed -n 9,10p   memory-spine/memory_spine/procedures.py   # "a procedure does not decay from disuse at all … only decays by FAILING when tried"
sed -n 156,157p memory-spine/memory_spine/procedures.py  # worked → verified, failed → contested. "no clock, no disuse decay"
sed -n 31,33p  memory-spine/memory_spine/claims.py       # NO delete path, NO prune path, NO row-dropping compaction, and never may
sed -n 127,160p memory-spine/memory_spine/claims.py      # propose(contradicts=…) → retired action on the old claim, valid_until = new valid_from
/opt/homebrew/bin/python3 memory-spine/tests/test_procedures.py   # Ran 21 tests … OK
```

**Verdict.** Confirmed in code, not docs.

## 11. The `.why.md` manifest

```bash
sed -n 241,275p kallimachos/kallimachos/quarantine.py   # manifest.jsonl written + fsynced FIRST; then per file: os.rename → write <name>.why.md
sed -n 190,218p kallimachos/kallimachos/quarantine.py   # _why_md: quarantined-at, batch, came-from, size, why, the surviving original (+sha256 prefix), undo
grep -n "why.md" kallimachos/kallimachos/disposal.py     # (nothing) — the disposer writes .catalog/disposals/, not manifests
```

**Verdict.** Written by the **quarantine stager** at the moment each file is renamed into the batch — post-decision,
pre-disposal; also by the inbox absorber for sidecar litter. It names the reason and the survivor, **not a tag or
threshold** (C2's adopter rule is therefore not yet met by the current manifest).

## 12. GRAPHIFY and PHAROS

```bash
curl -s http://100.90.97.7:9930/health
# nodes 306768, edges 522903, engine sqlite, feed.last_refresh 2026-09-01T20:00:58Z, refreshes 74, watching: events, registry, questions, spine graph, catalog
curl -s http://100.90.97.7:9930/api/stats     # by_node_kind: event 211470 · file 94871 · service 134 · decision 112 · question 93 · app 33 · agent 31 · procedure 12 · topic 5 · claim 4 · host 3
grep -n '"/api/node"\|neighbourhood' graphify/graphify/serve.py     # /api/node?id&depth → backend.neighbourhood()  (UI traversal)
grep -rn -E "9930|/api/node|neighbourhood" binna/src kallimachos/kallimachos pharos/pharos   # (nothing) — no organ consumes the graph
sed -n 33,51p binna/src/binna/spine.py         # BINNA reads memory-face /api/events (linear union), not the graph
ls ~/.ettz/pharos/snapshots                    # 2026-08-26 … 2026-09-01 (json + services.csv + matrix.csv per snapshot; 6 on 09-01)
```

**Verdict.** Count corrected (≈2× the brief, because the feed now includes 94,871 file nodes). Nothing retrieves by
traversal except the UI. PHAROS snapshots are daily and on change.
