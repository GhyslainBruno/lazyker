import {Link as RouterLink} from "react-router-dom";
import * as routes from "../../constants/routes";
import React from "react";

const PrivacyPolicies = () => {
    return (
        <div style={{textAlign: 'center', marginTop: '20px'}}>
            <RouterLink style={{color: 'red'}} to={routes.PRIVACY}>Privacy policies</RouterLink>
        </div>
    )
};
export default PrivacyPolicies
