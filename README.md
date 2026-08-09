# Dogtra 1900X — collar trainer

A teaching app for the Dogtra 1900X, written for training students. It runs on one machine, on its own, with nothing switched on but the
laptop.

## Opening it

Double-click `index.html`. That is the whole procedure. There is no server to
start, no address to type, no wifi. Everything the app needs — the manual text,
the 3D dog, the receiver and the transmitter — is inside this folder, and the
app was checked with the network log open: no request leaves the page.

If the machine cannot do 3D — an old laptop, a locked-down college computer,
a graphics driver having a bad day — the app notices at boot and gives you a
written reference instead of the 3D, with the same part names and the same
drill content in text. That path was tested; it is not a blank screen and it is
not a broken picture. It was also checked on a phone-width window (414 px
across): nothing spills off the side and both drills can be completed there,
with 3D and without.

There are five tabs across the top. The app only loads what you open — starting
it costs you the receiver model and nothing else.

## The five tabs

**1 · Receiver nomenclature.** The box that goes on the dog, turnable, with the
parts named and each name carrying the manual page it came from.

**2 · Transmitter nomenclature.** The same for the handset — the rheostat dial,
the safety lock, the B/P/T/L keys, the receiver selector.

Be aware of what tabs 1 and 2 currently are. They are the shell's holding view:
the real mesh, the real hotspots, the real written reference, but not a
purpose-built module the way tabs 3 and 4 are. The file that was meant to own
them (`nomen.js`) is an empty stub — twenty-three bytes, no code. The holding
view works and it teaches, but it is scaffolding, and one of the faults listed
at the bottom of this file lives in it.

**3 · Fit the collar.** This is the app. A dog in front of you and four
decisions to make — how high on the neck the strap sits, where round the neck
the receiver sits, how tight, and what to do about the coat. You set them, you
commit, and you are marked on all four, with the real-world cost of each
failure written out rather than a tick or a cross. The strap genuinely wraps the
neck of this animal; it is not a ring floating near it, and it does not pass
through. There is a cross-section panel that redraws as you move the sliders, so
you can see the coat under the strap and the two-finger gap on the far side at
the same time.

The fourth decision — the coat — is the one students skip and the one that
matters most. A dog whose coat is deeper than the contact posts are long feels
nothing at any level on the dial, and the handler's instinct is to climb the
dial. That is the failure this tab exists to prevent, and it is the order the
manual itself puts the checks in (p.43).

**4 · Find the working level.** The same dog, wearing the collar you were just
marked on, and a dial. Start at the bottom, step up one level at a time, and
stop the moment she tells you she noticed. Then commit to a number.

The point is that you are marked on the **protocol**, separately from whether
the number was right: opening above level 5, jumping more than two levels at a
time, pressing the same level over and over, pushing her far enough to flinch,
and whether you confirmed the level before committing to it. She does not answer
every press — at her own threshold she shows you on a bit over half of them, and
a small number of presses below anything she can feel still produce a glance or
a shift that has nothing to do with the collar. That is deliberate. It is why
the protocol says test a level again rather than climb, and a student who
commits off one sign is told so in the marking.

She also arrives in a different state each run — quiet morning, straight off
the van, two hours into a session — because the manual's own procedure ends by
saying to expect the level to move as arousal and distraction change (p.31).

Tabs 3 and 4 now show the same collar in the same place. That was checked
directly, both ways round: opening tab 3 first and then tab 4, and going
straight to tab 4 without ever opening tab 3. The strap lands in an identical
position either way. It used to not — tab 4 stood the dog in a collar that tab 3
marked down as a failure — and the two tabs taught opposite things about the
same collar on the same dog.

**5 · Collar conditioning.** The first four tabs are about the equipment. This
one is about the timing, and it is the only tab where the dog moves.

You are in a field with her on a line. Walk away — W and S move in and out, A
and D arc left and right — and she does not come with you, so the line takes up
and goes tight. Tap the nick (space, or the transmitter in the panel) the moment
it loads, keep tapping for as long as it stays tight — one, two, three, four —
and stop the instant it goes slack. Then change direction and do it again.

What is being marked is the **stopping**, because that is what teaches: this is
negative reinforcement, and the behaviour grows because something the dog wants
to end, ends. She learns from the tapping ending, not from any single tap — a
nick is over before she can respond to it, so there is no release for her to
time and none is marked. Each rep is graded on how quickly the first tap
followed the line loading, whether the taps kept coming while it stayed tight,
and above all on **overrun**: taps that land after the line has already dropped.
Four faults are called by name —

- a tap on a **slack line**, which corrects her for already being right;
- **one tap too many**, landing at the exact moment she got it right;
- **going quiet** mid-rep with the line still loaded, which takes the pressure
  off for nothing she did;
- **tapping too fast**, because taps stacked on each other are one long buzz
  rather than four pieces of information.

The line, not the dog, is the thing to watch: it is readable from anywhere in
the field, and by the time you have finished reading the dog you are two taps
late.

She learns. Understanding is a real number that grows from well-timed reps and
falls from the faults above, and it changes her behaviour: at the start
she leaves you within a second and braces against the line, and by the end she
checks in and turns before the line has loaded at all. Five stages take her from
an open field to changes of direction, a distraction, a six-metre long line and
finally off the line altogether, which is the whole object of the exercise.

The handler and the ground under him were generated for this app rather than
modelled by hand: a reference photograph, converted to a mesh, and a
photographed turf texture. Both are vendored into this folder like everything
else, so the "Works offline" badge in the header still means what it says —
nothing on tab 5 reaches the network either.

Worth knowing if you regenerate them. Rigging was requested and paid for twice
and came back with `skins: 0` both times, once through the image-to-3D model's
own `enable_rigging` flag and once through the dedicated rigging model, which
failed outright. So the handler's walk is rigged here in `condition.js`, the
same way the dog's is. His trouser legs also came back **fused into a single
column** — a flood fill below the hips returns one component, not two — so his
legs are separated by which side of his centreline a vertex falls on, with the
weight fading to nothing at the join so the fused part stays put while the
outsides of both legs swing.

The level dial is there, and climbing it is answered in the coaching rather than
in the marking — a dog that has not understood the question does not need a
bigger one.

Note that the twelve-second Constant cut-out (p.3) is **not** modelled on this
tab, and should not be: that is the Constant button's safety feature, and this
drill does not hold Constant. Holding the key down here does nothing after the
first press, and the keyboard's own auto-repeat is deliberately ignored — it
would tap about fifteen times a second and the drill would be marking the
operating system's rhythm instead of the student's.

---

## Where the manual and the course slides disagree

You asked for this specifically, so it gets its own section. The source of
record is the *1900X 1-DOG UNIT Owner's Manual* (Dogtra, 48 pages, downloaded
from dogtra.com). Where your course slides say something different, both are
below, named. Where the app teaches something that is neither — course
doctrine — that is said too.

**The dial goes to 100, not 127.** Manual p.7. Any slide showing 0–127 is the
**1900S**, which is a different generation of the same product family. The 1900S
also has a Nick/Constant toggle switch; your 1900X has one programmable front
button (p.13). If a search result or a slide shows a toggle, it is the wrong
manual.

**The transmitter on the older course slide is not your transmitter.** Same
cause as above. The slide's diagram is the earlier generation. Learn the layout
off your own unit and off the manual's p.8 overview, not off that slide.

**"Dog selector toggle" vs "Receiver Selector Toggle."** The course says *dog
selector*. The manual (p.8) calls it the **Receiver Selector Toggle (Up to
3-Dogs)**. Same switch, two names. The app leads with Dogtra's name and keeps
the course phrase as an alias so you still find it if you search for it. If an
examiner asks, you now know both.

**"Working level" is not the manual's phrase.** The course teaches *working
level* and *recognition level*. The manual (p.31) says *"the right stimulation
level"*, and describes what you are looking for as *"a mild response"*. The app
uses the course vocabulary, because that is what you will be examined on, and
states the manual's own wording once so the book does not catch you out.

While we are on p.31: the manual's entire procedure for finding the level is
three sentences — start at the lowest level and work up, you have it when she
gives a mild response, expect to adjust it as arousal and distraction change.
Everything finer than that in tab 4 is training doctrine, not manufacturer
instruction, and the app marks which is which. The manual does contribute some
of the signs itself (p.43): neck movement, head shaking, looking over the
shoulder, and a warning that the response may be very subtle. Those are cited to
Dogtra. Ear flick, glance away, never a yelp and never a flinch are course
doctrine and are marked as course doctrine.

**Thick coat: Dogtra's remedy is to clip the hair, not to fit longer posts.**
This is the important one. The troubleshooting entry "My dog is not reacting to
the system" (p.43) gives four checks in order: both units on; the strap tight
enough that both contacts touch skin; the contacts may be too short for a thick
or long coat, in which case **trim the hair on the dog's neck** until both
contacts reach skin; and only then, the level may be too low.

The manual nowhere says longer contact points are supplied, and no longer pair
is in the in-box list on p.6. Longer posts do exist as an aftermarket part and
you will be told about them, but they are not Dogtra's answer here and they are
not in your box. Note the order of those checks, because it is the whole lesson
of tab 3: Dogtra puts *contact with skin* above *raising the level*.

**Tab 3 gets this right. Tab 1 currently gets it wrong.** See the faults section
below — this is not fixed yet, and you will read a contradiction if you go
looking.

**What the contact points are made of — the manual contradicts itself.** On one
page, p.27, the *Improper Fit* paragraph credits "medical grade stainless steel
contact points and anti-microbial plastic", and the *Proper Fit* paragraph a few
lines later asks that "the anti-microbial plastic contact points" press against
the skin. Both on p.27. The posts on your own unit are plainly metal. The app
says metal posts in an anti-microbial plastic housing, and says out loud that
the manual is inconsistent, rather than quietly picking a side.

**The antenna asterisk does not match your unit.** On p.6 and p.21 the manual
marks both *Antenna* and *Antenna Hinge* with the note "Included only with 1900X
BLACK EDITION". Your unit is not a Black Edition — the Black Edition has a matte
black body *and* strap (p.10–11), and yours is two-tone tan and black — and yet
it plainly carries a screw-in antenna. Either the asterisk only covers the
detachable antenna accessory, or the standard unit ships with one anyway. The
app states what is observably on your collar rather than repeating the asterisk
as though it settled it. (The manual also misspells it "Antena" twice on p.6,
which is worth knowing if you are searching the PDF.)

**Hold on the Locate Light: the light keeps blinking.** The previous build of
this app said press-and-hold gives a steady light for up to twelve seconds. The
manual (p.17) says press and hold makes it **stay blinking** for up to twelve
seconds. Tap once for a continuous blink every four seconds, tap again to switch
it off. Corrected here.

Two numbers worth carrying in your head from p.3 and p.33: Constant cuts out
automatically at **12 seconds** as a safety feature, and the receiver's
indicator light flashing every **4 seconds** means on and ready.

---

## What this app cannot do, honestly

**A model is not a dog.** The signs in tab 4 are larger, cleaner and slower than
anything on the end of your lead. A real dog's response, in the manual's own
words, may be very subtle. Reading this well tells you the shape of the skill;
it does not tell you that you can read a dog.

**Two real signals are missing outright.** This mesh has no eyelids and no
tongue, so the dog cannot blink and cannot lick her lips. Both are genuine
stress signals and both belong on your list. The app names them as missing
rather than faking them, because a student who learns to watch for a blink that
the app invented has learned the wrong thing.

**One decision on the transmitter is unproven.** From your own photographs at
full resolution, one side rail carries a circled **B** above a circled **P** and
the other carries a circled **T** above a circled **L**. Which rail is the left
and which the right is *not* settled — the manual only says the keys are on both
the left and right sides (p.19). The app does not assert a side it has not
proven, and neither should you in an exam.

**The comparison against the professional benchmark is incomplete.** This app is
judged against BioDigital Human, a commercial 3D anatomy viewer. On static
presentation — how the animal reads, how the reading column ties to the object
in front of you, whether anything is actually taught — this app comes out ahead,
and the reasoning for that is on record. But the reviewer could not drive
BioDigital's own 3D at all in this environment: clicks on their model produced
no selection and no response. So four of the comparison's axes — how their
hotspots read under the pointer, how their list and 3D stay in sync, how their
cross-sections read, and how their model feels to turn — are **unverified**, not
passed. Nobody has honestly compared the two on feel.

Where BioDigital is still better, and this is not a close call: their model gets
the whole window. This app gives the 3D about 62% of a 1440-wide screen, and
less than that on a smaller one. See the faults below.

## What was measured rather than judged

Three things in this app are numbers taken off the actual 3D dog, not numbers
someone typed after looking at a picture. That distinction earned its place: the
same defect was fixed by eye three times and was still wrong each time.

**The neck frame.** A centreline from the base of the neck to just behind the
ears, plus a radial profile at seven heights by thirty-two angles, obtained by
firing rays at the mesh. That is what gives the true oval section of the neck.
The strap wraps the neck because of those numbers; without them it passes
straight through the animal.

**The pass band for height.** The range of the height slider that counts as a
correct fit was re-derived by slicing the mesh with the same ring planes the
collar is built on, at 180 angles, and finding where the neck actually stops.
The band is sliders 42 to 56, with the model answer at 49. The band before it
was set by eye and it **failed a correct collar and passed one slung round the
dog's jaw**.

**The framing and hotspot placement.** Where the camera sits when a part is
selected is solved against the real vertices of the mesh, and then floored a
second time against the hotspot anchors themselves, so a part never gets a
camera distance that leaves its own label off the edge of the pane.

All three are valid **only for this `dog.glb`**. They are measurements of one
mesh, not facts about dogs. Swap the model and every one of them has to be taken
again.

---

## Known faults, not yet fixed

These were found in the final check and are still in the build you have. None of
them is hidden.

**1 · Tab 1 teaches something the manual forbids, and contradicts tab 3.**
The worst of them. The *Removable Contact Points* entry in tab 1 says longer
posts are supplied for thick coats — and it carries a manual citation, so a
false product claim is dressed up as manufacturer instruction. Tab 3 correctly
says no longer pair is in the box and marks that choice as a failure. Same app,
two tabs, flatly contradicting each other on the same part. It also leaves out
the remedy Dogtra does give (clip the hair, p.43). It appears both in the 3D tab
and in the written no-3D reference, so it cannot be avoided by either route.
**Until it is fixed: tab 3 is right, tab 1 is wrong.** It is one clause of one
sentence and it is a ten-minute edit.

**2 · The height readout calls it "round the jaw" about four steps too early.**
Between height 62 and 65 the readout says the strap is round the jaw, and the
picture plainly shows it still on the neck. By eye it only starts biting into
the jaw around 66 and is unambiguously through it by 72. The sentence flips
because a derived number crosses a threshold, not because anything visible
happens. It used to be about five steps of this and is now about four, which is
an improvement and not a fix. Trust the picture over the sentence in that range.

**3 · "High on the neck, behind the ears" at the bottom of the pass band.**
At height 42 the strap is really sitting mid-neck with the housing down near the
throat. Defensible as a label for the whole band, overstated for that end of it.

**4 · Above height 66 the strap renders through the jaw and looks broken.**
It *is* the failure state and it should look wrong — but it looks like broken
geometry rather than a badly fitted collar, which undercuts the lesson.

**5 · On a smaller screen the marking card covers the dog.** At around
1180 × 820 — an iPad in landscape, a small laptop — the marking card becomes a
full-height overlay across the 3D pane, so you read "the strap is across the
cheek and the box is under the chin" with the dog hidden behind the words. At
1440 wide the two sit side by side and it is fine. If you have the width, use
it. This is the single biggest presentation gap against the benchmark.

**6 · Tabs 1 and 2 are scaffolding, not built modules.** As described above.
`nomen.js` is empty. The holding view is competent, but it is where fault 1
lives.

**7 · A stale comment in the code.** Developer-facing only, listed for
completeness: `fitting.js` still carries a note saying tab 4 does not read tab
3's answer and keeps its own. That has not been true since the two tabs were
brought into line, and whoever reads that comment next could reintroduce the
bug it warns about.

### What that adds up to

The 3D is in good shape and the two drills are complete and correct. The reason
not to put this in front of a paying student yet is fault 1: one sentence of
copy, under a manual citation, telling them something Dogtra does not say and
that the drill two tabs away will mark them down for believing.
