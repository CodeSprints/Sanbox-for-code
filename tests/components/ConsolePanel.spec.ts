import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";

import ConsolePanel from "@/components/ConsolePanel.vue";
import type { ConsoleEntry } from "@/features/web-playground/preview-message";
import { setLocale } from "@/i18n";

const entries: ConsoleEntry[] = [
  { id: 1, level: "log", message: "ready", time: 1_700_000_000_000 },
  { id: 2, level: "warn", message: "deprecated", time: 1_700_000_001_000 },
  { id: 3, level: "error", message: "boom", time: 1_700_000_002_000 },
  { id: 4, level: "info", message: "details", time: 1_700_000_003_000 },
];

beforeEach(() => {
  setLocale("en");
});

describe("ConsolePanel", () => {
  it("shows an empty state without entries", () => {
    const wrapper = mount(ConsolePanel, { props: { entries: [] } });

    expect(wrapper.text()).toContain("Console output of the preview appears here.");
  });

  it("lists every entry with its level", () => {
    const wrapper = mount(ConsolePanel, { props: { entries } });

    expect(wrapper.findAll('[role="log"] li')).toHaveLength(4);
    expect(wrapper.text()).toContain("boom");
  });

  it("summarises the entries for screen readers", () => {
    const wrapper = mount(ConsolePanel, { props: { entries } });

    expect(wrapper.get('[aria-live="polite"]').text()).toBe("1 errors, 1 warnings, 2 messages");
  });

  it("filters by level", async () => {
    const wrapper = mount(ConsolePanel, { props: { entries } });
    const tabs = wrapper.findAll('[role="tab"]');

    await tabs[1]?.trigger("click");
    expect(wrapper.findAll('[role="log"] li')).toHaveLength(1);

    await tabs[3]?.trigger("click");
    expect(wrapper.findAll('[role="log"] li')).toHaveLength(2);
  });

  it("emits clear", async () => {
    const wrapper = mount(ConsolePanel, { props: { entries } });

    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Clear"))
      ?.trigger("click");

    expect(wrapper.emitted("clear")).toHaveLength(1);
  });
});
