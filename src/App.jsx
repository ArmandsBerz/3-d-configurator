import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StageSecond } from '../src/context/isopenContext';

function App() {
  return (
    <BrowserRouter basename="/build">
      <Routes>
        <Route path="/stage-two" element={<StageSecond />} />
        <Route path="*" element={<Navigate to="/stage-two" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

