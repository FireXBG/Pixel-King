import './App.css';
import Header from './core/header/header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./features/Home/Home";
import Wallpapers from "./features/Wallpapers/Wallpapers";

function App() {
    return (
        <BrowserRouter>
            <>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/wallpapers" element={<Wallpapers />}></Route>
                    <Route path="/license" element={<h1>License Route</h1>}></Route>
                    <Route path="/contact" element={<h1>Contact Route</h1>}></Route>
                </Routes>
            </>
        </BrowserRouter>
    );
}

export default App;
