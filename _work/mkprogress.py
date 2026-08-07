#!/usr/bin/env python3
"""Regenerate progress.html from state.json. Run after every state edit."""
import json, os, html, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "state.json")))
e = html.escape

STATE_LABEL = {
    "queued":   ("Queued",        "q"),
    "building": ("Builder at work", "b"),
    "judging":  ("Critic judging",  "j"),
    "rework":   ("Back to builder", "r"),
    "done":     ("Critic picked ours", "d"),
}

def piece(p):
    lab, cls = STATE_LABEL.get(p["state"], ("—", "q"))
    rnd = f'<span class="rnd">round {p["round"]}</span>' if p.get("round") else ""
    crit = f'<p class="crit"><b>Critic:</b> {e(p["critic"])}</p>' if p.get("critic") else ""
    gap  = f'<p class="gap"><b>Biggest remaining gap:</b> {e(p["gap"])}</p>' if p.get("gap") else ""
    return f"""<li class="p {cls}">
      <div class="ph"><h3>{e(p['name'])}</h3><span class="pill {cls}">{lab}</span></div>
      <p class="sub">{e(p['sub'])} {rnd}</p>
      {crit}{gap}
    </li>"""

def gate(g):
    cls = {"pass": "d", "fail": "r", "pending": "q"}.get(g["state"], "q")
    mark = {"pass": "✓", "fail": "✗", "pending": "·"}.get(g["state"], "·")
    return f'<li class="g {cls}"><span class="gm">{mark}</span>{e(g["name"])}</li>'

done = sum(1 for p in S["pieces"] if p["state"] == "done")
tot = len(S["pieces"])

doc = f"""<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="20">
<title>E-Collar 1900X — build in progress</title>
<style>
:root{{--blue:#1560A6;--orange:#CF8B3E;--ink:#22262b;--mute:#6f7680;
--line:#e3e0d9;--cream:#F8F6F1;--card:#fff;--r:12px}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--cream);color:var(--ink);
font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
padding:32px 20px 72px}}
.w{{max-width:820px;margin:0 auto}}
header{{border-bottom:3px solid var(--blue);padding-bottom:18px;margin-bottom:26px}}
.kicker{{font-size:12px;letter-spacing:.14em;text-transform:uppercase;
color:var(--orange);font-weight:700;margin:0 0 6px}}
h1{{font:600 30px/1.2 Georgia,"Times New Roman",serif;margin:0 0 10px}}
.head{{font-size:18px;margin:0 0 8px}}
.note{{color:var(--mute);margin:0;font-size:15px}}
.meta{{margin-top:14px;font-size:13px;color:var(--mute)}}
.bar{{height:7px;background:#e8e4dc;border-radius:99px;overflow:hidden;margin:10px 0 4px}}
.bar i{{display:block;height:100%;background:var(--blue);width:{int(done/tot*100)}%}}
h2{{font:600 13px/1 system-ui;letter-spacing:.13em;text-transform:uppercase;
color:var(--mute);margin:32px 0 12px}}
ul{{list-style:none;padding:0;margin:0}}
.p{{background:var(--card);border:1px solid var(--line);border-left:4px solid #d8d4cc;
border-radius:var(--r);padding:14px 16px;margin-bottom:10px}}
.p.b{{border-left-color:var(--orange)}} .p.j{{border-left-color:#8a6fb0}}
.p.r{{border-left-color:#c4553d}} .p.d{{border-left-color:var(--blue)}}
.ph{{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}}
h3{{margin:0;font-size:17px;font-weight:600}}
.pill{{font-size:11.5px;font-weight:700;letter-spacing:.05em;padding:3px 9px;
border-radius:99px;background:#efece6;color:var(--mute);white-space:nowrap}}
.pill.b{{background:#fbeeda;color:#8a5a13}} .pill.j{{background:#efe8f6;color:#5b3f7d}}
.pill.r{{background:#fae6e1;color:#8f3324}} .pill.d{{background:#e3eef8;color:#0f4877}}
.sub{{margin:5px 0 0;color:var(--mute);font-size:14px}}
.rnd{{display:inline-block;margin-left:6px;font-size:12px;background:#efece6;
padding:1px 7px;border-radius:99px}}
.crit,.gap{{margin:9px 0 0;font-size:14px;padding-left:11px;border-left:2px solid var(--line)}}
.gap{{color:#8f3324}}
.g{{background:var(--card);border:1px solid var(--line);border-radius:9px;
padding:9px 13px;margin-bottom:6px;font-size:14.5px;display:flex;gap:10px;align-items:center}}
.gm{{width:17px;text-align:center;font-weight:700;color:var(--mute)}}
.g.d .gm{{color:var(--blue)}} .g.r .gm{{color:#c4553d}}
.log li{{font-size:14px;color:var(--mute);padding:6px 0 6px 17px;position:relative;
border-bottom:1px dotted var(--line)}}
.log li:before{{content:"";position:absolute;left:2px;top:14px;width:5px;height:5px;
border-radius:99px;background:var(--orange)}}
footer{{margin-top:34px;font-size:12.5px;color:var(--mute);text-align:center}}
@media(max-width:460px){{body{{padding:20px 14px 56px}}h1{{font-size:24px}}}}
</style>
<div class="w">
<header>
  <p class="kicker">Highland Canine Training · Dogtra 1900X</p>
  <h1>Build in progress</h1>
  <p class="head">{e(S['headline'])}</p>
  <p class="note">{e(S['note'])}</p>
  <div class="bar"><i></i></div>
  <p class="meta">{done} of {tot} pieces have beaten the bar · updated {e(S['updated'])} · this page refreshes itself every 20s</p>
</header>

<h2>Pieces</h2>
<ul>{''.join(piece(p) for p in S['pieces'])}</ul>

<h2>Hard gates</h2>
<ul>{''.join(gate(g) for g in S['gates'])}</ul>

<h2>Log</h2>
<ul class="log">{''.join('<li>'+e(x)+'</li>' for x in S['log'])}</ul>

<footer>Each piece gets a builder and a separate critic with fresh context.<br>
The critic opens BioDigital, compares blind with labels stripped, and sends it back until ours wins.</footer>
</div>
"""
out = os.path.join(os.path.dirname(HERE), "progress.html")
open(out, "w").write(doc)
print("wrote", out, f"({done}/{tot})")
