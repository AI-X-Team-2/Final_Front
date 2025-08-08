import React from 'react'
import ClipLoader from "react-spinners/ClipLoader";

const LodadingSpinner = () => {
    return (
        <div>
            <div className="flex justify-center items-center">
                <ClipLoader color="#2563eb"  size={40} />
            </div>

        </div>
    )
}

export default LodadingSpinner
