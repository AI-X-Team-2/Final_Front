import Audio from "../component/Audio";
import Words from "../component/Words";
import { dailyWords } from "../assets/wordList";
import { dailyWords2 } from "../assets/wordList";
import { useParams } from "react-router-dom";

const DailyLifeVoca = () => {
  const { step } = useParams();

  const getDataByStep = () => {
    switch (step) {
      case "1":
        return dailyWords;
     
      default:
        return dailyWords2; 
    }
  };

  const data = getDataByStep();


  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Words data={data} />
    </div>
  );
};

export default DailyLifeVoca;
