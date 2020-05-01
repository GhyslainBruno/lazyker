import { SET_UPDATED_SHOWS_NUMBER } from "../constants/action-types";

const initialState = {
    updatedShowsNumber: 0
};

function rootReducer(state = initialState, action) {
    if (action.type === SET_UPDATED_SHOWS_NUMBER) {
        return Object.assign({}, state, {
            updatedShowsNumber: action.payload
        });
    }
    return state;
}

export default rootReducer;
