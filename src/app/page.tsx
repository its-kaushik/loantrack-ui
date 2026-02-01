import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">LoanTrack</h1>
        <p className="text-muted-foreground">Multi-tenant loan management platform</p>
        <Button asChild>
          <a href="/login">Get Started</a>
        </Button>
      </div>
    </div>
  );
}
