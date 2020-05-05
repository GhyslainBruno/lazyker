import { SET_UPDATED_SHOWS_NUMBER } from "../constants/action-types";

const initialState = {
    updatedShowsNumber: 0
};

export default function navigationReducer(state = initialState, action) {
    if (action.type === SET_UPDATED_SHOWS_NUMBER) {
        return Object.assign({}, state, {
            updatedShowsNumber: action.payload
        });
    }
    return state;
}
