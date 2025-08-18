import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './component/Layout'; // 'Rayout'은 오타이므로 제거

import WordGame from './pages/WordGame';


import DailyLifeVoca from './pages/DailyLifeVoca';
;
import DailyStep from './pages/DailyStep';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginRegisterLayout from './component/LoginRegisterLayout';
import Practice from './component/Practice';
import LearningLayout from './component/LearningLayout';
import Setting from './pages/Setting';
import Modal from 'react-modal';

Modal.setAppElement('#root');

import Ranking from './pages/Ranking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginRegisterLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />


        </Route>


        <Route element={<LearningLayout />}> 
         <Route path="/daily/step/:step" element={<DailyLifeVoca />} />
   

        </Route>








        <Route element={<Layout />}>
          <Route path="/main" element={<Main />} />
          <Route path="/settings" element={<Setting />} />

          <Route path="/ranking" element={<Ranking />} />
          <Route path="/game" element={<WordGame />} />
   
          <Route path="/daily" element={<DailyStep />} />
          <Route path="/practice" element={<Practice />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;








