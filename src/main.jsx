import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { ProductsProvider } from './context/ProductsProvider.jsx';
import App from './App.jsx';
import './index-refactored.css';
import './programs.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ProductsProvider>
      <App />
    </ProductsProvider>
  </BrowserRouter>
);
