import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <SignUp forceRedirectUrl="/chat"/>
    </div>
  );
}