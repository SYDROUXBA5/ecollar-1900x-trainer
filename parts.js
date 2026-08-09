/* ============================================================================
   DOGTRA 1900X — PART NOMENCLATURE
   Student reference

   Unit of record: "1900X · 1-DOG UNIT · 126072", read from the unit's own rear
   label (owner's photographs IMG_4200–4213).
   Source of record for names and numbers: 1900X 1-DOG UNIT Owner's Manual,
   Dogtra, 48pp. Every item carries a `manualRef` so a student can check the
   page. Where the course slide disagrees with the manual, the item carries a
   `slideNote` saying so — the disagreement is taught, not hidden.

   The 1900S is a DIFFERENT GENERATION: 0–127 dial, Nick/Constant toggle
   switch. This unit is 0–100 with one programmable front button. Any slide or
   search result showing 127 levels is the wrong machine.

   SIDE-BUTTON GLYPHS were read off the owner's photographs at full resolution
   (5712×4284) and match the manual's SIDE BUTTONS grouping (p.14, p.17):
       one rail : circled B (Boosted Constant) over circled P (XPP Vibration)
       one rail : circled T (Tone)             over circled L (Locate Light)
   Which rail is left and which is right is NOT settled by those photographs —
   the manual only says the four buttons sit "both on the left and right"
   (p.19). The copy therefore names each rail by its glyphs, never by a side.
   The one side the manual does state is the transmitter power key: bottom
   right (p.12). The USB-C socket sits on the opposite rail from it.

   `pos` is in NORMALISED MODEL SPACE: each loaded mesh is re-centred on its
   bounding box and scaled so its largest axis spans 1.0, giving a working
   cube of -0.5 … +0.5. Hotspots are therefore stable regardless of the scale
   the GLB arrives at. Axes: +X right, +Y up, +Z out of the front face.

   Positions were located on orthographic renders of the real meshes and then
   calibrated by raycasting the loaded geometry, so each one sits just proud of
   an actual surface. That matters: a point even slightly inside the mesh reads
   as permanently occluded and the marker never brightens. They are carried
   over verbatim from the previous build — same meshes, same numbers.

   `cam` is a viewing direction (not a position) — the camera is placed along
   this ray at the scene's framing radius when a part is selected.
   ========================================================================== */

(function () {
  'use strict';

  window.PARTS = {

    /* --------------------------------------------------------------------
       RECEIVER — the collar unit worn by the dog.
       -------------------------------------------------------------------- */
    receiver: {
      label: 'Receiver',
      sub: 'The collar unit — worn by the dog',
      // opening view: the whole collar, biased slightly down toward the housing
      home: { target: [0, -0.06, 0], distMul: 1.0 },
      items: [
        {
          id: 'strap',
          name: 'Strap',
          alias: 'collar strap',
          pos: [-0.352, 0.160, -0.010],
          cam: [-0.60, 0.50, 1.00],
          manualRef: 'Manual p.11, p.27, p.28',
          text: 'The black coated band that carries the receiver, threaded through the housing the way the moulded arrow points and closed by a side-release buckle. It sheds water and mud and will not hold odour the way leather or webbing does. Fit it high on the neck with the receiver on either side of the windpipe, snug enough that you can just slip two fingers underneath. A loose strap lets the housing slide, the contacts rub and lift off the skin, and the corrections go inconsistent.'
        },
        {
          id: 'contacts',
          name: 'Removable Contact Points',
          alias: 'contact points',
          pos: [-0.105, -0.195, 0.000],
          cam: [0.00, 0.90, 0.80],
          manualRef: 'Manual p.9, p.27, p.32',
          text: 'The two posts that screw into the housing and carry the stimulation to the dog\'s skin. Metal posts in an anti-microbial plastic housing — note that the manual contradicts itself on one page, crediting medical-grade stainless steel in one paragraph and anti-microbial plastic in the next; the posts on this unit are plainly metal. Both must sit on skin, never on top of coat. If the coat is too deep for the posts to reach, Dogtra\'s remedy is to clip the hair down at the two contact spots until both points touch skin (p.43) — no longer pair is in the 1900X box (p.6) and the manual never mentions post lengths. Non-stimulation contacts, which are supplied, let a dog be conditioned to wearing the collar before any stimulation.'
        },
        {
          id: 'power',
          name: 'On/Off',
          alias: 'receiver power button',
          pos: [-0.030, -0.268, 0.030],
          cam: [0.05, 1.00, 0.55],
          manualRef: 'Manual p.9, p.12',
          text: 'The rubber key set into the recessed panel directly between the two contact points. Hold it for two seconds to switch the receiver on or off — it answers with a tone and a solid green light on power-up, and a red light with a tone on power-down. Because it sits between the contacts it is easy to press by accident while you are fitting the collar, so confirm the unit is still on before you start the session.'
        },
        {
          id: 'indicator',
          name: 'Indicator Light',
          alias: 'LED indicator',
          pos: [-0.020, -0.330, 0.175],
          cam: [0.00, -0.15, 1.00],
          manualRef: 'Manual p.11, p.33',
          text: 'The translucent LED window on the outer face of the housing, near the debossed wordmark. It flashes once every four seconds to show the receiver is on and ready, and its colour reports the battery — green full, amber medium, red needs charge. It also mirrors your inputs: a fraction of a second on Nick, a steady glow for as long as you hold Constant, up to twelve seconds. That makes it the fastest check that the two units are actually paired and talking.'
        },
        {
          id: 'boot',
          name: 'USB-C Charging Port',
          alias: 'charging boot',
          pos: [0.115, -0.266, 0.030],
          cam: [0.15, 1.00, 0.45],
          manualRef: 'Manual p.9, p.36, p.44',
          text: 'The soft rubber plug sealing the receiver\'s USB-C charging port, on the same face as the contact points — the face that lies against the neck — so it stays clamped shut against the coat in use. It is what makes the IPX9K waterproof rating real, so push it fully home before the collar goes near water, mud or a swimming dog. Clean the port with a cotton bud and rubbing alcohol, and rinse the receiver with clean water after salt water.'
        }
      ]
    },

    /* --------------------------------------------------------------------
       TRANSMITTER — the handheld remote.
       The older Dogtra generation on the course slide does NOT match this
       unit; see the slideNote fields below. What follows is the 1900X as
       photographed and as the manual labels it.
       -------------------------------------------------------------------- */
    transmitter: {
      label: 'Transmitter',
      sub: 'The handheld remote — carried by the handler',
      // the raw mesh includes the lanyard cord, which is most of the bounding
      // box height — so open on the body rather than on the box centre.
      home: { target: [-0.03, -0.15, 0], distMul: 0.62 },
      items: [
        {
          id: 'antenna',
          name: 'Antenna',
          alias: 'aerial',
          pos: [0.098, 0.245, -0.018],
          cam: [0.35, 0.55, 0.90],
          manualRef: 'Manual p.6, p.21, p.29',
          text: 'The black whip that screws clockwise into the port on top of the housing and radiates the signal — three-quarters of a mile over open ground. Do not force it in or overtighten it. The manual marks the antenna as a Black Edition item, yet this unit is not a Black Edition and plainly carries one, so go by the unit in your hand. Range collapses when the antenna is covered, pointed down or pressed against your body: carry it clear and upright.'
        },
        {
          id: 'rheostat',
          name: 'Rheostat Dial',
          alias: 'intensity dial',
          pos: [-0.100, 0.120, 0.020],
          cam: [-0.45, 0.60, 0.80],
          manualRef: 'Manual p.8, p.18, p.31',
          slideNote: 'Any course slide showing 0–127 levels is the older 1900S; this unit is 0–100.',
          text: 'The knurled knob on top of the transmitter — Dogtra\'s name for the intensity control. It sets stimulation across the unit\'s 100 levels and shows the chosen level on the LCD, and it is placed to be turned by feel, without taking your eyes off the dog. The switch on top of the dial is the Safety Stimulation Level Lock: hold it more than two seconds to freeze the level and put a padlock on the screen, so the dial cannot be knocked up in your pocket.'
        },
        {
          id: 'selector',
          name: 'Receiver Selector Toggle',
          alias: 'dog selector toggle',
          pos: [-0.035, -0.012, 0.112],
          cam: [0.00, 0.35, 1.00],
          manualRef: 'Manual p.8, p.19',
          slideNote: 'The course slide calls this the dog selector toggle; the manual calls it the Receiver Selector Toggle (Up to 3-Dogs).',
          text: 'The small toggle on the upper front face, marked 1, 2 and 3, which chooses the receiver you are talking to. The 1900X ships as a one-dog system and expands to three, and the selected dog shows on the LCD. Check it first on a multi-dog yard — sending a correction to the wrong collar is a welfare failure, not an inconvenience. Running one dog, you can lock the toggle out: level 0, hold all four side buttons about ten seconds until the dog number disappears.'
        },
        {
          id: 'lcd',
          name: '1 1/8" LCD Display',
          alias: 'screen',
          pos: [-0.035, -0.260, 0.060],
          cam: [0.00, -0.10, 1.00],
          manualRef: 'Manual p.8, p.9, p.34',
          text: 'The screen on the lower front face, showing lock status, battery, the selected dog, the displayed stimulation level and the stimulation mode currently programmed to the front button. Read it before every session rather than trusting where you think you left the dial. Below about 10°F it can go dim or lag; the transmitter still works, so wait for the screen to catch up rather than turning the dial again and again — the output is changing even when the display is not.'
        },
        {
          id: 'frontbtn',
          name: 'Nick or Constant (Programmable)',
          alias: 'front button',
          pos: [-0.035, -0.148, 0.092],
          cam: [0.00, 0.10, 1.00],
          manualRef: 'Manual p.8, p.13',
          slideNote: 'The older course slide shows a two-position Nick/Constant toggle switch; the 1900X has one programmable button.',
          text: 'The wide ribbed button in the middle of the front face, sitting under the index finger in a normal grip — the one you will use most. It is programmable, not a switch: Nick gives a single brief pulse, Constant gives continuous stimulation while held, to a twelve-second safety cut-out. It leaves the factory on Nick. To change it, set the level to zero and hold this button and the side power key together for five seconds; the mode is shown along the top of the LCD.'
        },
        {
          id: 'boost',
          name: 'Boosted Constant — "B"',
          alias: 'boost button',
          pos: [-0.150, -0.135, -0.020],
          cam: [-1.00, 0.05, 0.35],
          manualRef: 'Manual p.8, p.14, p.16',
          text: 'The upper of the two buttons on the rail carrying a circled B over a circled P — which side of the housing that rail falls on is not settled by our photographs, so find it by the glyphs. It fires Constant at your displayed level plus a preset jump, so the dial on 5 with a boost of 5 delivers 10, for up to twelve seconds. Set the jump: level to zero, hold B five seconds until the light blinks, turn the dial, tap B to save.'
        },
        {
          id: 'pager',
          name: 'XPP Vibration — "P"',
          alias: 'pager',
          pos: [-0.150, -0.225, -0.020],
          cam: [-1.00, -0.05, 0.35],
          manualRef: 'Manual p.9, p.17',
          text: 'The lower button on that same B-over-P rail, marked with a circled P — Dogtra\'s Extreme Performance Pager, which vibrates the receiver for up to twelve seconds while you hold it. It applies no stimulation, which makes it the standard tool for recall work with deaf dogs and for conditioned attention at distance. It is also your quickest pairing test: press it, and if the collar buzzes the two units are talking.'
        },
        {
          id: 'tone',
          name: 'Tone — "T"',
          alias: 'tone button',
          pos: [0.152, -0.135, -0.020],
          cam: [1.00, 0.05, 0.35],
          manualRef: 'Manual p.8, p.17',
          text: 'The upper button on the rail carrying a circled T over a circled L, which sounds an audible tone at the receiver for up to twelve seconds while held. Like the pager it applies no stimulation, so it is usually conditioned either as a marker or as a warning that precedes a correction. Decide deliberately which of those your tone means and keep it consistent — a tone that means both teaches the dog nothing.'
        },
        {
          id: 'locate',
          name: 'LED Locate Light — "L"',
          alias: 'locate light',
          pos: [0.152, -0.225, -0.020],
          cam: [1.00, -0.05, 0.35],
          manualRef: 'Manual p.8, p.17',
          text: 'The lower button on that same T-over-L rail, which drives the 1000-lux LED in the receiver so you can find your dog in the dark. Tap once for a continuous blink every four seconds, and tap again to switch it off. Press and hold and it stays blinking for up to twelve seconds — blinking, not steady; that is the bit people get wrong. Switch it on as routine for dusk work and for water retrieves, where a dark dog vanishes fast.'
        },
        {
          id: 'chargeport',
          name: 'USB-C Charging',
          alias: 'charging port',
          pos: [-0.145, -0.330, -0.020],
          cam: [-1.00, -0.25, 0.35],
          manualRef: 'Manual p.8, p.36',
          text: 'The USB-C socket low on the rail opposite the power key, sealed under a moulded rubber flap. A flat battery takes about two hours; the lights glow red while charging and turn green when it is done, and the unit switches itself off for the process, so turn it back on before you go out. Seat the flap firmly afterwards — the transmitter carries the same IPX9K rating as the collar, and an open flap is the one thing that voids it.'
        },
        {
          id: 'txpower',
          name: 'On/Off',
          alias: 'transmitter power button',
          pos: [0.146, -0.330, -0.020],
          cam: [1.00, -0.25, 0.35],
          manualRef: 'Manual p.8, p.12, p.13',
          text: 'The small recessed key at the bottom right of the transmitter — the one side the manual states outright. Hold it two seconds to switch the transmitter on or off; a brief press toggles the LCD backlight instead. It also works as a modifier: with the level at zero, hold it together with the front button for five seconds to program that button between Nick and Constant. Pairing a receiver uses a different pair of keys — front button plus Boosted Constant.'
        },
        {
          id: 'beltclip',
          name: 'Belt Clip Channel',
          alias: 'belt clip',
          pos: [-0.035, -0.350, -0.092],
          cam: [0.00, -0.15, -1.00],
          manualRef: 'Manual p.6, p.37',
          text: 'The moulded groove running down the back of the housing. The supplied belt clip aligns with it and locks with two screws: tighten both firmly, but do not overtighten, because a stripped thread means the transmitter parts company with your belt mid-session. Many handlers also run the lanyard through the loop at the top as a second line of defence — cheap insurance for a unit that spends its life near water and mud.'
        }
      ]
    }
  };

})();
