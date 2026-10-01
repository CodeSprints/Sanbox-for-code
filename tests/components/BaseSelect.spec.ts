import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import BaseSelect from "@/components/BaseSelect.vue";

const options = [
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
];

describe("BaseSelect", () => {
  it("associates the label with the select", () => {
    const wrapper = mount(BaseSelect, { props: { label: "Language", options, modelValue: "pl" } });

    expect(wrapper.get("label").attributes("for")).toBe(wrapper.get("select").attributes("id"));
  });

  it("renders every option", () => {
    const wrapper = mount(BaseSelect, { props: { label: "Language", options, modelValue: "pl" } });

    expect(wrapper.findAll("option")).toHaveLength(2);
  });

  it("emits the selected value", async () => {
    const wrapper = mount(BaseSelect, { props: { label: "Language", options, modelValue: "pl" } });

    await wrapper.get("select").setValue("en");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["en"]);
  });
});
