import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-7xl font-bold">EmpTrack</h1>
      <div className="absolute bottom-5 left-5 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
