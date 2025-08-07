import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid' 
import WaterDropIcon from '@mui/icons-material/WaterDrop';
const StageButton = ({ status, onClick, isStage}) => {
  console.log(status)
  const getStatusStyle = () => {
    switch (status) {
     
      case "locked":
        return "bg-customMidGray text-gray-500 cursor-not-allowed opacity-75";

      case "opened":
        return "bg-custom-blue-gradient text-black ";
      default:
        return "";
    }


     
  };

  return (
    <button
      className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-2xl ${getStatusStyle()}`}
      onClick={onClick}
      disabled={status === "locked"}
    >

      {isStage ? (
        
        
      <p className="font-extrabold text-3xl text-white ">{isStage}</p>

      ) :       <WaterDropIcon sx={{ color: "#FFFFFF", fontSize: 30 }}/>

        
      }
    </button>
  );
};

export default StageButton;
