import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './component/Layout'; // 'Rayout'은 오타이므로 제거
import SpeechCorrection from './pages/SpeechCorrection';
import Game from './pages/WordGame';
import WordGame from './pages/WordGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout을 라우트에 감싸서 중첩 라우팅 적용 */}
        <Route element={<Layout />}>
          <Route path="/speech-correction" element={<SpeechCorrection />} />
          <Route path="/game" element={<WordGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;












// 바보