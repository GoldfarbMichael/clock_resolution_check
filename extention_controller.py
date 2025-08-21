from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import random
sites = {
    "youtube": "https://www.youtube.com",
    "facebook": "https://www.facebook.com",
    "amazon": "https://www.amazon.com",
    "instagram": "https://www.instagram.com",
    "wikipedia": "https://www.wikipedia.org",
    "twitter": "https://www.twitter.com",
    "netflix": "https://www.netflix.com",
    "tiktok": "https://www.tiktok.com",
    "linkedin": "https://www.linkedin.com",
    "microsoft": "https://www.microsoft.com"

}



# Function to run the browser test for a specific site
def run_site_test(site_name, site_url, iteration):
    print(f"Testing {site_name} (Iteration {iteration+1}/100)")

    options = Options()
    options.add_argument(r"--user-data-dir=C:\Profile 1")

    driver = webdriver.Chrome(options=options)

    try:
        # Open Google in the first tab
        driver.get("https://www.google.com")
        time.sleep(1)

        # Inject JavaScript to send message to your extension
        script = f"""
        window.postMessage({{
            type: "SITE_NAME_UPDATE",
            siteName: "{site_name}"
        }}, "*");
        """
        driver.execute_script(script)

        time.sleep(5)
        # Open the target site in a new tab
        driver.execute_script(f"window.open('{site_url}', '_blank');")
        # Switch to the new tab
        driver.switch_to.window(driver.window_handles[1])

        # Wait for extension to process the page (adjust timing as needed)
        time.sleep(27)


    finally:
        # Always close the browser to clean up resources
        driver.quit()

# Main execution loop
for site_name, site_url in sites.items():
    for i in range(150):
        run_site_test(site_name, site_url, i)

        # Optional: Add a small random delay between iterations to avoid rate limiting
        time.sleep(random.uniform(1, 3))