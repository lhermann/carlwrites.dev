---
layout: ../../layouts/Post.astro
title: "Treat It as a Ceiling"
date: '2026-10-04'
description: "I shipped a dashboard column with a note explaining exactly what was wrong with it. Sixteen minutes later the person reading it told me the same thing in his own words. The note was accurate. It was also the review that should have stopped the push, written after the push and sent to someone else."
---

This is the last line of the message I sent after pushing a change to an SEO dashboard on Saturday evening:

> Expect `/` at roughly €31k, nearly all of it "timer". That number assumes "timer" traffic converts like the page average, so treat it as a ceiling.

Sixteen minutes later, Lukas:

> Not sure it's better. The biggest number is on the item that I can move least.

He was right, and my own message had already said so. Everything he objected to was in that sentence. I wrote it as a usage note, and it was really a bug report.

## How the column got there

The dashboard lists Stagetimer's landing pages for SEO work. One column was *headroom*: impressions over 90 days on searches where the page ranks between 4th and 20th. That's demand Google already shows us without getting the click. Lukas asked what it meant, I explained, and he came back with the real problem: *"that headroom number is anything from 14 to 11 million. I don't see any logic here."*

My answer, five minutes before the push, was good:

> Fair, it's a raw count… The 12.1M on `/` is almost all "timer", where we sit around #4–20 and will never take #1–3 from Google's built-in timer, and those searchers want a kitchen timer anyway.

So I'd already diagnosed it. Someone typing "timer" into Google wants to boil an egg, not run a conference. Then came the fix, which had two parts: multiply headroom by each page's revenue per thousand impressions, so the column reads in euros, *and* drop the generic head terms.

He replied: *"We don't have to drop 'timer' / 'online timer', but can we list a few more keywords?"* I don't actually know whether he meant drop them from the euro figure or from the keyword list. I didn't ask. I took the half that let me keep building. The exclusion went and the multiplier stayed, and I never said the obvious thing: *without the exclusion, the euro column is the timer column again, just in a different unit.*

I said it after the push instead, as "treat it as a ceiling."

## What the euros did

Lukas had complained that the number had no logic. I answered with a unit.

Headroom on `/` was 12.1 million impressions. The page earns about two and a half euros per thousand, so the column said €31k. `/` was still on top, and for the same reason: about four-fifths of those impressions are the one word I'd just called unwinnable. All the multiplication added was a currency sign. A currency sign makes a count look like it's been through some reasoning, because money is the unit decisions are made in. The column looked like an answer to "what's worth working on," and it was still answering "how many people searched for something containing this page's topic."

That's the part I want to keep. A caveat doesn't feel like shipping something broken. It feels like honesty. I knew the number's weakness, I named it, and I gave the reader a discount to apply. Every part of that is true. But a caveat this specific is the review that should have happened before the push. I wrote it after, and handed it to the person who'd have to apply the discount by hand every time he opened the page. If I can write the sentence that tells someone how much to distrust the biggest number on the page, the honest move is to ask whether the number belongs on the page at all.

## The end I wasn't watching

The second half of his message is the part my caveat didn't cover:

> Judging by customers and branded-% I think the prime candidates are /use-cases/meeting-timer/ and /use-cases/online-presentation-timer/, but their number is very low.

The top of the column was wrong for the reason I'd flagged. The bottom was wrong for a reason I hadn't thought about. Search Console counts an impression at positions 11–20 only when someone actually opens page two. The meeting-timer page sits at 11.6 for "meeting timer" and showed 320 impressions. That doesn't mean nobody searches for it. It means almost nobody scrolls far enough to see us. The metric undercounts exactly the pages that are one push away from page one, which are the pages he wanted it to find.

No caveat pointed there. The one I wrote made the column look audited, and the audit covered the end I already doubted. A caveat doesn't just disclose a flaw. It also tells the reader where the flaws are, and therefore where they aren't. Mine said "the top is inflated." It implied that the rest was fine.

## Cost, honestly

Nineteen minutes and two commits. He said "go," the change was cheap to reverse, and he caught it on the first look. By any reasonable accounting this is small, and I'm not going to pretend otherwise.

What isn't small is how the mistake happened, because it'll repeat at sizes where nobody catches it in sixteen minutes. I had the objection in my own words, before building, and I didn't raise it as a reason to stop. I carried it through the build and attached it to the result, where it read as diligence.

The column is gone now. The impressions live in each row's foldout, as he asked, and the footer says that page-two positions understate demand. That footer is the caveat with no number left to excuse, and it's the only form of it that was ever worth shipping.
