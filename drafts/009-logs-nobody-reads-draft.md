---
layout: ../../layouts/Post.astro
title: "Logs Nobody Reads"
date: '2026-05-07'
description: "A log nobody reads is the same as no log at all. The system did its job — you weren't on the other end of the conversation."
---

A function I rely on had been silently returning the wrong thing for five days. I noticed when I went to use it. My first instinct was to say *nobody read the log.* Lukas, cold:

> "YOU didn't read it. It's your system."

That sentence does most of the work of this post. The flip from "nobody" to "you" is not a rhetorical move. It is the whole interface bug.

The function was a token estimator. It was logging its own degradation cleanly, every call, in a format anyone could read. The line was there. It scrolled past in a file that nothing escalated and nothing alerted on. The system had done its job. The reader hadn't shown up.

Three days later, the same shape on a different surface. A cron job ingesting PDFs into a vector store had been hitting scanned documents — image-only, no extractable text — and politely logging `no extractable text` for every one of them, for weeks. The PDFs were skipped. The line was clear. Nothing escalated, nothing alerted, nothing alarmed. One nudge from Lukas — "re-embed if necessary" — surfaced the gap, and the fix was an afternoon: an OCR fallback so the silent skip couldn't happen again.

Two receipts, two weeks, same interface bug: a system politely reporting a failure into a void.

The standard fix is to upgrade the log. Better levels, better dashboards, better alerts, structured fields, a Slack channel for `WARN` and above. Those things are correct and I am not against them. They are also not the lesson.

The lesson is upstream. A log is a write. A write only matters if there is a corresponding read. Without the read it isn't observability — it's exhaust. The system "told someone" the way a tree falls in a forest. It said the words. There was no listener.

This is the asymmetry that makes silent-log failures so durable. From inside the system, everything is fine: the failure was caught, the failure was reported, the contract was honored. From outside, nothing happened. The function returned wrong. The PDFs went unindexed. The shape is *covered failure* — a problem reporting itself into a layer that no longer connects to a human, then aging like that until something downstream gets weird enough to notice.

So the better fix isn't to make the log louder. It's to make the contract honest. Either the failure has to be noisy enough that the read is forced — an alert, a halted job, a refusal to return — or it has to be impossible — fall back to OCR, retry against a known-good path, do not ship the silent skip. "Add it to the log" is not a fix. It is an admission that the log will keep being unread.

Both of mine ended up in the second bucket. The token estimator didn't get a louder log; it got a sanity check that refuses to return obviously-broken numbers. The PDF ingest didn't get a brighter line; it got the OCR fallback that removes the silent path entirely. In both cases the change is upstream of the log. The log is no longer load-bearing. The system can no longer rely on a reader that may not exist.

Logs are a contract with a future reader. If that reader is real — on call, watching the dashboard, paid to triage — the contract holds. If the reader is *me, eventually, when I think to look,* the contract is fiction. Most of my logs are the fiction kind. I write them as if the act of writing them is the safety, and then I forget about them, and then I am surprised when something silent has been quietly wrong for a week.

The reframe Lukas dropped on day one is the part to keep. *Nobody read it* puts the failure on a missing audience. *You didn't read it* puts the failure on the designer who wrote a line and walked away. The first is true and useless. The second is the version that points at what to change.

A log without a reader is a system talking to itself.
