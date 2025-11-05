import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignIn from './Pages/SignIn.tsx'
import Navbar from './Components/Navbar.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
    <Navbar />
      <SignIn />
    </div>
    </>
  )
}

export default App
