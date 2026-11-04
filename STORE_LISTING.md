# Store submission cheat-sheet

Build the packages first: `python build.py` → `dist/…-firefox.zip` and `dist/…-chrome.zip`.

---------------------------------------------------------------------
## Mozilla Add-ons (AMO) — https://addons.mozilla.org/developers/
---------------------------------------------------------------------
Upload: `dist/chat-auto-resume-<version>-firefox.zip`
Distribution: **On this site** (listed) or **On your own** (unlisted, signed .xpi for GitHub Releases)
Source code upload: not required (no minification/build step); if asked, upload the same ZIP.

**Name:** Chat Limit Auto-Resume
**Summary (≤250 chars):**
Detects usage-limit waits on AI chat sites, shows a countdown bar, and clicks Continue automatically when the limit resets.

**Description:**
Hit a "try again in 2 hours" limit in the middle of a long AI conversation? Chat Limit Auto-Resume watches the clock for you.

• Detects limit/quota notices and parses the wait time (e.g. "in 2 hours 15 minutes", "resets at 3:30 PM")
• Shows a live countdown bar at the top of the page
• When time is up, clicks the Continue / Retry / Try again button
• Optional fallback: types "continue" and sends it (off by default)
• Optional tick-tock sound, adjustable safety buffer, 15-second test mode
• Survives page reloads; cancel any time with ✕

Works on claude.ai, chatgpt.com, gemini.google.com, perplexity.ai, chat.deepseek.com, grok.com and copilot.microsoft.com.

Privacy: no data is collected or transmitted. Page text is read locally only to find the limit notice. Only the "storage" permission is used for your settings.

It does not bypass any limit — it only waits for the site's own timer and then clicks the button you could click yourself. Not affiliated with or endorsed by any of the listed services.

**Categories:** Productivity, Other
**Support site / Homepage:** https://github.com/fahadmahmood8/AI-Chat-Auto-Resume
**Privacy policy:** link to PRIVACY.md on GitHub (or paste its text)
**License:** MIT

**Notes to reviewer:**
No account or login is needed. To test without waiting for a real usage limit:
1. Open https://claude.ai (or any listed site) — the login page is enough, content script still loads.
2. Click the toolbar icon → "Test 15s countdown". A bar labelled TEST counts down 15 s, then the extension looks for a Continue button.
3. "Scan page now" prints detection details to the console (enable "Debug logging" first).
If Firefox does not auto-grant site access, enable it in about:addons → the extension → Permissions.
The extension has no background script, no network access, no remote code and no minified code; data_collection_permissions is "none".

---------------------------------------------------------------------
## Chrome Web Store — https://chrome.google.com/webstore/devpanel
---------------------------------------------------------------------
Upload: `dist/chat-auto-resume-<version>-chrome.zip`  (one-time $5 developer fee)

**Name / Summary:** same as above (summary ≤132 chars — use the manifest description)
**Category:** Productivity
**Language:** English

**Single purpose:**
Detect usage-limit wait notices on supported AI chat websites, display a countdown, and click Continue when the wait is over.

**Permission justifications:**
- `storage`: saves the user's preferences (auto-click, sound, grace seconds, debug) locally.
- Host access (content script on claude.ai, chatgpt.com, chat.openai.com, gemini.google.com, www.perplexity.ai, chat.deepseek.com, grok.com, copilot.microsoft.com): needed to read the on-page limit notice, show the countdown bar, and click the Continue button on those sites. No other sites are accessed.

**Remote code:** No, I am not using remote code.

**Data usage disclosure (Privacy practices tab):**
- Check **Website content** only if the form asks about reading page text; state it is processed locally and not collected/transmitted. Do NOT tick any "collected" category you don't send off-device.
- Certify: not sold to third parties; not used for unrelated purposes; not used for creditworthiness/lending.
- Privacy policy URL: link to PRIVACY.md on GitHub.

**Assets you still need to create:**
- Screenshots: 1280×800 (or 640×400), 1–5 images, e.g. the countdown bar on a chat page and the popup
- Small promo tile: 440×280 (optional but recommended)
- Store icon 128×128: already in the package (`icons/icon-128.png`)

**Tip:** after the first submission, Chrome review typically takes a few days; broad host permissions can trigger a longer review, which is why the manifest lists only the 8 sites with `https://`.
