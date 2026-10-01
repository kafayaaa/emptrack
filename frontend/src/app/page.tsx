import { ThemeToggle } from "@/components/shared/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-7xl font-bold">EmpTrack</h1>
      <div className="absolute bottom-5 left-5 z-50">
        <ThemeToggle />
      </div>
    </div>
  )
}
