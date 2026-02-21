import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </main>
  );
}