import json
import os
import re
import subprocess
from datetime import datetime, timezone
from xml.sax.saxutils import escape
import requests
import feedparser
from bs4 import BeautifulSoup

ETSY_RSS_URL = "https://etsy.com"
SITE_URL = "https://www.paperpressprintables.com"
JSON_PATH = "src/data/products.json"
IMG_DIR = "public/images"
OUTPUT_RSS = "public/rss.xml"

os.makedirs(IMG_DIR, exist_ok=True)

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

items = data["items"] if isinstance(data, dict) else data
existing_ids = {item["id"] for item in items}

# 1. Fetch any new listings from Etsy
feed = feedparser.parse(ETSY_RSS_URL)
new_count = 0

for entry in feed.entries:
    clean_title = re.sub(r"\s+by\s+FlyiStudio$", "", entry.title).strip()
    slug = re.sub(r"[^a-z0-9]+", "-", clean_title.lower()).strip("-")[:60]

    if slug in existing_ids:
        continue

    soup = BeautifulSoup(entry.description, "html.parser")
    price_el = soup.find("p", class_="price")
    price_match = re.search(r"([0-9]+\.[0-9]{2})", price_el.get_text() if price_el else entry.description)
    price = float(price_match.group(1)) if price_match else 2.99

    desc_el = soup.find("p", class_="description")
    text_desc = desc_el.get_text("\n").strip() if desc_el else soup.get_text("\n").strip()

    local_images = []
    for idx, img in enumerate(soup.find_all("img"), start=1):
        src = img.get("src", "").replace("il_340x270", "il_fullxfull").replace("il_570xN", "il_fullxfull")
        if src.startswith("http"):
            filename = f"{slug}-{idx}.jpg"
            filepath = os.path.join(IMG_DIR, filename)
            img_data = requests.get(src, timeout=15).content
            with open(filepath, "wb") as img_file:
                img_file.write(img_data)
            local_images.append(f"/images/{filename}")

    new_product = {
        "id": slug,
        "TITLE": clean_title,
        "DESCRIPTION": text_desc,
        "PRICE": price,
        "CURRENCY_CODE": "GBP",
        "QUANTITY": 999,
        "TAGS": [],
        "MATERIALS": ["SVG", "PNG (300 DPI)", "PDF"],
        "IMAGES": local_images,
        "VIDEO_URL": "",
        "SKU": ""
    }

    items.insert(0, new_product)
    existing_ids.add(slug)
    new_count += 1
    print(f"Added: {clean_title} (£{price})")

if new_count > 0:
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# 2. Generate public/rss.xml for Pinterest Auto-Publish
now_rfc822 = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
rss_items_xml = []

for product in items:
    title = escape(product.get("TITLE", ""))
    product_url = f"{SITE_URL}/#/product/{product['id']}"
    raw_desc = product.get("DESCRIPTION", "").strip()[:500]
    price = product.get("PRICE", "")
    currency = product.get("CURRENCY_CODE", "GBP")

    # Resolve absolute image URL for Pinterest
    images = product.get("IMAGES", [])
    first_img = images[0] if images else ""
    if first_img.startswith("/"):
        img_url = f"{SITE_URL}{first_img}"
    else:
        img_url = first_img

    img_tag = f'<p><img src="{escape(img_url)}" alt="{title}" /></p>' if img_url else ""
    enclosure_tag = f'<enclosure url="{escape(img_url)}" type="image/jpeg" />' if img_url else ""
    full_desc = escape(f"{img_tag}<p>Price: {price} {currency} — Instant Digital Download</p><p>{raw_desc}...</p>")

    rss_items_xml.append(f"""    <item>
      <title>{title}</title>
      <link>{escape(product_url)}</link>
      <guid isPermaLink="false">{escape(product['id'])}</guid>
      <pubDate>{now_rfc822}</pubDate>
      <description>{full_desc}</description>
      {enclosure_tag}
    </item>""")

rss_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://w3.org">
  <channel>
    <title>Paper &amp; Press Studio — Printable Editions &amp; SVGs</title>
    <link>{SITE_URL}</link>
    <description>Instant digital download 3D pop-up cards, Cricut SVGs, sublimation clipart, and printable planners.</description>
    <language>en-gb</language>
    <lastBuildDate>{now_rfc822}</lastBuildDate>
    <atom:link href="{SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
{chr(10).join(rss_items_xml)}
  </channel>
</rss>
"""

with open(OUTPUT_RSS, "w", encoding="utf-8") as f:
    f.write(rss_content)

print(f"Generated {OUTPUT_RSS} with {len(items)} products.")

# 3. Push updates to GitHub / Vercel
subprocess.run(["git", "add", "src/data/products.json", "public/images", "public/rss.xml"], check=True)
status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
if status.stdout.strip():
    subprocess.run(["git", "commit", "-m", "Sync products and update Pinterest RSS feed"], check=True)
    subprocess.run(["git", "push"], check=True)
    print("Pushed updates to GitHub and Vercel!")
else:
    print("Everything is already up to date.")
