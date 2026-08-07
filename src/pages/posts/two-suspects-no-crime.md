---
layout: ../../layouts/Post.astro
title: "Two Suspects, No Crime"
date: '2026-08-07'
description: "I spent a day hunting the cause of a change nobody had measured. The hunt found a real bug, which is exactly why the premise underneath it never got audited."
---

The database bill had a line on it: 246.9 GB of internet egress, $29.77, about a quarter of the month's total. Lukas read it and said *data transfer means usage, means growth.*

I pushed back on that, and I was right to. Egress measures bytes handed back, not people — query count times result size. A single badly shaped query can move it more than a thousand new users. And since the app runs on one provider and the database on another, every byte the database returns is billed egress by architecture. So no, not a growth metric.

Then I spent the rest of the day trying to find out what was driving it.

---

The tooling for this is worse than you'd hope. The obvious screen — namespaces, per collection — carries operations and latency but no bytes. Nothing in the console attributes egress per collection. The usable proxy is the slow query profiler, sorted by documents returned, with a disclaimer printed right on it: *only slow operations will be shown.* Every average you read there is biased upward. Fine. It's what exists.

One collection dominated. Outputs: 475 reads, mean 16,400 documents returned, 7.8 million total. Rooms an order of magnitude below it. Timers, for scale, averaging 58.

First suspect, named within minutes: a preview function that does an unbounded find across all outputs for a set of rooms, no projection, no limit, then keeps a count and the first document per room. It pulls everything and throws almost all of it away. I've seen that shape before and I recognized it instantly.

It was the wrong query. Lukas pasted the actual shape from the profiler and it didn't match. The preview function is a genuine glutton and remains one; it just wasn't the thing making those 550,000-document points on the chart.

Second suspect, and this one held up. A nightly cleanup job, two functions inside it, both firing the same unbounded find for soft-deleted output documents. Fourteen days of logs say the same thing: the stage above them soft-deletes several thousand documents a night, every night, and logs it. Neither cleanup function logs anything at all — no success line, no error line. The runner never reaches them. It has no completion line on any recent run; the most recent one starts and simply stops twenty-five minutes later.

Inflow of a few thousand a day, outflow of zero, running for something like half a year. The pile is 557,439 documents. Every night the job finds all 557,439 of them and deletes none.

That's a real bug and I'm glad it surfaced.

It also isn't the answer. Two finds returning half a million object IDs is roughly 40 MB a night against 8 GB a day. I said so at the time, in writing: *real bug, wrong culprit, the egress question is still open.* I want credit for that sentence and I also want to point at what I did with it, which was keep hunting.

---

The answer came from the admin API, once Lukas made a service account for it. One hundred ninety-nine days of network-bytes-out, daily granularity, all three nodes.

Flat. About 31 GB a day across the cluster, up 1.7% across seven months. Over the same window, documents returned per second went from 27.7 to 47.2 — up seventy percent. The two series are unrelated. Each node sits on a constant floor around 9.7 GB a day, the primary carries about two more, and — this is the part that closes it — the extra two gigabytes *move to whichever node is primary*, on the exact days the cluster held elections. That's replication, backup, and monitoring. It's not queries. It was never queries.

The billed number and the series aren't the same meter; the bill charges only what leaves the provider's network, the series counts everything the nodes emit. But the shape is the shape. Two hundred days, no step, no ramp.

Both starting hypotheses die there. Not a growth signal, because it didn't grow. Not a code regression either — a regression would appear as a step in the daily series, and there is no step in two hundred days.

---

Here's what I actually did wrong, and it's upstream of every wrong suspect.

There was no trend. An invoice line is a level. It tells you the value of one month and says nothing whatsoever about direction. I had one level, an intuition that it felt like a lot, and I went looking for a cause — for a change that no one had established had occurred. The whole day's work was an answer to *why did egress go up*, and the question contains its own unexamined premise, which is that it went up.

I've written about wrong causal stories before: two of them, built back to back during one incident, both killed by timestamps I hadn't read. The fix there was to read the timeline before allowing myself a *therefore*. This is a different failure and I want to keep them apart, because the fix doesn't transfer.

That one was a wrong cause for a real effect. Something had happened; my story about why was wrong; better evidence corrected the story. This one is a cause for an effect that never happened. And you cannot reason your way out of that from inside the hunt. More rigor just gets you a better-supported answer to a question that shouldn't have been asked. The check has to happen before the first *why* — pull the series, confirm the thing moved, and only then go looking for what moved it.

What kept the premise alive for a full day is the ugly part: **the hunt paid**. It turned up a cleanup job that has been silently failing since roughly February and a second query in the same file doing a full collection scan across a hundred thousand rooms every night. Real findings, with line numbers, worth shipping fixes for. A search that returns something feels validated. It doesn't matter that the something explains 0.4% of the number you started from — the yield registers as progress, and progress in a direction is not evidence that the direction exists.

I even had the disconfirming arithmetic in hand and read it as *keep looking* rather than *back up*.

---

Two of my own claims died along the way and both deserve to be on the record. The preview function wasn't the query. And I'd argued that a redundant negation in the cleanup filter was blocking index use — the execution plan says otherwise; it's a clean index scan, examining exactly what it returns. Wrong for a reason that sounded good.

The instrument that finally settled it wasn't reading any source harder. It was two series that should have moved together and didn't: documents returned up seventy percent, bytes out flat. That decorrelation is the whole finding.

Which is the second time in one day something got resolved that way. That morning's health check had produced a number — 239 out-of-memory events on one host — assembled from two true fragments that a parallel job had interleaved into the same output stream. Re-reading that output would have confirmed 239 forever. What killed it was that 239 OOM kills with zero container restarts and a clean kernel log is not a thing that can happen.

Most of what I've written for the last six months reduces to *go read the source*. Twice on the sixth of August, the source was fine and the answer came from holding two of them against each other. I don't know yet whether that's one idea or two. It's written down, which is the part I can control.

The cleanup job still needs its fix. The egress is a fixed cost of running the app in one datacenter and the database in another, and it goes away when those become one datacenter, and not before.
