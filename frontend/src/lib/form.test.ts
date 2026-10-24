import { describe, it, expect } from "vitest"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const testSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
})

type TestFormValues = z.infer<typeof testSchema>

describe("react-hook-form + zodResolver integration", () => {
  it("resolves valid form data correctly using zodResolver", async () => {
    const resolver = zodResolver(testSchema)
    const validData: TestFormValues = {
      fullName: "Jane Doe",
      email: "jane.doe@emptrack.test",
    }

    const result = await resolver(validData, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors).toEqual({})
    expect(result.values).toEqual(validData)
  })

  it("returns validation errors for invalid form data", async () => {
    const resolver = zodResolver(testSchema)
    const invalidData = {
      fullName: "J",
      email: "invalid-email",
    }

    const result = await resolver(invalidData, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors.fullName?.message).toBe("Name must be at least 3 characters")
    expect(result.errors.email?.message).toBe("Invalid email")
  })
})
