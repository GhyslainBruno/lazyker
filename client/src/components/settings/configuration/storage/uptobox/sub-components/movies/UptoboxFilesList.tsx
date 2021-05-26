import ky from 'ky';
import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import {useDispatch} from 'react-redux';
import {displayErrorNotification} from '../../../../../../../ducks/snack/Snackbar.slice';
import {updateMoviesFolderPath} from '../../../../../../../ducks/storage/Uptobox.slice';
import {auth} from '../../../../../../../firebase';
const { useState } = React;

type UptoboxFolder = {
  path: string;
  id: string;
  name: string;
}

type UptoboxFile = {
  code: string;
  name: string;
}

type UptoboxMoviesFilesList = {
  currentFolder: string,
  folders: [],
  files: []
}

export const UptoboxFilesList = (props: any) => {

  // TODO: replace this array of any into array of react functional component
  const [childNodes, setChildNodes] = useState<any[]  | null>(null);
  const [expanded, setExpanded] = React.useState([]);

  const dispatch = useDispatch();

  const fetchFilesList = async (path: string): Promise<any> => {
    try {
      const fixedPath = path === '/' ? '//' : path;
      if (path.startsWith('/')) {
        return await ky.get(`/api/uptobox/files?path=${fixedPath}`, { headers: {token: await auth.getIdToken()} }).json();
      } else {
        return {
          folders: [],
          files: []
        }
      }
    } catch(error) {
      dispatch(displayErrorNotification({message: error.message}));
      throw error
    }
  }

  const handleChange = (event: any, nodes: any) => {
    // TODO: fix this ts error
    // @ts-ignore
    const expandingNodes = nodes.filter((x: any) => !expanded.includes(x));
    setExpanded(nodes);
    if (expandingNodes[0]) {
      const childId = expandingNodes[0];

      // childId is the path of the folder
      if (childId) dispatch(updateMoviesFolderPath(childId));
      fetchFilesList(childId).then((result: UptoboxMoviesFilesList) => {
          const folders = result.folders.map((folder: UptoboxFolder) => <UptoboxFilesList key={folder.id} name={folder.name} id={folder.path} />);
          const files = result.files.map((file: UptoboxFile) => <UptoboxFilesList key={file.name} name={file.name} id={file.code} />);
          setChildNodes(folders.concat(files));
      });
    }
  };

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      onNodeToggle={handleChange}
    >
      {/*The node below should act as the root node for now */}
      <TreeItem nodeId={props.id} label={props.name}>
        {childNodes || [<div key="stub" />]}
      </TreeItem>
    </TreeView>
  )
}
