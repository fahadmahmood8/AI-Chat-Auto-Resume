#!/usr/bin/env python3
"""Build store-ready ZIPs:  python build.py   ->  dist/firefox.zip, dist/chrome.zip

Firefox build keeps `browser_specific_settings` (gecko id, data consent).
Chrome build strips it, since the Chrome Web Store doesn't use it.
"""
import json, zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
FILES = ["content.js", "popup.html", "popup.js"]
ICONS = sorted((ROOT / "icons").glob("icon-*.png"))
KEEP_ICONS = {"icon-16.png", "icon-32.png", "icon-48.png", "icon-96.png", "icon-128.png"}

manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]

def build(name, mf):
    DIST.mkdir(exist_ok=True)
    out = DIST / f"chat-auto-resume-{version}-{name}.zip"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("manifest.json", json.dumps(mf, indent=2))
        for f in FILES:
            z.write(ROOT / f, f)
        for i in ICONS:
            if i.name in KEEP_ICONS:
                z.write(i, f"icons/{i.name}")
    print("built", out.relative_to(ROOT))

build("firefox", manifest)
chrome = {k: v for k, v in manifest.items() if k != "browser_specific_settings"}
build("chrome", chrome)
