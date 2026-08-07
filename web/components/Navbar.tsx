import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLogout } from "@/hooks/auth";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Sync Profile", href: "/sync" },
  { label: "Add Update", href: "/add-update" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const { isPending, mutateAsync } = useLogout();
  const logouthandler = () => {
    mutateAsync();
  };
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block text-xl">JOBCEN</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80   ${isActive ? "text-foreground text-base" : "text-foreground/60"}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Action Button (Desktop Only) */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="destructive"
            size="lg"
            onClick={logouthandler}
            disabled={isPending}
          >
            {isPending ? "Logging out..." : "Logout"}
          </Button>
          <Button size="lg" variant="link">
            Create new Account
          </Button>
        </div>

        {/* Mobile Navigation (Hamburger Menu) */}
        <div className="flex md:hidden items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
                <hr className="my-2 border-border" />
                <Button variant="outline" className="w-full justify-center">
                  Logout
                </Button>
                <Button className="w-full justify-center">
                  Create new Account
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
