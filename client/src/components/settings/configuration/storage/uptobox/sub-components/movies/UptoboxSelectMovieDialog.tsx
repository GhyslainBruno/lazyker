import {Dialog, makeStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {TreeItem, TreeView} from '@material-ui/lab';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchFilesList,
  openMoviesDialog,
  openTokenDialog,
  updateMoviesState,
} from '../../../../../../../feature/storage/Uptobox.slice';

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export const UptoboxSelectMovieDialog = () => {

  const [childNodes, setChildNodes] = useState(null);
  const [expanded, setExpanded] = React.useState([]);

  const isMovieDialogOpened = useSelector((state: any) => state.uptobox.isMovieDialogOpened);
  const uptoboxMovies = useSelector((state: any) => state.uptobox.uptoboxMovies);
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchFilesList())
  }, [isMovieDialogOpened])

  const handleChange = (event: any, nodes: any) => {

    // @ts-ignore
    const expandingNodes = nodes.filter((x: any) => !expanded.includes(x));
    setExpanded(nodes);
    if (expandingNodes[0]) {
      const childId = expandingNodes[0];
      console.log('fetching new files');
      // fetchChildNodes(childId).then((result: any) =>
      //   setChildNodes(
      //     result.children.map((node: any) => <UptoboxSelectMovieDialog key={node.id} {...node} />)
      //   )
      // );
    }
  };

  return (
    <Dialog fullWidth={true} open={isMovieDialogOpened} onClose={() => dispatch(openMoviesDialog(false))}>
      <DialogTitle id="alert-dialog-title">Select movies folder</DialogTitle>

      <DialogContent>

        <TreeView
          className={classes.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          onNodeToggle={handleChange}
        >

          {
            uptoboxMovies.folders.map((folder: any) => {
              return (
                <TreeItem nodeId={folder.folderId} label={folder.name}/>
              )
            })
          }

          {/*<TreeItem nodeId="1" label="Applications">*/}
          {/*  <TreeItem nodeId="2" label="Calendar" />*/}
          {/*  <TreeItem nodeId="3" label="Chrome" />*/}
          {/*  <TreeItem nodeId="4" label="Webstorm" />*/}
          {/*</TreeItem>*/}
          {/*<TreeItem nodeId="5" label="Documents">*/}
          {/*  <TreeItem nodeId="10" label="OSS" />*/}
          {/*  <TreeItem nodeId="6" label="Material-UI">*/}
          {/*    <TreeItem nodeId="7" label="src">*/}
          {/*      <TreeItem nodeId="8" label="index.js" />*/}
          {/*      <TreeItem nodeId="9" label="tree-view.js" />*/}
          {/*    </TreeItem>*/}
          {/*  </TreeItem>*/}
          {/*</TreeItem>*/}
        </TreeView>

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
