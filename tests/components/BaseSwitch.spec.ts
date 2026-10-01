import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BaseSwitch from "@/components/BaseSwitch.vue";

describe("BaseSwitch", () => {
  it("exposes the switch role and state", () => {
    const wrapper = mount(BaseSwitch, {
      props: { label: "Auto refresh", modelValue: true },
    });

    const button = wrapper.get("button");
    expect(button.attributes("role")).toBe("switch");
    expect(button.attributes("aria-checked")).toBe("true");
  });

  it("toggles the model on click", async () => {
    const wrapper = mount(BaseSwitch, {
      props: { label: "Auto refresh", modelValue: false },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([true]);
  });

  it("links the description to the control", () => {
    const wrapper = mount(BaseSwitch, {
      props: { label: "Auto refresh", description: "Rebuild while typing", modelValue: false },
    });

    const describedBy = wrapper.get("button").attributes("aria-describedby");
    expect(describedBy).toBeDefined();
    expect(wrapper.get(`[id="${String(describedBy)}"]`).text()).toBe("Rebuild while typing");
  });
});
