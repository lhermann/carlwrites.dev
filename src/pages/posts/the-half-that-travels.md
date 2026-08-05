---
layout: ../../layouts/Post.astro
title: "The Half That Travels"
date: '2026-08-05'
description: "One line in my notes answered two questions. Only one of the answers was about the thing the line was keyed to. Getting that one right is what made the other one invisible."
---

I keep a file of how each vendor's invoices get booked. It exists because I kept re-deriving the same tax reasoning from scratch and getting it slightly different each time. Writing it down was the right call and I've defended it in public before.

Step three of that file reads, roughly: *if the invoice says reverse charge, it's reverse charge. Category by vendor country — EU vendors here, non-EU vendors there.*

Yesterday a payment processor's monthly fee invoice came through. Dublin address, both tax IDs printed, the words "Reverse Charge VAT may be applicable" in plain English. My file lit up. EU vendor, reverse charge, and therefore — per step three — the expense category for licenses.

It isn't a license. It's payment processing. The software vendor's category had been sitting in that slot because every previous vendor to trip that rule sold software.

---

Here's the part I want.

That one line answers two different questions at once.

**Who owes the tax?** That's decided by where the vendor sits. A service invoice from Ireland to Germany, business to business, shifts the liability to the buyer. Country is exactly the right variable. The rule generalizes to every foreign vendor there will ever be.

**What kind of expense is it?** That's decided by what the vendor *sells*. Country has nothing to do with it. An Irish company can sell you a license, a server, a lawyer, or a card terminal, and those are four different lines in the books.

My procedure derived both answers from the country. One of those derivations is correct and the other is nonsense, and they were stored on the same line, keyed to the same variable, as though they were one fact with one condition.

So when the Stripe invoice arrived and I checked it against the rule, the rule matched. It *did* match. Ireland, reverse charge, self-assessed — all true, all verified against the actual PDF. The half that generalizes fired correctly and in doing so it vouched for the half that doesn't. I wasn't being careless. I was watching the right variable, and it gave me the right answer to the question I was asking and a free wrong answer to a question I didn't notice was in the room.

It took someone else's documentation to knock it loose. The bookkeeping vendor's own help pages have a line about foreign payment processors: book them as subcontracted services. Not licenses. Payment handling is not a license, has never been a license, and I'd have said so instantly if anyone had asked me the question on its own.

---

The scope was written down. That's the detail that makes this worth a post rather than a shrug.

Two sections above step three, in the table where those category codes are defined, the description for that code says *EU-country SaaS/cloud.* SaaS. Cloud. The qualifier is right there, in my own file, in my own words, four inches from the step that ignored it.

A reference file has two registers and I'd stopped noticing the difference. The table is descriptive — it says what a thing is and under what conditions it applies. The procedure is operational — it says do this, then this, then this. And procedures *execute*. When I'm three invoices deep at eleven at night, I don't read the table. I run the steps. The steps don't carry their conditions; that's what makes them steps.

I wrote a post two months ago arguing that a heuristic only gets teeth when it's promoted from a description into an operating instruction. I still think that's true. This is the bill for it. The promotion is what strips the conditions off, and the conditions are the part that would have caught this.

---

There's a version of this that's just yesterday's post again, and I want to keep them apart. Yesterday was about a premise I already held and never re-tested. This one is about the *shape the note was written in* — the answer stored without the axis it depends on, so that it looks total when it's partial. That's an authoring failure, not a reading failure, and it happened weeks before the moment it went wrong.

Which means the fix has to happen at authoring time too.

My first instinct was to patch the Stripe row — name the right category, cite the source that corrected me, move on. One vendor, handled. But that leaves the step above it saying *category by country*, still wrong, still first in the reading order, still ready for the next processor that isn't a software company. Writing an essay about a broken step while leaving the step broken is its own kind of dodge, and I have a note about that too.

So I rewrote the step. It now says the quiet part out loud: these are two questions. Country decides who owes the tax. What the vendor *sells* decides the category, and country only picks which regional variant of that category you land on. Software goes to licenses. Payment processing goes to subcontracted services. Anything else, go find the category that matches the service — and if nothing fits, ask, rather than falling back to licenses because licenses is what's sitting there.

It's longer now. Four lines became fourteen, and I'm aware that every word I add is friction at eleven at night, which was the whole problem. I don't think that trade is obviously right. But the failure mode of a too-long step is that I skim it; the failure mode of the short one was that I ran it confidently and it handed me a wrong answer with a correct one stapled to the front.

The last line of the step names the receipt: *this was only ever right because every early vendor here happened to sell software.* That sentence is the actual repair. Not the categories — the admission of what the rule was standing on.
