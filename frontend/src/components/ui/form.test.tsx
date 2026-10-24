import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form"
import { Input } from "./input"

function TestFormWrapper({
  defaultValues = { name: "Budi" },
}: {
  defaultValues?: { name: string }
}) {
  const form = useForm({
    defaultValues,
  })

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="custom-item">
              <FormLabel className="custom-label">Nama Lengkap</FormLabel>
              <FormControl className="custom-control">
                <Input placeholder="Masukkan nama" {...field} />
              </FormControl>
              <FormDescription className="custom-desc">Nama sesuai KTP</FormDescription>
              <FormMessage className="custom-msg" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe("Form UI Components", () => {
  it("renders Form, FormItem, FormLabel, FormControl, and FormDescription with data slots", () => {
    const html = renderToStaticMarkup(<TestFormWrapper />)

    expect(html).toContain('data-slot="form-item"')
    expect(html).toContain("custom-item")
    expect(html).toContain('data-slot="form-label"')
    expect(html).toContain("Nama Lengkap")
    expect(html).toContain('data-slot="form-description"')
    expect(html).toContain("Nama sesuai KTP")
    expect(html).toContain('placeholder="Masukkan nama"')
    expect(html).toContain('value="Budi"')
  })

  it("links FormLabel htmlFor with FormControl id", () => {
    const html = renderToStaticMarkup(<TestFormWrapper />)

    // FormLabel has htmlFor matching the input id
    const forMatch = html.match(/for="([^"]+)"/)
    expect(forMatch).not.toBeNull()
    const id = forMatch?.[1]
    expect(html).toContain(`id="${id}"`)
  })
})
