
import StageButton from "../component/StageButton";

import { Link } from "react-router-dom";
const Basic = () => {

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-10">
            <Link to="/basic/step/1"><StageButton step={1} status={"current"} ></StageButton></Link>
            <Link to="/basic/step/2"><StageButton step={2} status={"current"} ></StageButton></Link>
            <Link to="/basic/step/3"><StageButton step={3} status={"current"} ></StageButton></Link>
            <Link to="/basic/step/4"><StageButton step={4} status={"current"} ></StageButton></Link>
            <Link to="/basic/step/5"><StageButton step={5} status={"current"} ></StageButton></Link>


        </div>
    );
};

export default Basic;
