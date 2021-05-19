import {Dialog} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {openTokenDialog, saveToken, updateToken} from '../../../../../../../feature/storage/Uptobox.slice';

export const UptoboxTokenDialog = () => {
  const isTokenDialogOpened = useSelector((state: any) => state.uptobox.isTokenDialogOpened);
  const token = useSelector((state: any) => state.uptobox.token);
  const dispatch = useDispatch();

  return (
    <Dialog fullWidth={true} open={isTokenDialogOpened} onClose={() => dispatch(openTokenDialog(false))}>
      <DialogTitle id="alert-dialog-title">Paste uptobox token</DialogTitle>

      <DialogContent>

        <TextField
          className="authFieldPassword"
          label='Token'
          variant="outlined"
          style={{width: '100%'}}
          value={token}
          onChange={event => dispatch(updateToken(event.target.value))}
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={() => dispatch(openTokenDialog(false))} color="primary">
          Cancel
        </Button>
        <Button onClick={() => dispatch(saveToken(token))} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
