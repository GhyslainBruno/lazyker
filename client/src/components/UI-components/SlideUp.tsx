import Slide, {SlideProps} from '@material-ui/core/Slide';
import React from 'react';

/**
 * Slide up transition component, used to display dialog
 * @param props
 * @returns {*}
 * @constructor
 */
const SlideUp = React.forwardRef<unknown, SlideProps>((props, ref) => (
  <Slide direction="up" {...props} ref={ref} />
));

export default SlideUp;
