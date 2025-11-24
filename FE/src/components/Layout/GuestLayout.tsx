import { ReactNode } from 'react'
import GuestNavbar from '../Navbar/GuestNavbar'
import GuestFooter from '../Footer/GuestFooter'
import './GuestLayout.css'

interface GuestLayoutProps {
  children: ReactNode
}

const GuestLayout = ({ children }: GuestLayoutProps) => {
  return (
    <div className="guest-layout">
      <GuestNavbar />
      <main className="guest-content">
        {children}
      </main>
      <GuestFooter />
    </div>
  )
}

export default GuestLayout