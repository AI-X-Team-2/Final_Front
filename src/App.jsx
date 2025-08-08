import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './component/Layout'; // 'Rayout'은 오타이므로 제거

import WordGame from './pages/WordGame';

import BasicStep1 from './pages/BasicStep1';

import DailyLifeVoca from './pages/DailyLifeVoca';
import Basic from './pages/Basic';
import BasicStage from './pages/BasicStage';
import DailyStep from './pages/DailyStep';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginRegisterLayout from './component/LoginRegisterLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginRegisterLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/daily/step/:step" element={<DailyLifeVoca />} />
          <Route path="/basic/step/:step/:stage" element={<BasicStage />} />

        </Route>




        <Route element={<Layout />}>
          <Route path="/" element={<Main />} />

          <Route path="/game" element={<WordGame />} />
          <Route path="/basic" element={<Basic />} />
          <Route path="/basic/step/:step" element={<BasicStep1 />} />
          <Route path="/daily" element={<DailyStep />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;








