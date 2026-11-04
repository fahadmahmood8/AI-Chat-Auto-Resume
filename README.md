# ⏳ AI Chat Auto-Resume

> A lightweight browser extension that detects usage-limit waits on AI chat sites, shows a live countdown bar, and automatically clicks **Continue** when the limit resets.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Version](https://img.shields.io/badge/version-1.3.0-orange)
![Browsers](https://img.shields.io/badge/Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Firefox-supported-brightgreen)
![Permissions](https://img.shields.io/badge/permissions-storage%20only-lightgrey)

Hit a "You've reached your limit, try again in 2 hours 15 minutes" message in the middle of a long conversation? Instead of coming back to check, let the extension watch the clock and resume the chat for you.

---

## ✨ Features

- 🔍 **Automatic detection** – finds limit / quota notices on the page and parses the wait time.
- ⏱️ **Countdown bar** – a progress bar pinned to the top of the page showing the time remaining.
- 🖱️ **Auto-click Continue** – when the timer ends, clicks the *Continue / Resume / Retry / Try again / Regenerate* button.
- ⌨️ **Optional fallback** – if no button exists, types `continue` into the chat box and sends it.
- 🔊 **Tick-tock sound** – optional audible countdown.
- 🔄 **Survives page reloads** – the countdown is restored if you refresh the tab.
- ❌ **Cancel anytime** – click ✕ on the bar to stop auto-resume.
- 🧪 **Built-in test mode** – run a 15-second test countdown to verify everything works.
- 🔒 **Private** – no servers, no tracking, no data leaves your browser. Only the `storage` permission is used.

---

## 🌐 Supported sites

| Site | Domain |
|---|---|
| Claude | `claude.ai` |
| ChatGPT | `chatgpt.com`, `chat.openai.com` |
| Gemini | `gemini.google.com` |
| Perplexity | `www.perplexity.ai` |
| DeepSeek | `chat.deepseek.com` |
| Grok | `grok.com` |
| Microsoft Copilot | `copilot.microsoft.com` |

Want another site? See [Adding a new site](#-adding-a-new-site).

---

## 📦 Installation

> 🛒 **Store links:** _Firefox Add-ons — coming soon_ · _Chrome Web Store — coming soon_
> Until then, install manually from source (about a minute).

### Step 0 — Get the files

**Option A: Download ZIP**
1. Click the green **Code** button on this repo → **Download ZIP**.
2. Extract it to a permanent folder, e.g. `I:\github\AI Chat Auto-Resume`.

**Option B: Clone**
```bash
git clone https://github.com/fahadmahmood8/AI-Chat-Auto-Resume.git
```

> ⚠️ **Do not delete or move the folder after installing** (Chromium browsers load the extension directly from it).

Make sure the folder contains these files at its top level:

```
AI Chat Auto-Resume/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── icons/
└── build.py        (optional – only for building store packages)
```

---

### 🟢 Google Chrome

1. Open `chrome://extensions` in the address bar.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the folder that contains `manifest.json`.
5. (Optional) Click the 🧩 puzzle icon in the toolbar and **pin** *Chat Limit Auto-Resume*.

### 🦁 Brave

1. Open `brave://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the extension folder.
4. Pin it from the 🧩 extensions menu.

### 🔷 Microsoft Edge

1. Open `edge://extensions`.
2. Turn on **Developer mode** (left sidebar).
3. Click **Load unpacked** and select the extension folder.

### 🔴 Opera / Opera GX

1. Open `opera://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select the extension folder.

### 🟣 Vivaldi

1. Open `vivaldi://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the extension folder.

### 🌀 Arc, Chromium, and other Chromium-based browsers

Open the browser's extensions page (usually `chrome://extensions` or `<browser>://extensions`), enable **Developer mode**, click **Load unpacked**, and select the folder.

---

### 🦊 Mozilla Firefox

Firefox has two ways to install an unsigned extension.

#### Method 1 — Temporary install (easiest, any Firefox)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**
3. Select the `manifest.json` file inside the extension folder.

> ℹ️ Temporary add-ons are **removed when Firefox closes**. You'll need to load it again after each restart.

#### Method 2 — Permanent install (Firefox Developer Edition / Nightly / ESR)

Release Firefox only permanently installs *signed* add-ons. To keep it installed permanently:

1. Install [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) (or Nightly / ESR).
2. Open `about:config` → accept the warning.
3. Search for `xpinstall.signatures.required` and set it to **false**.
4. Zip the **contents** of the folder (so `manifest.json` is at the root of the zip) and rename it to `chat-auto-resume.xpi`.
5. Open `about:addons` → ⚙️ gear icon → **Install Add-on From File…** → choose the `.xpi`.

#### Firefox: grant site access

Firefox may not automatically grant access to the supported sites for Manifest V3 extensions (requires Firefox 140 or newer). If the countdown bar never appears:

1. Open `about:addons` → **Chat Limit Auto-Resume** → **Permissions** tab.
2. Enable **Access your data for sites in the claude.ai / chatgpt.com / … domains** (or *Always allow* for all listed sites).
3. Reload the chat tab.

---

### 🍎 Safari

Not supported at the moment. Safari requires converting the extension with Xcode (`xcrun safari-web-extension-converter`) and an Apple developer account.

---

## 🚀 Usage

1. **Install** the extension using the steps above.
2. **Reload** any already-open chat tabs (content scripts only attach on page load).
3. Chat normally. When a limit message with a wait time appears, a bar shows up at the top:

   ```
   ⏳ Chat resumes in 01:59:42
   ```
4. When the timer hits zero the extension waits for a **Continue / Retry** button and clicks it automatically.
5. Click **✕** on the bar at any time to cancel.

> 💡 **Tip:** Click anywhere on the page once after it loads. Browsers block audio until you interact with the page, so this is what enables the tick-tock sound.

### Try it first

Open the extension popup on a supported chat tab and press **Test 15s countdown**. A bar labelled 🧪 TEST will count down for 15 seconds so you can confirm the extension is working on that site.

---

## ⚙️ Settings

Click the extension icon to open the popup.

| Setting | Default | What it does |
|---|---|---|
| **Auto-click Continue/Retry when time ends** | On | Clicks the first visible Continue / Resume / Retry / Try again / Regenerate button. |
| **If no button: type "continue" and send** | Off | Fallback after ~24 s if no button appears: types `continue` into the input and sends it. |
| **Tick-tock sound** | On | Plays a soft tick every second while counting down. |
| **Debug logging** | Off | Prints detection details to the page console (F12). |
| **Extra seconds to wait after reset** | 5 | Safety buffer added to the detected wait time. |

Buttons in the popup:

- **Test 15s countdown** – runs a fake countdown to verify the bar and logic.
- **Scan page now** – scans the current page immediately and prints every candidate message to the console.

---

## 🧠 How it works

1. A content script runs on the supported sites and watches the DOM (via `MutationObserver` plus a 5-second poll).
2. It looks for short UI text that mentions a limit (*limit, quota, reached, resets, try again…*) **and** contains a number. Your own messages and the AI's replies are ignored.
3. It parses the wait time from the text:
   - **Relative:** `in 2 hours 15 minutes`, `try again in 45 min`, `wait 30 seconds`
   - **Absolute:** `resets at 3:30 PM`, `until 10:00 PM`, `try again at 15:00`
4. It starts a countdown (wait time + grace seconds), shown in a Shadow-DOM bar so site CSS can't break it.
5. When the timer ends it looks for a Continue-style button every 3 seconds (up to ~2 minutes) and clicks it.

Countdown state is kept in `sessionStorage` per site, so a reload doesn't lose it.

---

## 📝 Changelog

**1.3.0**
- Keeps watching after a resume: no more blind 90-second pause. It remembers the banner it just handled and ignores only that one, so a new or changed limit starts a countdown immediately.
- Waits for the old banner to disappear (or change) before re-arming; after 20 minutes it re-arms anyway.
- Stale times are ignored: "until 10:00 PM" seen at 10:02 PM no longer starts a 23-hour countdown.
- Countdown bar no longer stays green from the previous run.
- Console shows "watching again" / "limit banner gone" when debug logging is on.

**1.2.0** – Initial public release.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| Popup says *"No reply from this tab"* | Open a supported site and **reload that tab** after installing/updating the extension. |
| Bar never appears | Click **Scan page now**, then press `F12` → Console and look for `[Chat Auto-Resume]` messages. On Firefox, check [site access](#firefox-grant-site-access). |
| A second limit didn't start a new countdown | After a resume the extension waits for the old banner to clear (max 20 min). Press **Scan page now** and send the console output in an issue. |
| "could not parse a wait time" in console | The site's wording isn't recognised. Open an issue with the exact message text. |
| Nothing is clicked when time ends | The site may use a different button label. Enable the **type "continue"** fallback, or report the button text. |
| No tick sound | Click once anywhere on the page; browsers require a user gesture before audio. |
| Extension disappears after Firefox restart | You used a temporary install. See [permanent install](#method-2--permanent-install-firefox-developer-edition--nightly--esr). |
| Chrome shows "Disable developer mode extensions" popup | Harmless; dismiss it. It's shown for all unpacked extensions. |

---

## ➕ Adding a new site

Edit `manifest.json` and add a pattern to `content_scripts[0].matches`:

```json
"https://example-chat.com/*"
```

Then reload the extension from `chrome://extensions` (or `about:debugging` in Firefox) and refresh the chat tab.

---

## 📦 Building store packages

```bash
python build.py
```

Creates `dist/chat-auto-resume-<version>-firefox.zip` (includes the Firefox add-on ID and data-collection declaration) and `dist/chat-auto-resume-<version>-chrome.zip`. See [`STORE_LISTING.md`](STORE_LISTING.md) for ready-to-paste store descriptions, permission justifications and reviewer notes.

Optional lint for Firefox: `npx web-ext lint --source-dir .`

---

## 🔐 Privacy & permissions

- **Permission used:** `storage` only (to save your popup settings), plus access to the supported chat sites over HTTPS.
- **No network requests**, analytics, or remote code.
- Page text is read **locally** only to detect the limit notice and is never stored or sent anywhere. Full text: [PRIVACY.md](PRIVACY.md).

---

## ⚠️ Disclaimer

This project is an independent, community tool and is **not affiliated with** Anthropic, OpenAI, Google, Perplexity, DeepSeek, xAI, or Microsoft. It only automates clicking a button you could click yourself, after the site's own wait has ended; it does not bypass or evade any usage limit. Websites change their UI often, so detection may break without notice. Use at your own risk and respect each service's Terms of Use.

---

## 🤝 Contributing

Issues and pull requests are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-change`
3. Commit and push
4. Open a Pull Request

When reporting a detection problem, please include the browser, site, the exact limit message text, and the console output from **Scan page now**.

---

## 📄 License

Released under the [MIT License](LICENSE).
