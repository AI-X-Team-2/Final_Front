import React, { useEffect, useState } from 'react'

import StageButton from "../component/StageButton";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const BasicStep1 = () => {
    const { step } = useParams();
    const [stages, setStages] = useState([]);

    useEffect(() => {
        const stages = getStages(step);
        setStages(stages);
    }, step)

    const getStages = () => {
        switch (step) {
            case "1":
                return ["1", "2", "3"];
            case "2":
                return ["1", "2", "3", "4"];
            case "3":
                return ["1", "2", "3"];
            case "4":
                return ["1", "2", "3"];
            case "5":
                return ["1", "2"];
            default:
                return [];
        }

    }
    return (
        <div className='flex flex-col justify-center items-center h-screen gap-10'>
            {stages?.map((stage) => (
                <Link key={stage} to={`/basic/step/${step}/${stage}`}><StageButton step={`${step}-${stage}`} status={"current"} ></StageButton></Link>
            )
            )


            }

        </div>


    )
}

export default BasicStep1
