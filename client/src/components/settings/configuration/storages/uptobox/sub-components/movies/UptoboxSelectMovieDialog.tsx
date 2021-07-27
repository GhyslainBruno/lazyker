import {Dialog, makeStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  openMoviesDialog, saveMoviesFolder,
} from '../../../../../../../ducks/storages/Uptobox.slice';
import {UptoboxFilesList} from './UptoboxFilesList';

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

  const isMovieDialogOpened = useSelector((state: any) => state.storages.uptobox.isMovieDialogOpened);
  const moviesFolderPath = useSelector((state: any) => state.storages.uptobox.moviesFolderPath);

  const dispatch = useDispatch();
  const classes = useStyles();

  const handleSaveClick = () => {
    dispatch(saveMoviesFolder(moviesFolderPath));
  }

  const handleDeleteClick = () => {
    dispatch(openMoviesDialog(false));
  }

  return (
    <Dialog fullWidth={true} open={isMovieDialogOpened} onClose={() => dispatch(openMoviesDialog(false))}>
      <DialogTitle id="alert-dialog-title">Select movies folder : {moviesFolderPath.replace('//','/')}</DialogTitle>

      <DialogContent>

        <UptoboxFilesList id={'//'} key={0} name="Uptobox folders" />

      </DialogContent>

      <DialogActions>
        <Button onClick={handleDeleteClick} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSaveClick} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
