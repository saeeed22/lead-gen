import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <Button asChild>
                    <Link href="/">Go back home</Link>
                </Button>
            </div>
        </div>
    );
}
