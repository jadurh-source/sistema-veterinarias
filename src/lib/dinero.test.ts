import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { formatearPesos } from "./dinero";

describe("formatearPesos", () => {
  it("muestra pesos sin decimales cuando son enteros", () => {
    expect(formatearPesos(18000)).toBe("$ 18.000");
  });

  it("muestra los centavos cuando los hay", () => {
    expect(formatearPesos("1250.5")).toBe("$ 1.250,5");
  });

  it("acepta Decimal de Prisma", () => {
    expect(formatearPesos(new Prisma.Decimal("90000.00"))).toBe("$ 90.000");
  });
});
