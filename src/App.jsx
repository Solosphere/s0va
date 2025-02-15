// import './App.css'

// import { 
//   Routes, 
//   Route, 
// } from "react-router-dom";

// import Nav from './components/Nav'
// import Dashboard from './components/Dashboard'
// import About from './components/About'
// import Fallback from './components/Fallback'
// import Products from './components/Products'
// import Product from './components/Product'

// function App() {
//   return (
//     <>
//       <Nav />
//       <Routes>
//         <Route path='/' element={<Dashboard />}/>
//         <Route path='/products' element={<Products />}/>
//         <Route path='/products/:id' element={<Product />}/>
//         <Route path='/about' element={<About />}/>
//         <Route path="*" element={<Fallback />}/>
//       </Routes>
//     </>
//   )
// }

// export default App
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import GalleryPage from './pages/Gallery';
import AboutPage from './pages/About';
import SiteHeadingAndNav from './components/SiteHeadingAndNav';
import Footer from './components/Footer';
import NotFoundPage from './pages/NotFound';
import Loading from './components/Loading';
import GalleryItemDetail from './components/GalleryItemDetails';

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Simulate a delay for loading
    setLoading(true);
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(delay);
  }, [location.pathname]);

  return (
    <>
      <SiteHeadingAndNav />
      <main>
        {loading ? (
          <Loading />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/archive" element={<GalleryPage />} />
            <Route path="/archive/:id" element={<GalleryItemDetail />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
      <Footer />
    </>
  );
}
