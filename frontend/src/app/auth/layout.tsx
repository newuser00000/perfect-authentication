export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="flex min-h-screen items-center justify-center px-4">
                {children}
            </div>
        </main>
    );
}
