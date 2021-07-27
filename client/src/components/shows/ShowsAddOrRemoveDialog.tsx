import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import {Show} from '../Shows';

type ShowsAddOrRemoveDialogProps = {
  showDialog: boolean;
  closeDialog: () => void;
  dialogTitle: string;
  dialogMessage: string;
  isInSearchView: boolean;
  showToAdd: Show|null;
  showToRemove: Show|null;
  addShow: (show: Show|null) => void;
  removeShow: (show: Show|null) => void;
  addOrRemoveString: string;
}

const ShowsAddOrRemoveDialog = (props: ShowsAddOrRemoveDialogProps) => {

  const { showDialog, closeDialog, dialogTitle, dialogMessage, isInSearchView, addShow, removeShow, addOrRemoveString, showToAdd, showToRemove } = props;

  const handleAddOrRemoveClick = async () => {
    isInSearchView ? addShow(showToAdd) : removeShow(showToRemove)
  }

  return (
    <Dialog
      open={showDialog}
      onClose={closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">

      <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">{dialogMessage}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddOrRemoveClick} color="primary" autoFocus>
          {addOrRemoveString}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShowsAddOrRemoveDialog;
