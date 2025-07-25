import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConversationAid from './pages/ConversationAid';
import Layout from './component/Layout'; // 'Rayout'은 오타이므로 제거

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout을 라우트에 감싸서 중첩 라우팅 적용 */}
        <Route element={<Layout />}>
          <Route path="/conversation" element={<ConversationAid />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
