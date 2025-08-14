
import StageButton from "../component/StageButton";
import { useProgressStore } from '../store/useProgressStore'



const Basic = ({ onStepSelect }) => {
 
  const opened = useProgressStore((s) => s.progress?.basic?.opened ?? []);

  const stepLabels = [
    "양순음 + 쉬운 모음",
    "치조음 + 기본모음 중모음",
    "경구개음 + 중간~복합 모음",
    "연구개음 + 복합모음",
    "후음 + 복합모음",
  ];

  return (
    <div className="flex flex-col justify-center gap-10 mb-20 mt-10">
      {[1, 2, 3, 4, 5].map(step => (
        <div
          key={step}
          onClick={() => onStepSelect(step, stepLabels[step - 1])}
          className={`cursor-pointer flex flex-col ${step % 2 === 1 ? "items-start ml-60" : "items-end mr-60"
            }`}
        >
          <StageButton step={step} status={opened.includes(step) ? "opened" : "locked"} />

        </div>
      ))}
    </div>
  );
};

export default Basic;
