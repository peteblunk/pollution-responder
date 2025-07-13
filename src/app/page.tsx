import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Siren, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">Diesel Dilemma RPG</h1>
        </div>
        <Button asChild variant="ghost">
          <Link href="/character">Log In</Link>
        </Button>
      </header>

      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-primary">
                Master the Response.
                <br />
                Control the Crisis.
              </h2>
              <p className="text-lg text-foreground/80 max-w-xl">
                Diesel Dilemma RPG is a US Coast Guard-centric training simulator for maritime hazardous material spills. Sharpen your decision-making skills in a dynamic, branching narrative experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-bold">
                  <Link href="/character">
                    Start Training Now <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <Card className="shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Siren className="text-uscg-red" />
                    Key Training Features
                  </CardTitle>
                  <CardDescription>
                    Tools designed to replicate real-world incident response.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent rounded-full">
                      <Ship className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold font-headline">Dynamic Scenarios</h3>
                      <p className="text-sm text-foreground/70">
                        Face evolving challenges where your decisions and a bit of luck determine the outcome.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent rounded-full">
                      <Siren className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold font-headline">ICS Form Generation</h3>
                      <p className="text-sm text-foreground/70">
                        Practice your paperwork with an in-game ICS-201 form that auto-populates from events.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Team Two Productions. A training tool concept. Not an official USCG product.</p>
      </footer>
    </div>
  );
}
