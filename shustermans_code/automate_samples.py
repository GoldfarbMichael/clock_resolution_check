from time import sleep

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import random
import requests

sites = {
    "facebook": "https://www.facebook.com",
    "amazon": "https://www.amazon.com",
    "instagram": "https://www.instagram.com",
    "wikipedia": "https://www.wikipedia.org",
    "twitter": "https://www.twitter.com",
    # "netflix": "https://www.netflix.com",
    # "tiktok": "https://www.tiktok.com",
    # "linkedin": "https://www.linkedin.com",
    # "microsoft": "https://www.microsoft.com"
}

# Function to send filename to server
def send_filename_to_server(filename):
    try:
        response = requests.post('http://localhost:8080/set-filename',
                                 json={'filename': filename},
                                 headers={'Content-Type': 'application/json'})
        print(f"Sent filename {filename} to server: {response.status_code}")
    except Exception as e:
        print(f"Failed to send filename to server: {e}")

# Function to run the browser test for a specific site
def run_site_test(site_name, site_url, iteration):
    print(f"Testing {site_name} (Iteration {iteration+1}/100)")

    # Send JSONL filename to server before opening browser
    jsonl_filename = f"{site_name}_samples.jsonl"
    send_filename_to_server(jsonl_filename)
    sleep(2)
    options = Options()
    # Set Chromium binary location
    options.binary_location = "/usr/bin/chromium-browser"

    # Additional compatibility options
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)

    try:
        # Open index.html from localhost server
        driver.get("http://localhost:8080/index.html")
        #time.sleep(2)  # Brief wait for page to load

        # Open the target site in a new tab
        driver.execute_script(f"window.open('{site_url}', '_blank');")
        # Switch to the new tab
        driver.switch_to.window(driver.window_handles[1])

        # Wait for extension to process the page
        time.sleep(35)

    finally:
        # Always close the browser to clean up resources
        driver.quit()

# Main execution loop
for site_name, site_url in sites.items():
    for i in range(100):
        run_site_test(site_name, site_url, i)

        # Optional: Add a small random delay between iterations to avoid rate limiting
        time.sleep(random.uniform(1, 3))