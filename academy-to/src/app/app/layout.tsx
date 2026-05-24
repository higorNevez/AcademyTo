import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
