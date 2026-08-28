---
"@nuster/ui": patch
---

fix(io): make the IO screen safe to operate by touch

On the machine screen it was too easy to actuate the wrong output. The rows were
about 28px apart, the switch itself only 24px tall, and neighbouring labels often
differ by a single word — "Pulvérisation métallisation haute / millieu / bas".
Nothing gave the eye an anchor, and nothing gave the finger any margin.

Rows are now grouped by the category each gate already carries (`met#plv-high` →
`met`), under the `gates.categories.*` headings the machine specs already
provide. Rows are 56px tall and separated, so two adjacent switches sit 56px
apart instead of 28. The tappable area of a switch is grown to 44×56px with a
pseudo-element, which leaves 6px of dead space above and below it — big enough
to hit, still impossible to hit from the next row.
