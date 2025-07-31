import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './component/Layout'; // 'Rayout'은 오타이므로 제거
import BasicStep1 from './pages/BasicStep1';

import DailyLifeVoca from './pages/DailyLifeVoca';
import Basic from './pages/Basic';
import BasicStage from './pages/BasicStage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout을 라우트에 감싸서 중첩 라우팅 적용 */}
        <Route element={<Layout />}>
          <Route path="/daily-life-voca" element={<DailyLifeVoca />} />
          <Route path="/basic" element={<Basic />} />
          <Route path="/basic/step/:step" element={<BasicStep1 />} />
          <Route path="/basic/step/:step/:stage" element={<BasicStage />} />





        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;












// 바보