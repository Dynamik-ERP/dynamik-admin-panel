import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to the admin dashboard (orders page)
  // The dashboard layout's useAuthGuard will redirect to /login if unauthenticated
  redirect('/orders')
}
