---
"@nuster/ui": patch
---

fix(kiosk): detect the machine screen from the proxy route instead of the User-Agent

The floating keyboard was enabled by comparing the User-Agent to cog/WPE's exact
string, so switching the kiosk engine (cog/WPE -> Chromium via the balena browser
block) silently disabled it, leaving the operator unable to type on the touchscreen.
The reverse proxy now tags kiosk requests with `x-nuster-kiosk` and strips it from
external traffic. The User-Agent check is kept as a fallback for devices still
running the previous nginx setup.
