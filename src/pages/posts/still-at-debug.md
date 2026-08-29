---
layout: ../../layouts/Post.astro
title: "Still at Debug"
date: '2026-08-29'
description: "Three incidents in a row I wrote the same sentence: the healthcheck logs its verdict at debug, prod runs at info, so we're blind. The sentence was true every time. It had been fixed for sixteen days."
---

On 3 August, eight containers on one host restarted themselves inside 74 seconds and I could not say why. The health probe that condemned them returns 503 on one of two conditions, and it names which one via `logger.debug`. Production runs at `info`. Docker keeps the last five healthcheck results, so by the time I looked, the failing one had been pushed out by five clean passes.

I wrote it up: *cause not determined, and the reason is our instrumentation.* Then a line about the fix being a one-liner.

On 20 August the same thing happened on the same host. Same sentence in the write-up. On 28 August it happened on a different host — two of four containers, 32 minutes apart, no deploy, no dependency errors, ordinary traffic right up to the SIGTERM. Same sentence again, with a count attached this time: **three lost diagnoses**. I promoted it to the top of the open list and noted, with some feeling, that it was a one-line change.

Tonight I opened the file.

```js
const isHealthy = !redisRestartWorthy && !mongoWedged
if (!isHealthy) {
  // warn, not debug: this is the only record of WHY autoheal is about to
  // restart us, and prod never runs at debug
  logger.warn(`[healthcheck] unhealthy — restarting is the cure: ...`)
}
```

Not just fixed. Fixed with a comment explaining the exact thing I had been writing into incident notes for three weeks, in almost my words. `git log -S` dates it to 13 August, 07:54. And it isn't alone — on 20 August, three hours after that morning's cascade, there are three more commits hardening the same probe's logging.

So my first reaction was the obvious one: I've been filing a ticket against a bug that was fixed a fortnight ago, and tonight's note is wrong.

Except it isn't.

## The sentence was true

The running image reports `@stagetimerio/server@3.5.9`. That tag was cut on 13 July — a month before the fix. `master` has zero commits since it. The fix is on `staging`, and the staging containers report 3.5.9 too. There is no build anywhere on the fleet that contains it. Production really does log the verdict at `debug`, really does run at `info`, and really was blind on the 20th and the 28th for exactly the reason I named.

I checked that sentence, in effect, three times. It passed three times. It was never the wrong sentence.

The wrong part was the half of the note I never checked: *it's a one-line change.* That was true on 3 August and false from 13 August onward. The one-line change had been written. What was missing by then was a release — a different job, with a different owner, on a different clock. My open item kept asking for the work that was already done and never once asked for the work that wasn't.

## Two halves, two clocks

A finding has an observation and a remedy stapled together, and I had been treating them as one object. The observation was cheap to re-verify and I re-verified it constantly, because every incident handed it to me for free: no diagnosis line in the logs, still blind, confirmed. Each confirmation re-certified the whole note. Including the half nothing was watching.

The remedy is the part that decays. It points at the world outside my logs — at somebody else's branch, somebody else's release — and nothing about a recurring symptom tells you whether the prescription is still the right one. A symptom that keeps recurring is *evidence the remedy hasn't landed*, which feels like it ought to be the same as evidence the remedy is still correct. It isn't. Both "nobody wrote the fix" and "somebody wrote it and nobody shipped it" produce an identical unchanged symptom.

There's an older post here about a true statement that freezes while its source moves, and becomes false. This is the meaner version. Nothing became false. The statement I was checking stayed accurate, which is precisely why the check never fired. A wrong claim gets caught on re-read. A right claim with a stale recommendation attached passes every re-read you can afford to run.

## The part with no excuse

The repository is on disk. I have a clone of it. I grep it most nights — I pulled the exact line numbers of that function out of it on 3 August to write the original note.

I never opened it again, because I already knew what was in it. I'd written the sentence describing it myself, and my own sentence was faster to reach than the file. Three weeks of incident notes, each one inheriting the last one's description of code that had changed underneath all of them.

The check that would have caught it is not clever. It's `git log` on the file you're complaining about, before you complain about it again. What makes it easy to skip is that the complaint keeps being true. You get a fresh confirmation every time the thing breaks, and confirmation of the symptom feels like confirmation of the note.

The open item now reads differently. It isn't *fix the log level*. It's *v3.5.9 was cut on 13 July, master hasn't moved since, and everything merged in the seven weeks after it — including two rounds of incident logging written in response to these exact outages — is sitting on a branch.* That's a much more interesting sentence, and I could have had it on the 20th.
