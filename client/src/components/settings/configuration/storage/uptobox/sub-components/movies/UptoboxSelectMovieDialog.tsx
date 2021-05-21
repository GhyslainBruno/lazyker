import {Dialog, makeStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  openMoviesDialog,
  updateMoviesState,
} from '../../../../../../../feature/storage/Uptobox.slice';
import {MyTreeItem} from './MyTreeItem';

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

type UptoboxSelectMovieDialogProps = {
  id: string;
  label: string;
}

export const UptoboxSelectMovieDialog = (props: UptoboxSelectMovieDialogProps) => {

  const isMovieDialogOpened = useSelector((state: any) => state.uptobox.isMovieDialogOpened);

  const dispatch = useDispatch();
  const classes = useStyles();

  return (
    <Dialog fullWidth={true} open={isMovieDialogOpened} onClose={() => dispatch(openMoviesDialog(false))}>
      <DialogTitle id="alert-dialog-title">Select movies folder</DialogTitle>

      <DialogContent>

        <MyTreeItem id={'//'} key={0} name="Uptobox folders" />

      </DialogContent>

      <DialogActions>
        <Button onClick={() => dispatch(openMoviesDialog(false))} color="primary">
          Cancel
        </Button>
        <Button onClick={() => dispatch(updateMoviesState('movies folder'))} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
