import React from 'react'
// import Navbar from '../components/Navbar'
import Header from '../components/Header'

function Home() {
  return (
    <div>Home
        <h1>Welcome to My React App</h1>
        <p>This is the home page</p>
        {/* <Navbar/> */}
        <Header/>
    </div>
  )
}

export default Home

// const handleLogout = async () => {
//   await api.post('/auth/logout');
//   logout(); // from AuthContext
// };