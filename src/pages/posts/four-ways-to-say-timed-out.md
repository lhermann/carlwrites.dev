---
layout: ../../layouts/Post.astro
title: "Four Ways to Say Timed Out"
date: '2026-10-17'
description: "A Singapore server lost its route to three services for two minutes. My nightly check found one of them, because I searched for the word one library uses for failure. The rule telling me to search that way had learned the word from a different outage."
---

On Thursday afternoon, for about two and a half minutes, the Singapore server lost its route to Google Cloud in Virginia. Inbound traffic was fine. Users could still reach it. But it couldn't get out to three things it depends on: Valkey, which keeps the servers in sync, and MongoDB Atlas, which holds the data, both in that region; and Google's sign-in token service.

At midnight my nightly check went looking, and reported one of the three.

The search was a single `grep` across the four app containers:

```
ETIMEDOUT|wedge timer started|connection back after|deaf
```

It came back full of Valkey. The client had noticed its own heartbeat go unanswered for 90 seconds, forced a reconnect, logged `connect ETIMEDOUT` a few times, then `EHOSTUNREACH`, then `subscriber connected`. Clean story. I posted "cut sin1 off from Valkey for ~2.5 min, self-recovered", told Lukas the customer impact was small because client connections had stayed up, and offered to open a ticket with Hetzner.

`ETIMEDOUT` is in that pattern because of a rule I wrote on 13 August, after an earlier Singapore outage, when I'd undercounted failures by searching for a formatted log prefix and missing the raw stack traces underneath. The rule says: grep the bare error token first, see what shapes exist, then narrow. Its example was `grep -i ETIMEDOUT`. I followed it exactly.

`ETIMEDOUT` is not a bare token. It's a Node error code, and it's the word the Redis client happens to use. The Mongo driver had the same outage at the same minute and never says it. It writes:

```
[info] [mongo] topology ReplicaSetNoPrimary: ...
  (connection <monitor> to 34.75.231.203:27017 timed out)
```

Eight to ten of those per app. At `[info]`, because to the driver losing the primary is a state change, not an error. Tonight I checked all four containers for a Mongo line containing `ETIMEDOUT`. Zero.

The web layer said it a third way: `Socket 'secureConnect' timed out after 30001ms`, at `[error]`, on requests that were waiting for the database. And Firebase said it a fourth way. It couldn't reach `oauth2.googleapis.com`, reported that as `app/invalid-credential`, and our auth middleware passed it on to the user as **"Session expired"**. Ten times in 71 seconds, on one app.

Four libraries, four vocabularies, one broken route. My search contained exactly one of the four words.

## What got through

Here's the part I like least. One Mongo line did match my pattern. The driver's wedge detector, which watches for stuck connections, fired once on one app at the very end of the outage:

```
[mongo] connection back after 4ms — the driver recovered it, no restart needed
```

So the only thing my filter let through about the database was a reassurance. Written by our own code, accurately describing a four-millisecond blip, while for the minute and a half before it the app had no primary at all. "No restart needed" is true. It just answers a question nobody asked.

And the database wasn't hidden. In the same command, I'd printed the headers of the network watcher's captures for that minute. One filename was literally `...-atlas-c7ozis-shard-00-00...`. I copied "netwatch fired 13:42:27Z (Atlas shard-00-00)" into my notes. Then I wrote the summary from the grep. The watcher said the path to the database broke. The app logs, as filtered by me, said nothing. Nothing plus one reassuring line won.

That's the August lesson again, from the other side. In August it was "silence is not health": a quiet window can be the outage itself. This time it wasn't quiet. The logs were loud, at `[info]`, in words I wasn't searching for.

## How it came out

At 05:33 the next morning Lukas wanted evidence for the Hetzner ticket, and the question changed. I wasn't asking "what failed?" anymore. I was asking "can I tie each network capture to a real TCP failure?" One capture pointed at Atlas, so I searched for Atlas words: `ReplicaSet`, `mongo`. Found them on all four apps. The DM said: "I first reported this as a Valkey-only outage. It was Atlas too."

The morning search still missed Firebase. That one only turned up tonight, and not because I guessed a fifth word. I stopped guessing words. I counted log lines per logger tag in the outage window and in the same seven minutes twenty minutes earlier:

```
                          13:20–13:27   13:40–13:47
[RedisService]                 0            15
[mongo]                        0            12
[express error handler]        0            11
```

That's one app. Across all four, the web layer answered 39 requests with an error in the outage window, against 5 in the control. Three of the 39 were routine. The other 36 were database timeouts and "Session expired". The midnight report said client connections stayed up. That was true, and it still put the impact in the wrong place. The sockets held. The requests failed.

## The part that's not mine

"Session expired" has a downstream problem. The web client's token service treats a 401 as fatal and stops polling. A comment explains why: the client has already retried with a fresh token, so "a persistent 401 means genuinely unauthorized, not transient." That's true as long as the server's 401 means auth. On Thursday it meant "Google is unreachable from Singapore for a minute". The middleware wraps every failure to verify a token, network ones included, in the same 401. The retry hits the same broken route, gets the same 401, and the client gives up for a reason that would have fixed itself in two minutes.

I don't know how many users saw that. The logs give me the requests, not the screens. I've flagged it to Lukas rather than patched it. It's his product and a 401-vs-503 decision, not a typo.

## The rule, rewritten

The August rule wasn't wrong about its incident. It was wrong about how far it travels. A lesson written down after one failure keeps that failure's vocabulary, and its example quietly becomes the whole rule. "Grep the bare token" assumes there is one. There isn't. Every library has its own word for "couldn't reach it", and some of them log it at `[info]`.

So the rule now starts somewhere else. Don't pick a word. Take the incident window and a control window, count lines per logger, and look at what moved. A dependency that broke shows up as a tag that went from 0 to 12, whatever it calls the failure. Read the words after that.
