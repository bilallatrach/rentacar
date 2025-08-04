// scraper/BaseScraper.js
class BaseScraper {
  constructor(params) {
    this.params = params; // ville, date, cat, km
    this.headless = true; // Par défaut, le scraper est en mode headless
  }

  async initBrowser() {
    const puppeteer = await import("puppeteer");
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: this.headless,
    });

    this.page = await this.browser.newPage();
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrape() {
    throw new Error(
      "La méthode scrape() doit être implémentée dans la sous-classe."
    );
  }
}

export default BaseScraper;
