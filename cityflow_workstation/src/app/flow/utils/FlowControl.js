import styled from 'styled-components';
import { Controls } from 'reactflow';
import theme from '@/theme';
import { useOnViewportChange } from 'reactflow';
import { updateViewPort } from '@/store/actions';
import { useDispatch } from 'react-redux';

const CustomControl = styled(Controls)`
  button {
    background-color: ${theme.palette.flow.main};
    color: ${theme.palette.text.secondary};
    border-bottom: 1px solid ${theme.palette.flow.main};
    border-radius: 5px;
    margin-bottom: 2px;

    &:hover {
      background-color: ${theme.palette.secondary.main};
    }

    path {
      fill: currentColor;
    }
  }
`;

const StyledControls = () => {
  const dispatch = useDispatch();
  useOnViewportChange({
    onChange: (viewport) => dispatch(updateViewPort(viewport)),
  });

  return (
    <>
      <CustomControl showInteractive={false} />
    </>
  );
};

export default StyledControls;
