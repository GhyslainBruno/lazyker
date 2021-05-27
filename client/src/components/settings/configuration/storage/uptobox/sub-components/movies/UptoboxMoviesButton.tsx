import {makeStyles} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Folder from '@material-ui/icons/FolderOpen';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectedStateEnum} from '../../../../../../../ducks/ConnectedState.enum';
import {displayErrorNotification} from '../../../../../../../ducks/snack/Snackbar.slice';
import {openMoviesDialog, updateMoviesState} from '../../../../../../../ducks/storage/Uptobox.slice';

const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
  },
  itemIcon: {
    flex: 1,
    fontSize: 20,
    alignSelf: 'center'
  }
})

export const UptoboxMoviesButton = () => {

  const uptoboxConnectedState = useSelector((state: any) => state.uptobox.connectedState);
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleButtonClick = () => {
    uptoboxConnectedState === ConnectedStateEnum.CONNECTED ? dispatch(openMoviesDialog(true)) : dispatch(displayErrorNotification('Link your account first'));
  }

  return (
    <div className={classes.container}>
      <div className={classes.itemIcon}>
        <IconButton onClick={handleButtonClick}>
          <Folder/>
        </IconButton>
      </div>
    </div>
  )
}
