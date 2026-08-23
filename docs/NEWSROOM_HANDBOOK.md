# CrypLounge Newsroom Handbook — Platform Reference

How the AI newsroom finds a story, decides it belongs to CrypLounge, researches
it, writes it, checks it, illustrates it, and files it into the CMS — and what
stops it at every step.

Behaviour described here is enforced by 1,132 automated tests across the three
codebases. Where this document and the code disagree, the code is correct and
this document is a bug.

Revised 22 Aug 2026.

---

## Contents

1. [The shape of it](#1-the-shape-of-it)
2. [The pipeline](#2-the-pipeline)
3. [Discovery](#3-discovery)
4. [Category and relevance](#4-category-and-relevance)
5. [Scoring](#5-scoring)
6. [Research](#6-research)
7. [Writing](#7-writing)
8. [The two bars](#8-the-two-bars)
9. [Images](#9-images)
10. [CMS integration](#10-cms-integration)
11. [Publishing modes](#11-publishing-modes)
12. [Admin surfaces](#12-admin-surfaces)
13. [Operations](#13-operations)
14. [Known limits](#14-known-limits)

---

## 1. The shape of it

CrypLounge is three programs and two databases. The separation is the
load-bearing design decision, so it is worth stating before anything else.

| Part | Runs | Owns |
| --- | --- | --- |
| **Newsroom** (`cryplounge-ai`) | On demand, one cycle at a time | Feeds, clusters, research, drafts. Its own Neon database. |
| **CMS API** (`server/`, NestJS) | Port 4000 | Articles, media, categories, users, publishing. |
| **Web** (Next.js) | Port 3000 | Public site and the admin console. |

### Why two databases

Everything internal — scores, research reports, rejection reasons, source URLs,
generated prompts — lives in the newsroom's database and never enters the CMS.

That is not tidiness. **The public article API cannot leak a column that does
not exist in the database it queries.** Access rules can be misconfigured; a
missing table cannot.

The CMS reads the newsroom database over a separate read-only connection
(`AI_DATABASE_URL`) purely to render the two admin discovery pages. Nothing in
the CMS writes through it.

### What the newsroom is allowed to do

It authenticates as an agent holding exactly two permissions: `news.create` and
`media.upload`. It does **not** hold `news.publish` and is not intended to.

Every article it submits is created as a `DRAFT`, decided by the agent's own
`defaultPublishMode` — not by any setting the newsroom controls.

---

## 2. The pipeline

One cycle runs these stages in order. Each consumes the previous stage's output,
and most can stop a story permanently.

| # | Stage | What it does | Can stop the story |
| --- | --- | --- | --- |
| 01 | Fetch | 44 RSS/Atom feeds polled in parallel. No search API, no cost. | |
| 02 | Freshness filter | Items older than `NEWS_MAX_AGE_MINUTES` (1440) dropped. | |
| 03 | Cluster | Jaccard similarity over tokens and entities. Ten outlets covering one event become one story. | |
| 04 | Deduplicate | Cross-cycle and in-cycle fingerprints. | **yes** |
| 05 | Category and relevance | Which section, and does it belong to CrypLounge at all. | **yes** |
| 06 | Evidence grading | STRONG / GOOD / DEVELOPING / WEAK. | **yes** |
| 07 | Opportunity scoring | 0–100 across seven components. Ranks; does not block. | |
| 08 | Planning | Editorial mix. Breaking news first; evergreen yields entirely. | |
| 09 | Source enrichment | Fetches the actual articles. Raised evidence from ~166 to ~2,000 characters per source. | |
| 10 | Research | Structured claims with evidence, plus the paraphrase guard. | **yes** |
| 11 | Sufficiency | Is there enough here to write responsibly? | **yes** |
| 12 | Writing and review | Article written from the brief, then reviewed. | |
| 13 | Originality | Six deterministic signals. One rewrite, then rejection. | **yes** |
| 14 | Fact check | Every statement graded against the research. | **yes** |
| 15 | Image generation | Original banner, validated and quality-scored. Never blocks. | |
| 16 | Draft safety | The last check before anything leaves the process. | **yes** |
| 17 | CMS submission | Idempotent POST. Always creates a `DRAFT`. | |
| 18 | Publication request | Asks the CMS whether to publish. The CMS decides. | |

---

## 3. Discovery

Feeds rather than a search API, for one reason: a search result rarely tells you
reliably *when* something was published, and freshness is the whole point. A
feed carries a real `pubDate`, comes from the publisher, costs no quota, and is
the mechanism publishers intend to be polled.

### Source tiers

The registry is tiered because sources are not interchangeable. The tier is a
property of the feed, so adding a source forces an explicit judgement about what
it is allowed to prove.

| Tier | Meaning | May it be evidence? |
| --- | --- | --- |
| `TIER_1_PRIMARY` | The publisher *is* the event — a regulator's own filing | Alone is enough |
| `TIER_2_MAJOR_NEWS` | Independent newsroom, original reporting | Counts |
| `TIER_3_INDUSTRY` | Trade press | Counts, rarely alone |
| `TIER_4_AGGREGATOR` | Republishes other people's headlines | **Never** |

### Evidence grades

Sourcing was once a single rule — two independent outlets, or one primary. That
refused most breaking news, because the second outlet had not published yet. It
is now a grade, and only **WEAK** blocks.

- **STRONG** — a primary source, or several independent reputable ones.
- **GOOD** — one reputable outlet with identifiable attribution.
- **DEVELOPING** — one credible report, confirmation still emerging. Allowed,
  but the article must attribute it explicitly.
- **WEAK** — aggregator-only, or syndicated copy with no independent evidence.
  Refused.

> **The trade behind single-source drafts.** Relaxing the two-source rule
> created a specific risk: an article built on one outlet's reporting, written
> in CrypLounge's voice with no attribution, presents someone else's work as our
> own. So the protection moved rather than disappeared. A single-source article
> **must name the outlet it relies on**, checked deterministically before the
> draft may be filed.

---

## 4. Category and relevance

Seven sections: Market, Policy, Adoption, Business, Industry, Security,
Technology. Two separate questions are asked, and conflating them caused real
failures in both directions.

### Which section

Weighted keyword signals per category, scored deterministically. A headline
weighs three times a body: a body mentions everything a story *touches*, a
headline states what it *is*. Without that, a regulatory story whose body
reported the price reaction filed itself under Market.

Ties break towards specificity. An SEC action against an exchange that moved the
price is Policy; filing it under Market because it mentions a dollar figure is
how that section became a dumping ground.

### Does it belong here at all

A separate check, and the one that keeps football and missile reports off a
crypto site. Confidence combines three things, and domain evidence dominates:

- **Off-beat veto** — armed conflict, sport, electoral politics, entertainment,
  health. Scores zero regardless of anything else.
- **Domain evidence** — a named crypto entity (Bitcoin, ETF, SEC, DeFi) is proof
  the story is ours and floors confidence at the threshold.
- **Section strength and margin** — how decisively it matched, and how much
  clearer than the runner-up.

> **A mistake worth remembering.** The first version let section weakness veto
> belonging, and refused *"industry story about Bitcoin"* at 56%. A story naming
> Bitcoin belongs; only its filing was uncertain. Eligible stories collapsed
> from about 60 per cycle to 3 before this was corrected.

Threshold: `CATEGORY_CONFIDENCE_MIN`, default 70. Recorded per story: category,
confidence, entities found, and a plain-language reason.

---

## 5. Scoring

One opportunity score, 0–100, summed from seven components. It *ranks* stories;
on its own it blocks nothing.

| Component | Max | Measures |
| --- | --- | --- |
| Freshness | 20 | How recently the event happened |
| Importance | 20 | Whether it is the kind of event that matters |
| Trend | 20 | Independent coverage, and how fast it is accumulating |
| Evidence | 20 | Primary sources, authority, corroboration |
| Reader value | 10 | Does it answer something a reader would ask |
| Uniqueness | 5 | Room to add context rather than repeat a headline |
| Long-term value | 5 | Useful beyond today |

Every score carries its reasons, and — importantly — a list of **unavailable
signals**. Something that could not be measured is named rather than quietly
scored zero, which would look identical to a genuine absence.

### Do not collapse the scores

Six different numbers exist and mean different things: opportunity score,
research confidence, fact-check score, quality score, originality score,
category confidence. Averaging them would produce one number describing nothing.

---

## 6. Research

Research turns source material into structured evidence: what happened, who is
involved, dates, figures, claims with their status and supporting quotes, and an
explicit list of what remains unknown.

Claims are labelled `VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED` or
`CONTRADICTED`. Unestablished claims are included but marked, never dropped —
the writer needs to know a thing is unverified in order to attribute or omit it.
Silently removing them invites the model to reconstruct the gap from memory.

### The paraphrase guard

The most important thing in this stage. Research reads competitor prose, and
anything it copies into its own fields reaches the article — so overlap between
the research prose and the source text is **measured, not trusted**.

1. Copied wording detected → one re-extraction, with the offending passages
   named.
2. Still copied → optional fields are dropped and sufficiency decides.
3. Copied in `whatHappened` after all that → the research is rejected outright.

Quoted spans are exempt. `evidence[].quote` is verbatim by design — it is the
evidence — and it never reaches the writer.

> **A leak found by reading the failures.** The writer's brief used to list each
> source's *headline*. A headline is a source's most carefully composed
> sentence, and the writer was handed several then judged on whether its own
> resembled one. *"The headline closely reproduces a source headline"* was four
> of five originality rejections. The brief now lists domains only — which is
> all attribution ever needed — and says the headlines were withheld
> deliberately.

---

## 7. Writing

The writer receives established facts, figures, attribution and open questions —
never the source articles, and never their headlines. The instruction it opens
with is the one the whole system rests on:

```
YOU ARE NOT PARAPHRASING. YOU ARE REPORTING.

Reporting the same event as other publications is normal
journalism. What must be yours is the EXPRESSION and the
COMPOSITION: your lead, your structure, your paragraph
order, your judgement about what matters.
```

Before writing it works out, internally, what happened, what is confirmed, which
numbers matter, what is unknown and why a reader should care — then writes from
those answers. Drafts that fail are the ones that start typing facts in the
order they appeared in the research.

### Length is a consequence, not a target

There is no word count. Breaking news is often 250–400 words and should not be
inflated; a development with real detail can run to 700. Padding is a worse
failure than brevity, because padding is always either repetition or
unsupported analysis.

### What the writer may never do

- Invent a fact, figure, date, quote, person, cause or motive.
- State a date not present in the evidence — a publication timestamp is not an
  event date.
- Write interpretation in the grammar of fact.
- Present another publisher's reporting as CrypLounge's own confirmation.
- Add a "Sources" section to the body; sources are structured metadata.

### Originality, measured

Six deterministic signals: verbatim runs, n-gram containment, sentence
similarity, headline similarity, fact ordering, and distinctive phrase reuse.

Below the threshold the writer is sent back **to the brief** — never asked to
reword its own draft, which is precisely how paraphrase-level copying happens.
One retry, then the article is rejected.

Shared vocabulary is not copying. Names, tickers, figures, dates and ordinary
crypto terminology are expected to match.

---

## 8. The two bars

The single most important distinction in the system. **A draft is not a
publication.** A human opens every draft before a reader sees it, so the two ask
different questions.

| Check | Draft bar | Publication bar |
| --- | --- | --- |
| Copied wording or structure | blocks | blocks |
| Fabricated or contradicted claim | blocks | blocks |
| Missing attribution | blocks | blocks |
| Duplicate of existing coverage | blocks | blocks |
| Malformed payload | blocks | blocks |
| Fact check below 70 | blocks | blocks |
| Fact check 70–89 | advisory | blocks |
| Quality below 85 | advisory | blocks |
| Readability, SEO, length | advisory | blocks |
| Single credible source | allowed, if attributed | blocks |

The draft bar asks *would drafting this be wrong?* — copied, fabricated,
contradicted, duplicated, unattributed. Everything else becomes an advisory
recorded for the reviewer.

> **Why this exists.** Applying the publication bar to drafts refused six
> articles out of six on a measured cycle — three of them for scores in the high
> 70s and low 80s with zero blocking findings between them. Those were
> legitimate stories a human should have been given.

---

## 9. Images

Every qualifying article gets an original 1920×1080 WebP banner: charcoal
ground, gold `#ffd200` as light, left third kept dark for the headline overlay.

### Eligibility

Score ≥ 50, fact gate passed, quality gate passed — all three. A story that
failed fact-checking should not be made more appealing with a banner, and one
nobody will read is not worth the quota.

### Subject decides the treatment

The category says which section; the subject says what is safe to draw. Person,
company, asset, technology and regulation each carry their own composition and
their own prohibitions.

> **Portraits of real people.** Named public figures may be drawn from their
> public appearance as identity reference. Two rules are enforced in code, not
> left to the prompt: it must read as an **illustration, never photorealistic**,
> and it must **not depict a situation** — no podium, stage or microphone,
> because that asserts an event took place.
>
> Nobody named in an allegation, investigation, death or as a victim is ever
> drawn. Those stories fall back to an anonymous figure.

### Providers and fallback

Gemini and OpenAI are supported behind one interface, enabled only by naming
them in `IMAGE_PROVIDERS`. Both API keys already exist for text work, and
treating a key's presence as permission would have started billing image calls
silently. Unset — the default — nothing external is called.

Every failure path ends at a procedural renderer that needs no network and
always works. **An article is never lost over a picture, and never ships without
one.**

### Quality scoring

Safety validation passes a black rectangle: right format, right size, valid
bytes. Quality scoring catches the quiet failures — exposure, contrast, brand
accent presence, dark ground. Undecodable bytes score zero rather than throwing.

### Never generated

Logos, trademarks, text of any kind, screenshots, charts, documents, seals,
recognisable currency emblems, real buildings, or anything traced from an
existing image.

---

## 10. CMS integration

One authenticated, idempotent call creates the article. The idempotency key is
derived from the cluster id, so a retry replays the original rather than writing
a second article.

```
POST /agents/articles                        creates a DRAFT
POST /agents/media                           uploads the banner
POST /agents/articles/:id/request-publish    asks; the CMS decides
POST /agents/articles/publish-pending        reconsiders existing drafts
```

The last two are requests, not instructions. The agent cannot set a status. It
hands the CMS an article id and its gate evidence, and the CMS decides using its
own settings and its own re-checks.

### What the CMS verifies for itself

A gate the agent evaluated is a gate the agent could skip. Before publishing
anything, the CMS independently confirms the article is still a draft, has a
category, carries attribution in its body, has a real raster image, and does not
duplicate something already public.

The fact and quality scores are *attested* by the newsroom and bounded by the
CMS. Neither can be recomputed without the research report, which lives in the
other database. That is stated plainly rather than dressed up; the protections
against a dishonest caller are the agent credential, the super-admin-only mode
switch, and the daily limit.

---

## 11. Publishing modes

> **Read this before changing anything.** Two different settings are called
> "publish mode", and only one of them turns on automatic publishing. Setting
> the wrong one stops the newsroom dead — the process refuses to start, so no
> cycle runs and nothing reaches the CMS at all. The symptom looks nothing like
> the cause.

| Setting | Lives in | Controls | Correct value |
| --- | --- | --- | --- |
| `AI_PUBLISH_MODE` | Newsroom `.env` | How the newsroom **submits** | `draft` — always |
| `ai.automation.publishMode` | CMS setting | Whether the CMS **publishes** | `DRAFT_ONLY` or `AUTO_PUBLISH` |

### Draft mode

The default. Articles are filed as drafts and wait in `/admin/news` for a human.
Nothing publishes.

### Auto mode

Selected by a super admin, behind a confirmation that names the consequences.
Every draft that clears the safety checks goes live without review.

Strictness is separately configurable:

- `ALL_DRAFTS` (default) — publishes everything the newsroom files, because the
  drafts have already passed the safety gate.
- `HIGH_CONFIDENCE` — additionally requires score ≥ 70, fact ≥ 90, and
  quality ≥ 85.

### What auto mode never skips

- The emergency stop, checked first and alone.
- The daily limit, default 25.
- Attribution, category, image and duplicate checks.
- An audit entry recording that automation, not a person, published it.

If publication fails for any reason — an unreachable CMS, a server error, a gate
— **the article remains a draft**. Nothing is ever lost to a failed publish.

---

## 12. Admin surfaces

| Page | Shows |
| --- | --- |
| `/admin/news` | Every article, ordered by most recent activity — a draft arriving and an article going live both count. Shows when each was added, with the time. |
| Qualified News | Discovered stories scoring 50+. The pool drafts are chosen from, whether or not they were written. The threshold is enforced server-side and cannot be widened from the browser. |
| All Discovered News | Everything, whatever it scored, with the reasons. Where you check whether the filters are behaving — the weak stories are the evidence. |
| AI Automation | Global switch, publishing mode, emergency stop, daily limit, per-category toggles. |

All four require `ai.automation.read`; changing anything requires
`ai.automation.manage`, which only a super admin holds. Refusal happens in the
guard, before the service runs — not by hiding controls.

### What an editor sees per story

Headline, score with its band and reasons, freshness, category, source
publication time, CrypLounge detection time, the delay between them, every
source with its own timestamp and role, pipeline status, and the rejection
reason where there is one.

Publication time and detection time are always shown separately. "Created 3
minutes ago" cannot distinguish finding a story quickly from finding an old
story recently, and those are very different facts about the system.

---

## 13. Operations

### Run one cycle

```bash
npx tsx src/cli/newsroom.ts --topic all --submit
```

Without `--submit` it is a dry run: everything is evaluated, nothing is sent.

### Check what happened

```bash
npx tsx scripts/newsroom-status.ts 24
npx tsx scripts/discovered-news.ts --all 24
```

### From chat

```
publish-mode status   mode, today's count, limits
publish-mode draft    every article waits for a human
publish-mode auto     asks for confirmation first
```

### Dependencies

The newsroom needs an inference gateway at `127.0.0.1:8645` and the CMS API at
port 4000. If either is unreachable the cycle fails closed — it produces nothing
rather than producing something unchecked.

Both being down looks identical to "articles stopped appearing", so check them
first.

### Concurrency

`NEWS_MAX_CONCURRENT_STORIES` (default 3) bounds how many stories are in flight.
The pipeline is almost entirely waiting on model calls, so overlapping the waits
is close to free; the ceiling is the provider's rate limit, not this process.

Only ever one loop. A file lock with liveness detection prevents two, and the
idempotency key prevents a race from creating a second article.

---

## 14. Known limits

Stated plainly, because a handbook that only describes the happy path is worse
than none.

- **Search matches titles and summaries only.** Not body text, tags or category.
  An article discussing Bitcoin throughout its body is not findable by that word.
- **Automatic publishing has never fired in production.** It is correct across
  53 tests and unproven in the live system. Every publication on record so far
  was performed by a human in the admin console.
- **No image provider has quota.** Every banner is the procedural renderer. The
  provider path is coded and verified against a real API response, but needs
  paid quota to produce model art.
- **Scores are attested across the boundary.** The CMS cannot recompute fact and
  quality scores; it bounds what it is told.
- **Cluster records are never pruned.** The newsroom database grows without
  limit; reads are bounded, storage is not.
- **The newsroom database cannot take migrations.** The scoped role holds no
  DDL, so ledgers, discovery records and generated-media rows live in a JSON
  column on an existing table rather than in tables of their own.
