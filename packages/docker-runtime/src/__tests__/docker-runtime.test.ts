import { createDockerAdapter } from "./index.js";

describe("Docker Runtime", () => {
  it("should create Docker adapter", () => {
    const adapter = createDockerAdapter();
    expect(adapter).toBeDefined();
  });
});
