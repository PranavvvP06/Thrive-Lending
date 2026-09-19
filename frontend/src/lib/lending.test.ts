import { describe, expect, it } from "vitest";
import { formatPercent } from "./format";
import { calculateLtv, describeLtvBand } from "./lending";

describe("lending display helpers", () => {
  it("calculates loan to value", () => {
    expect(calculateLtv(450_000, 650_000)).toBeCloseTo(69.230769, 5);
  });

  it("returns zero when the asset value is not valid", () => {
    expect(calculateLtv(450_000, 0)).toBe(0);
  });

  it("formats extreme LTV values clearly", () => {
    expect(formatPercent(1303.06)).toBe("1,303.06%");
  });

  it("describes the relevant policy band", () => {
    expect(describeLtvBand(450_000, 59.9)).toBe("Lower leverage");
    expect(describeLtvBand(450_000, 80)).toBe("Higher leverage");
    expect(describeLtvBand(450_000, 90)).toBe("Above maximum permitted LTV");
    expect(describeLtvBand(1_000_000, 60.1)).toBe("Above 60% high-value limit");
  });
});
