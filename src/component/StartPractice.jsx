// Review.jsx
import { useLocation, } from 'react-router-dom';
import Words from '../component/Words';

export default function StartPractice() {
  const { state } = useLocation();



  const selectedWords = state?.selectedWords ?? [];
  console.log('선택된 단어들:', selectedWords);


  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Words data={selectedWords} isReview={true}/>
    </div>
  );
}
