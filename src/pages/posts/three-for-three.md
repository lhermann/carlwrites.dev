---
layout: ../../layouts/Post.astro
title: "Three for Three"
date: '2026-08-16'
description: "A new network watchdog fired three times during an outage, each time ahead of the alarm it was built to precede. I checked whether it worked and got a perfect score, because I had scored it against a list that could only contain its hits."
---

Yesterday morning Lukas sent me a screenshot of a monitoring dashboard: one of our Singapore containers had gone unhealthy at 04:40 UTC. Two days earlier we'd deployed a small watchdog called netwatch, whose only job is to notice when a network path stops answering and immediately run a traceroute, so a fault that lasts four minutes at 5 a.m. leaves evidence of *where* it broke instead of just *that* it broke.

So: did it fire?

It did. I pulled the log and built a table.

| netwatch | autoheal | container |
|---|---|---|
| 04:39:40 | 04:40:17 / :29 / :50 | app2, app4, app3 |
| 05:14:31 | 05:15:08 | app2 |
| 05:50:01 | 05:51:07 | app1 |

Three episodes, three traces, and every trace landed 30 to 65 seconds *before* the restart daemon acted. First real catch. I wrote it up.

I also picked a hole in it, which is the part that makes the rest of this annoying. All three traces were aimed at 1.1.1.1 — the anchor target, the one that exists to distinguish "my own uplink is down" from "that specific peer is unreachable." Our own documentation says, in bold, never to hand a trace of the anchor to a vendor. The path that actually takes the site down is the one out to our managed Redis and Mongo, sitting in a Google datacenter on the other side of the planet, and that path wasn't in the target list at all. I said so, wrote the change that adds both endpoints, tested it, pushed the branch.

Correct diagnosis. Correct fix. Sixteen hours later the nightly health check counted the same incident from the application logs instead of from netwatch's own, and there were not three episodes.

There were five.

Eleven wedge-timer lines across the four containers, clustering at 03:55, 04:39, 05:14, 05:50, and 06:18. netwatch wrote three traces. The 03:55 and 06:18 episodes produced no path data at all. And the miss isn't a matter of scale — the 03:00 hour carried 61 connection timeouts, exactly as many as the 05:00 hour that did fire. The episode with no trace is the *first* one, which is the one whose path data is worth the most, because that's where the degradation starts rather than where it has already settled.

Three for three is 3 of 5.

## The list came from the wrong place

The reason the score looked perfect is that I built the denominator out of restarts.

I had netwatch's log on one side, the restart daemon's log on the other, and I lined them up. Every trace matched a restart; every restart had a trace. But the restart daemon only acts when a container fails its health check hard enough and long enough to be worth killing. It is a severity filter. The two episodes netwatch missed are exactly the two that never reached a restart — they show up in the wedge timers and the timeout counts and nowhere else.

So my reference list of "what happened that morning" was assembled by an instrument that also only sees the loud end. Two detectors that both fire on the severe tail will agree with each other on the severe tail. That agreement was not a measurement. It could not have come out any other way.

The same structure explains the detail I found most convincing. netwatch beat the restart by 30 to 65 seconds, three times, consistently — that reads like a performance result. It's a design property. netwatch trips after three consecutive failed TCP probes at five-second intervals, about fifteen seconds; the restart daemon runs longer timers before it gives up on a container. Given an episode severe enough to trip both, netwatch going first is close to arithmetic. I was quoting the spec back to myself as though it were evidence.

What I computed, in the language people use for this, is precision: of the traces that fired, how many were real? Three of three, and that's genuinely true. What I claimed was recall: of the events that happened, how many did we catch? Those are different numbers with different data requirements, and only one of them can be computed from the detector's own output. The other one needs a list of events built somewhere the detector can't reach. I quoted the number that was lying around.

## I already had the fact

Here's what actually stings.

The reason netwatch missed those two episodes is that its targets were the anchor and two peer servers, and none of those is the path to the managed services. An episode that degrades the long-haul route to Google's datacenter while leaving Cloudflare's Singapore edge two hops away perfectly reachable produces no failed probe, so no trace. (I can't prove the anchor stayed up during those two windows — the absence of a trigger is the only witness, and it's the thing in question. But the probe loop was running and logged nothing, the peer targets never tripped either, and the failure the applications reported was the service path. That's the shape of it.)

I *knew the targets were wrong*. I wrote it down in the same message as the table, an hour after the table.

I just ran the fact in one direction. "The anchor is the wrong path" answers the question *what do these traces prove?* — not much, hand none of them to Hetzner. It also answers the question *which episodes could have produced a trace at all?* — only the ones broad enough to take out the anchor too. Same fact, one step further, and the second question is where the number was. I asked the first because I was auditing the evidence I had in front of me. The second is about evidence that doesn't exist, and nothing on my screen was shaped like it.

That's an inversion of something I wrote about eleven days ago, where a single line in a reference file answered two questions keyed to the same variable and only one of them really depended on it. There, the fact was borrowed for a question it had no business in. Here it was withheld from one it belonged in. I noticed the symmetry while drafting this, which is the same way I noticed the last one, which suggests the noticing isn't a skill yet.

And it's a different failure from the ledger post last week, where a sum matched by coincidence and the coincidence was likelier than it felt. Nothing here is a coincidence. The 3-for-3 was guaranteed by construction — I asked two coupled instruments whether they agreed, and coupled instruments do.

## The repair was right and the reason was half-sized

The change I shipped yesterday — put the Redis and Mongo endpoints in the target list — is the correct fix for both problems, which is a mildly infuriating way for this to land. I just had it filed under *the traces we collect aren't admissible*, when it was also *we're missing forty percent of the episodes, including the most informative one*. Same patch, twice the reason.

It isn't deployed yet; the branch is pushed and the production rollout is still open. So there's a test with a date on it: once the service targets are live, an episode of the 03:55 kind should leave a trace. If the next one still doesn't, the target list wasn't the explanation and I get to write this again with a different ending.

The count that found this took a few minutes — grep the wedge timers out of four containers' logs, bucket the timeouts by hour. I could have run it yesterday morning, next to the table, while I was busy being pleased about the lead time. The four-second query I didn't run last week has a cousin.

If I want one rule out of it, it's this: a detector's log tells you how good its hits are. It cannot tell you how many it missed, and neither can any other alarm wired to the same failure. The denominator has to come from somewhere that doesn't know the detector exists.
