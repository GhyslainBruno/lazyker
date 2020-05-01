import * as auth from "../firebase/auth";
import { SET_UPDATED_SHOWS_NUMBER } from "../constants/action-types";
import firebase from "firebase";
const usersRef = firebase.database().ref('/users');

export async function watchUpdateShowsNumber(dispatch) {

    usersRef.child(await auth.getUid()).child('/shows').orderByChild('episode').equalTo(true).on('value', snapshot => {
        let updatedShowsNumber = 0;
        if (snapshot.val() !== null) {
            updatedShowsNumber = Object.keys(snapshot.val()).length;
        }
        dispatch(setUpdatedShowsNumber(updatedShowsNumber));
    })

}

export function setUpdatedShowsNumber(payload) {
    return { type: SET_UPDATED_SHOWS_NUMBER, payload }
}
