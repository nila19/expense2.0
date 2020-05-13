import { COLOR } from 'app/config';

export const labelColor = {
  '& label.Mui-focused': {
    color: COLOR.GREEN,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: COLOR.GREEN,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: COLOR.GREY,
    },
    '&:hover fieldset': {
      borderColor: COLOR.GREEN,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLOR.GREEN,
    },
  },
};
