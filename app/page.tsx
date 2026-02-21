import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        Relay 🚀
      </h1>

      <p className="max-w-md text-muted-foreground">
        A modern real-time messaging app built with Next.js, Convex, and Clerk.
      </p>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </main>
  );
}