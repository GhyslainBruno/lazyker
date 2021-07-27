import React from "react";
import {UptoboxLinkedComponent} from './sub-components/link/UptoboxLinkedComponent';
import {UptoboxMoviesComponent} from './sub-components/movies/UptoboxMoviesComponent';

export const Uptobox = () => {

  return (
    <div style={{width: '100%'}}>
      <UptoboxLinkedComponent />
      <UptoboxMoviesComponent />
    </div>
  )

}
