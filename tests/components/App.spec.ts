import { createPinia } from "pinia";
import { mount, type VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { beforeEach, describe, expect, it } from "vitest";

import App from "@/App.vue";
import { setLocale } from "@/i18n";

function mountApp(): VueWrapper {
  return mount(App, {
    global: { plugins: [createPinia()] },
    attachTo: document.body,
  });
}

beforeEach(() => {
  setLocale("en");
  document.body.innerHTML = "";
});

describe("App", () => {
  it("renders a single level one heading", () => {
    const wrapper = mountApp();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.get("h1").text()).toBe("Code Sandbox");
  });

  it("offers a skip link that targets the main landmark", () => {
    const wrapper = mountApp();

    expect(wrapper.get("a.skip-link").attributes("href")).toBe("#main-content");
    expect(wrapper.get("main").attributes("id")).toBe("main-content");
  });

  it("shows the web playground first", () => {
    const wrapper = mountApp();

    expect(wrapper.get("#panel-web").attributes("hidden")).toBeUndefined();
    expect(wrapper.get("#panel-runner").attributes("hidden")).toBeDefined();
  });

  it("switches to the language runner", async () => {
    const wrapper = mountApp();

    await wrapper.findAll('[role="tab"]')[1]?.trigger("click");

    expect(wrapper.get("#panel-runner").attributes("hidden")).toBeUndefined();
    expect(wrapper.text()).toContain("Console");
  });

  it("switches the interface language", async () => {
    const wrapper = mountApp();
    const localeSelect = wrapper
      .findAll("select")
      .find((select) => select.findAll("option").some((option) => option.text() === "English"));

    await localeSelect?.setValue("pl");

    expect(wrapper.text()).toContain("Projekt WWW");
    expect(document.documentElement.lang).toBe("pl");
  });

  it("has no detectable accessibility violations", async () => {
    mountApp();

    const results = await axe.run(document.body, {
      runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    });

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  }, 30_000);
});
