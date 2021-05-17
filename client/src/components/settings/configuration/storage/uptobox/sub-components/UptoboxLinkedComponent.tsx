import {makeStyles} from '@material-ui/core';
import React from 'react';
import {UptoboxConnectionButton} from './UptoboxConnectionButton';
import {UptoboxConnectionState} from './UptoboxConnectionState';
import {UptoboxTokenDialog} from './UptoboxTokenDialog';

const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
  },
  itemText: {
    flex: 1,
    alignSelf: 'center'
  },
})

export const UptoboxLinkedComponent = () => {
  const classes = useStyles();

  return (
    <div style={{display: 'flex'}}>

      <UptoboxTokenDialog />

      <div className={classes.container}>
        <div className={classes.itemText}>
          Link
        </div>
      </div>

      <UptoboxConnectionState/>

      <UptoboxConnectionButton/>
    </div>
  )
}
