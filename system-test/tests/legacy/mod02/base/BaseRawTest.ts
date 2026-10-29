import { randomUUID } from 'node:crypto';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { loadConfiguration, type TestConfig } from '../../../../config/configuration-loader.js';

export interface EventhubBrowser {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export function getConfiguration(): TestConfig {
  return loadConfiguration();
}

export function getEventhubApiBaseUrl(config: TestConfig = getConfiguration()): string {
  return config.eventhub.backendApiUrl;
}

export function getEventhubUiBaseUrl(config: TestConfig = getConfiguration()): string {
  return config.eventhub.frontendUrl;
}

export function getErpBaseUrl(config: TestConfig = getConfiguration()): string {
  return config.externalSystems.erp.url;
}

export function getTaxBaseUrl(config: TestConfig = getConfiguration()): string {
  return config.externalSystems.tax.url;
}

export function createUniqueSku(baseSku: string): string {
  const suffix = randomUUID().substring(0, 8);
  return `${baseSku}-${suffix}`;
}

export async function setUpEventhubBrowser(): Promise<EventhubBrowser> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function tearDownEventhubBrowser(eventhubBrowser: EventhubBrowser | null): Promise<void> {
  if (!eventhubBrowser) return;
  await eventhubBrowser.page.close();
  await eventhubBrowser.context.close();
  await eventhubBrowser.browser.close();
}
