from time import sleep
import os, uuid, pathlib, shutil, random
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import random
import requests

import json
from collections import OrderedDict

LOG_DIRS = [
    "data/3750_samples_for_trace_Xavia_windowed",
    "data/interpolated_data/3750_samples_for_trace_Xavia"
]
TARGET_TRACES_PER_SITE = 100

def _count_valid_jsonl_lines(path):
    """Count only well-formed JSON lines (skips partial/corrupt tail lines)."""
    if not os.path.exists(path):
        return 0
    good = 0
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                s = line.strip()
                if not s:
                    continue
                try:
                    json.loads(s)
                    good += 1
                except Exception:
                    # malformed line → ignore (likely a crash mid-write)
                    pass
    except Exception as e:
        print(f"[WARN] Could not read {path}: {e}")
    return good


def build_run_plan_and_dump(sites_dict, log_dir):
    """
    Returns:
      done_by_name: {site_name -> done_count}
      remaining_by_url: {site_url -> remaining}
    Also writes logs/run_plan.json for visibility/debugging.
    """
    os.makedirs(log_dir, exist_ok=True)
    done_by_name = {}
    remaining_by_url = OrderedDict()

    for site_name, site_url in sites_dict.items():
        jsonl_path = os.path.join(log_dir, f"{site_name}_samples.jsonl")
        done = _count_valid_jsonl_lines(jsonl_path)
        done_by_name[site_name] = done
        remaining = max(0, TARGET_TRACES_PER_SITE - done)
        if remaining > 0:
            remaining_by_url[site_url] = remaining

    # dump a human-friendly snapshot of what we plan to do
    plan_path = os.path.join(log_dir, "run_plan.json")
    try:
        with open(plan_path, "w", encoding="utf-8") as f:
            json.dump(remaining_by_url, f, indent=2, ensure_ascii=False)
        print(f"[INFO] Wrote run plan → {plan_path}")
    except Exception as e:
        print(f"[WARN] Could not write run plan: {e}")

    return done_by_name, remaining_by_url

sites = {
    "facebook": "https://www.facebook.com",
    "amazon": "https://www.amazon.com",
    "instagram": "https://www.instagram.com",
    "wikipedia": "https://www.wikipedia.org",
    "twitter": "https://www.twitter.com",
    "google": "https://www.google.com",
    "youtube": "https://www.youtube.com",
    "bing": "https://www.bing.com",
    "yahoo": "https://www.yahoo.com",
    "yahoo_japan": "https://www.yahoo.co.jp",
    "duckduckgo": "https://www.duckduckgo.com",
    "yandex": "https://www.yandex.ru",
    "naver": "https://www.naver.com",
    "msn": "https://www.msn.com",
    "outlook": "https://www.outlook.com",
    "gmail": "https://www.gmail.com",
    "office": "https://www.office.com",
    "openai": "https://www.openai.com",
    "reddit": "https://www.reddit.com",
    "whatsapp": "https://www.whatsapp.com",
    "tiktok": "https://www.tiktok.com",
    "linkedin": "https://www.linkedin.com",
    "pinterest": "https://www.pinterest.com",
    "quora": "https://www.quora.com",
    "vk": "https://www.vk.com",
    "discord": "https://discord.com",
    "telegram": "https://telegram.org",
    "snapchat": "https://www.snapchat.com",
    "weibo": "https://weibo.com",
    "qq": "https://www.qq.com",
    "line": "https://line.me",
    "netflix": "https://www.netflix.com",
    "twitch": "https://www.twitch.tv",
    "bilibili": "https://www.bilibili.com",
    "dailymotion": "https://www.dailymotion.com",
    "spotify": "https://www.spotify.com",
    "primevideo": "https://www.primevideo.com",
    "hulu": "https://www.hulu.com",
    "disneyplus": "https://www.disneyplus.com",
    "ebay": "https://www.ebay.com",
    "walmart": "https://www.walmart.com",
    "aliexpress": "https://www.aliexpress.com",
    "temu": "https://www.temu.com",
    "etsy": "https://www.etsy.com",
    "rakuten": "https://www.rakuten.co.jp",
    "mercadolibre": "https://www.mercadolibre.com",
    "flipkart": "https://www.flipkart.com",
    "shein": "https://www.shein.com",
    "taobao": "https://www.taobao.com",
    "tmall": "https://www.tmall.com",
    "jd": "https://www.jd.com",
    "alibaba": "https://www.alibaba.com",
    "bestbuy": "https://www.bestbuy.com",
    "target": "https://www.target.com",
    "costco": "https://www.costco.com",
    "booking": "https://www.booking.com",
    "airbnb": "https://www.airbnb.com",
    "tripadvisor": "https://www.tripadvisor.com",
    "expedia": "https://www.expedia.com",
    "skyscanner": "https://www.skyscanner.net",
    "uber": "https://www.uber.com",
    "apple": "https://www.apple.com",
    "adobe": "https://www.adobe.com",
    "github": "https://www.github.com",
    "stackoverflow": "https://stackoverflow.com",
    "cloudflare": "https://www.cloudflare.com",
    "dropbox": "https://www.dropbox.com",
    "notion": "https://www.notion.so",
    "figma": "https://www.figma.com",
    "slack": "https://slack.com",
    "teams": "https://teams.microsoft.com",
    "nytimes": "https://www.nytimes.com",
    "bbc": "https://www.bbc.com",
    "cnn": "https://www.cnn.com",
    "guardian": "https://www.theguardian.com",
    "reuters": "https://www.reuters.com",
    "bloomberg": "https://www.bloomberg.com",
    "foxnews": "https://www.foxnews.com",
    "washingtonpost": "https://www.washingtonpost.com",
    "wsj": "https://www.wsj.com",
    "cnbc": "https://www.cnbc.com",
    "dailymail": "https://www.dailymail.co.uk",
    "timesofindia": "https://timesofindia.indiatimes.com",
    "paypal": "https://www.paypal.com",
    "binance": "https://www.binance.com",
    "coinbase": "https://www.coinbase.com",
    "coinmarketcap": "https://coinmarketcap.com",
    "tradingview": "https://www.tradingview.com",
    "coursera": "https://www.coursera.org",
    "udemy": "https://www.udemy.com",
    "khanacademy": "https://www.khanacademy.org",
    "edx": "https://www.edx.org",
    "medium": "https://medium.com",
    "weather": "https://www.weather.com",
    "accuweather": "https://www.accuweather.com",
    "imdb": "https://www.imdb.com",
    "rottentomatoes": "https://www.rottentomatoes.com",
    "yelp": "https://www.yelp.com",
    "zillow": "https://www.zillow.com",
    "speedtest": "https://www.speedtest.net",

}


def _make_profile_dir():
    base = os.path.expanduser("~/.cache/selenium-profiles")
    pathlib.Path(base).mkdir(parents=True, exist_ok=True)
    prof = os.path.join(base, f"prof-{uuid.uuid4().hex}")
    pathlib.Path(prof).mkdir(mode=0o700)
    return prof



# Function to send filename and log directory to server
def send_metadata_to_server(filename, log_dir):
    try:
        response = requests.post('http://localhost:8080/set-metadata',
                                 json={'filename': filename, 'log_dir': log_dir},
                                 headers={'Content-Type': 'application/json'})
        print(f"Sent metadata {filename} in {log_dir} to server: {response.status_code}")
    except Exception as e:
        print(f"Failed to send metadata to server: {e}")

# Function to run the browser test for a specific site
def run_site_test(site_name, site_url, iteration, log_dir):
    print(f"Testing {site_name} in {log_dir} (Iteration {iteration+1}/100)")

    # Send ONLY filename to server (not full path)
    jsonl_filename = f"{site_name}_samples.jsonl"
    send_metadata_to_server(jsonl_filename, log_dir)  # Fixed: send just filename
    sleep(2)
    options = Options()
    # Set Chromium binary location
    # options.binary_location = "/usr/bin/chromium-browser"

    # Additional compatibility options
    options.add_argument("--headless=new")              # <-- headless
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--password-store=basic")
    options.add_argument("--use-mock-keychain")
    options.page_load_strategy = "eager"


    # unique throwaway profile => no locks
    tmp_profile = _make_profile_dir()
    print(f"[DEBUG] Using user-data-dir: {tmp_profile}")
    options.add_argument(f"--user-data-dir={tmp_profile}")

    # avoid rare port clashes
    options.add_argument(f"--remote-debugging-port={9222 + random.randint(0, 999)}")

    driver = None
    try:
        driver = webdriver.Chrome(options=options, service=Service())
        driver.set_page_load_timeout(60)
        # Determine which function to use based on log_dir
        if "windowed" in log_dir:
            measurement_type = "windowed"
        else:
            measurement_type = "not_windowed"
            
        # Pass measurement type as URL parameter
        driver.get(f"http://localhost:8080/index.html?measurement={measurement_type}")
        driver.execute_script(f"window.open('{site_url}', '_blank');")
        driver.switch_to.window(driver.window_handles[1])
        time.sleep(35)
    finally:
        if driver:
            driver.quit()
        shutil.rmtree(tmp_profile, ignore_errors=True)

# Main execution loop
# for site_name, site_url in sites.items():
#     for i in range(100):
#         run_site_test(site_name, site_url, i)

#         # Optional: Add a small random delay between iterations to avoid rate limiting
#         time.sleep(random.uniform(1, 3))

# Main execution loop for both directories
for log_dir in LOG_DIRS:
    print(f"\n=== Processing {log_dir} ===")
    
    done_by_name, remaining_by_url = build_run_plan_and_dump(sites, log_dir)

    for site_name, site_url in sites.items():
        already_done = done_by_name.get(site_name, 0)
        remaining = max(0, TARGET_TRACES_PER_SITE - already_done)

        if remaining == 0:
            print(f"[SKIP] {site_name}: already complete ({already_done}/{TARGET_TRACES_PER_SITE})")
            continue

        print(f"[RUN ] {site_name}: {already_done} done → collecting {remaining} more")

        # Execute ONLY the remaining iterations; iteration index is for logging only
        for i in range(remaining):
            iteration = already_done + i  # 0-based, aligns with what's already in the file
            run_site_test(site_name, site_url, iteration, log_dir)
            time.sleep(random.uniform(1, 3))