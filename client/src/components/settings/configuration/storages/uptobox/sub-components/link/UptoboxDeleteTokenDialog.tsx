import {Dialog} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  deleteToken,
  openDeleteTokenDialog,
  openTokenDialog,
} from '../../../../../../../ducks/storages/Uptobox.slice';

export const UptoboxDeleteTokenDialog = () => {
  const isDeleteTokenDialogOpened = useSelector((state: any) => state.storages.uptobox.isDeleteTokenDialogOpened);
  const dispatch = useDispatch();

  return (
    <Dialog fullWidth={true} open={isDeleteTokenDialogOpened} onClose={() => dispatch(openTokenDialog(false))}>
      <DialogTitle id="alert-dialog-title">Delete uptobox token</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you really want to unlink your Uptobox account ?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => dispatch(openDeleteTokenDialog(false))} color="primary">
          Cancel
        </Button>
        {/*// @ts-ignore*/}
        <Button onClick={() => dispatch(deleteToken())} color="primary" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
