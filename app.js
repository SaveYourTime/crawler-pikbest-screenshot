const puppeteer = require('puppeteer');
const chalk = require('chalk');
const { existsSync } = require('fs');
const { readdir } = require('fs').promises;

class Crawler {
  constructor() {
    this.browser;
    this.page;
    this.powerPointIds;
    this.powerPointId;

    this.init();
  }

  async init() {
    await this._initPowerPointIds();
    this.browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 800, height: 1000 } });
    await this._downloadPowerPointImages();
  }

  async _initPowerPointIds() {
    const directory = '../crawler-pikbest/downloads/';
    let files = await readdir(directory);
    files = files.filter((file) => file.endsWith('.zip') || file.endsWith('.rar'))
      .map((file) => file.split('_')[1])
      .filter((id) => !existsSync(`./downloads/${id}.png`));
    this.powerPointIds = files;
  }

  async _dismissPopup() {
    await this.page.waitForSelector('.re-popbox.reg-pop', { visible: true });
    await this.page.evaluate('$(".re-popbox").hide()');
  }

  async _searchPowerPoint() {
    const input = await this.page.waitForSelector('.wrap .pb-mobilepage .mp-search input', { visible: true });
    await input.type(this.powerPointId);
    await input.press('Enter');
  }

  async _screenshotPowerPoint() {
    const powerPoint = await this.page.waitForSelector('.pb-mobilepage .pb-list li', { visible: true });
    await powerPoint.screenshot({ path: `./downloads/${this.powerPointId}.png` });
  }

  async _downloadPowerPointImages() {
    const url = 'https://zh.pikbest.com/powerpoint/';
    this.page = await this.browser.newPage();
    for (this.powerPointId of this.powerPointIds) {
      await this.page.goto(url);
      await this._dismissPopup();
      await this._searchPowerPoint();
      await this._dismissPopup();
      await this._screenshotPowerPoint();
      console.log(chalk.rgb(92, 100, 112)(`PowerPoint ID: ${this.powerPointId}`));
    }
  }
}

new Crawler();