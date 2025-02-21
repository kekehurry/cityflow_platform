import React, { useState, useCallback, useEffect } from 'react';
// import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useReactFlow } from 'reactflow';
import { upload } from '@/utils/local';
import ShareBoard from './ShareBoard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { updateMeta } from '@/store/actions';

import RunButtons from './RunButtons';
import Header from '@/components/Header';

import { initStore } from '@/store/actions';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  initStore: (state) => dispatch(initStore(state)),
  setGlobalScale: (scale) => {
    dispatch(updateMeta({ globalScale: scale }));
  },
});

const FlowHeader = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('Share');

  const rfInstance = useReactFlow();

  const runButtons = (
    <RunButtons
      setDialogOpen={setDialogOpen}
      setDialogName={setDialogName}
      share={true}
      save={true}
      size={28}
    />
  );

  const actions = [
    {
      icon: <SaveIcon />,
      name: 'Save',
      onClick: () => {
        setDialogOpen(true);
        setDialogName('Save');
      },
    },
    {
      icon: <DownloadIcon />,
      name: 'Download',
      onClick: () => {
        setDialogOpen(true);
        setDialogName('Download');
      },
    },
    {
      icon: <FileUploadIcon />,
      name: 'Upload',
      onClick: useCallback(
        () => upload(rfInstance, props.initStore),
        [rfInstance, props.state]
      ),
    },
    {
      icon: <RestartAltIcon />,
      name: 'Reset',
      onClick: () => {
        window.location.href =
          process.env.NEXT_PUBLIC_BASE_PATH || '' + '/flow';
      },
    },
    {
      icon: <AspectRatioIcon />,
      name: 'PinBoard',
      onClick: () => {
        props.setGlobalScale(1);
      },
    },
  ];

  return (
    <>
      <Header actions={actions} runButtons={runButtons} width={'40%'} />
      <ShareBoard
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        name={dialogName}
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowHeader);
