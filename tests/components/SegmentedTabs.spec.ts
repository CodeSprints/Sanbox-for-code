import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SegmentedTabs from "@/components/SegmentedTabs.vue";

const items = [
  { value: "web", label: "Web", controls: "panel-web" },
  { value: "runner", label: "Runner", controls: "panel-runner" },
] as const;

function mountTabs(modelValue: "web" | "runner" = "web") {
  return mount(SegmentedTabs, {
    props: { label: "Mode", items, modelValue, "onUpdate:modelValue": () => {} },
    attachTo: document.body,
  });
}

describe("SegmentedTabs", () => {
  it("renders an accessible tablist", () => {
    const wrapper = mountTabs();

    expect(wrapper.attributes("role")).toBe("tablist");
    expect(wrapper.attributes("aria-label")).toBe("Mode");
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
  });

  it("marks the active tab and controls its panel", () => {
    const wrapper = mountTabs();
    const [first, second] = wrapper.findAll('[role="tab"]');

    expect(first?.attributes("aria-selected")).toBe("true");
    expect(first?.attributes("tabindex")).toBe("0");
    expect(first?.attributes("aria-controls")).toBe("panel-web");
    expect(second?.attributes("aria-selected")).toBe("false");
    expect(second?.attributes("tabindex")).toBe("-1");
  });

  it("emits the new value on click", async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[1]?.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["runner"]);
  });

  it("supports arrow key navigation", async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[0]?.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["runner"]);
  });

  it("wraps around with arrow keys", async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[0]?.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["runner"]);
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const wrapper = mountTabs("runner");

    await wrapper.findAll('[role="tab"]')[1]?.trigger("keydown", { key: "Home" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["web"]);

    await wrapper.findAll('[role="tab"]')[0]?.trigger("keydown", { key: "End" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["runner"]);
  });
});
