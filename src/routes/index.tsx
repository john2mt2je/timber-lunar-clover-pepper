import { createFileRoute } from "@tanstack/react-router";
import { JamesApp } from "@/components/chess/JamesApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <JamesApp />;
}
