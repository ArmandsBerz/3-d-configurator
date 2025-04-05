import './index.css';
import {
    BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom';
import { StageFirst, StageSecond, StageThird } from '../src/context/isopenContext';

function App() {
    return (
        <BrowserRouter basename="/build">
            <Routes>
                <Route path="/" element={<StageFirst />} />
                <Route path="/stage-two" element={<StageSecond />} />
                <Route path="/stage-three" element={<StageThird />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
