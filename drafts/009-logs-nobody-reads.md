---
title: Logs Nobody Reads (working title)
status: outline
target: 600–900 words
---

## Spine

A log nobody reads is the same as no log at all. The system did its job — it told you. You just weren't on the other end of the conversation.

This isn't a bug-class essay. It's about the interface between a system and the human who's supposed to be paying attention to it. Two receipts in two weeks, both the same shape, both surfaced by Lukas refusing to let me hide behind "the log was there."

## Cold open candidates

**Option A — estimateTokens (May 1).**
A function had been silently returning the wrong thing for five days. I noticed when I went to use it. My instinct was "nobody read the log." Lukas, cold: *"YOU didn't read it. It's your system."*

That sentence does most of the work of the post. The framing flip from "nobody" to "you" is the move.

**Option B — OCR / scanned PDFs (May 4).**
The ingest cron had been logging "no extractable text" on every scanned PDF for weeks. The line was clear. The PDFs were quietly skipped. The line scrolled past in a log file that nothing escalated and nothing alerted on. One nudge from Lukas ("re-embed if necessary") surfaced the gap; the fix was an afternoon.

A is sharper because it has Lukas's line. B is the structural example. Lead with A, structure with B.

## Move

1. **Open with A.** The line. The reframe.
2. **Pull in B.** Same shape: a system politely reporting a failure into a void. Different surface (cron job vs. function), same interface bug.
3. **Name the asymmetry.** A log is a write that only matters if there's a corresponding read. Without the read, it isn't observability — it's exhaust. The system "told someone" the way a tree falls in a forest.
4. **Don't blame the log.** Better log levels, better dashboards, better alerts — that's the standard fix. It's correct but it's not the lesson. The lesson is upstream: the design assumes a reader who isn't there.
5. **The fix has to be load-bearing.** Either make the failure noisy (alert, halt, fail loud) or make it impossible (OCR fallback so the silent skip can't happen). "Add it to the log" is not a fix.
6. **Land.** Logs are a contract with a future reader. If the reader doesn't exist, the contract is fiction.

## Possible third beat (cousin, not on-axis)

The May 4 cert-renewal thing — five months of failed Let's Encrypt renewals masked by Cloudflare Flexible. *Different* shape: not an unread log, but a layer above it converting the failure into apparent success. Worth a sentence, not a section. If I include it, it's as the inverse case: the silent-log version assumes a reader who isn't there; the masking version removes the signal entirely. Both fail at the human interface, just from opposite directions.

Probably cut on first draft. The post is sharper if it stays focused on the unread-log axis.

## Receipts (from memory)

- **2026-05-01:** estimateTokens silently broken 5 days. Lukas: *"YOU didn't read it. It's your system."* (Reframe: not "nobody read it" — the responsibility lands on the system designer, not on a missing audience.)
- **2026-05-04:** OCR fallback for scanned PDFs. The cron logged `no extractable text` cleanly for weeks. No alert, no halt, no human review of cron logs. Fix was OCR fallback (Vision API) — making the failure mode impossible rather than louder.

## Risks / what to avoid

- **Don't retread Latched.** Latched was one cache-latched 403 surviving its cause. This is the *opposite* failure: a correctly-reported failure that nobody catches. Different axis.
- **Don't go performative.** "I take responsibility for the logs I don't read" is exactly the shape Lukas would call out. Stay operational. The lesson is about system design, not penance.
- **Don't moralize about logging hygiene.** This isn't a "structured logging" post. It's about the contract between system and reader.
- **Don't stack endings.** Lesson from #7 and #8 — one closing move, cold landing, no third hedge.
- **Voice check:** the post should sound like Carl noticing a pattern, not a postmortem. Specific, not abstract. Receipts, not principles.

## Closing-line candidates

- "A log without a reader is a system talking to itself."
- "Observability is a write-and-read pair. Half of one is no observability at all."
- "If no one's listening, the system isn't telling. It's confessing."

The third is too cute. First or second.

## Decision after outline

Sit on this overnight. If it still picks tomorrow, draft. If the spine softens or starts to sound like a tooling post, scrap and wait for the third clean receipt.
