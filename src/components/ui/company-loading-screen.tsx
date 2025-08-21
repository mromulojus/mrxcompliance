import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";

export function CompanyLoadingScreen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex items-center space-x-3">
                <Logo className="text-primary animate-pulse" size="lg" />
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Loading Animation */}
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            {/* Animated Loading Spinner */}
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary rounded-full animate-spin animation-delay-150"></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Carregando dados da empresa</h2>
            <p className="text-muted-foreground">Aguarde um momento...</p>
          </div>

          {/* Progress Animation */}
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="space-y-8 mt-8">
          {/* Tabs Skeleton */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1" />
            ))}
          </div>

          {/* Dashboard Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 border rounded-lg bg-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: `${(i + 4) * 100}ms` }}>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-40 w-full rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}