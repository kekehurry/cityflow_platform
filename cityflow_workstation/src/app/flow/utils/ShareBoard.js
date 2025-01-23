import * as React from 'react';
import {
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import { useState, useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { getFlowData, download } from '@/utils/local';
import theme from '@/theme';
import { saveWorkflow } from '@/utils/dataset';
import { connect } from 'react-redux';
import { useLocalStorage } from '@/utils/local';

const defaultRunner = process.env.NEXT_PUBLIC_DEFAULT_RUNNER;

const StyledInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    // borderRadius: '15px',
    height: 35,
  },
});

const mapStateToProps = (state, ownProps) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const ShareBoard = (props) => {
  const { dialogOpen, setDialogOpen, name } = props;
  const rfInstance = useReactFlow();
  const [author, setAuthor] = useLocalStorage('author', null);
  const [formValue, setFormValue] = useState({});
  const [sharing, setSharing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleDownload = useCallback(async () => {
    setSharing(true);
    setAuthor(formValue.author);
    const { nodes, edges, ...res } = props.state;
    const flowData = await getFlowData({
      rfInstance,
      state: { ...res, ...formValue },
    }).then((flowData) => {
      setSharing(false);
      return flowData;
    });
    download(flowData);
    setDialogOpen(false);
  }, [rfInstance, formValue]);

  const handleShare = useCallback(
    async ({ publish = false }) => {
      publish ? setPublishing(true) : setSharing(true);
      setAuthor(formValue.author);
      const { nodes, edges, ...res } = props.state;
      const flowData = await getFlowData({
        rfInstance,
        state: { ...res, ...formValue, basic: false },
      });
      const flowId = await saveWorkflow(flowData)
        .then((flowId) => {
          publish ? setPublishing(true) : setSharing(true);
          return flowId;
        })
        .finally(() => {
          publish ? setPublishing(false) : setSharing(false);
        });
      if (publish && flowId) {
        window.location.href = `/flow?id=${flowId}&pinBoard=true`;
      } else if (flowId) {
        window.location.href = `/flow?id=${flowId}`;
      }
      setDialogOpen(false);
    },
    [rfInstance, formValue]
  );

  const handleValueChange = (e) => {
    setFormValue({
      ...formValue,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => {
    setFormValue({ author: author });
  }, [author]);

  useEffect(() => {
    setFormValue({
      name: props.state?.name || '',
      description: props.state?.description || '',
      tag: props.state?.tag || '',
      city: props.state?.city || '',
      author: author || '',
      packages: props.state?.packages || '',
      image: defaultRunner,
    });
  }, [
    props.state?.name,
    props.state?.description,
    props.state?.tag,
    props.state?.city,
    author,
    props.state?.packages,
    props.state?.image,
  ]);

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        variant="outlined"
        PaperProps={{
          component: 'form',
          style: {
            border: '1px solid #424242',
            background: theme.palette.flow.shareBoard,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 20 }}>{name || 'Share'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <StyledInput
              label="name"
              id="name"
              value={formValue?.name || ''}
              onChange={handleValueChange}
              placeholder="what problem are you dealing with (e.g walkability)?"
              InputLabelProps={{ shrink: true }}
            />
            <Stack>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <StyledInput
                  fullWidth
                  label="city"
                  id="city"
                  value={formValue?.city || ''}
                  onChange={handleValueChange}
                  InputLabelProps={{ shrink: true }}
                />
                <StyledInput
                  fullWidth
                  label="author"
                  id="author"
                  value={formValue?.author || ''}
                  onChange={handleValueChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Stack>
            <TextField
              id="description"
              fullWidth
              label="description"
              onChange={handleValueChange}
              value={formValue?.description || ''}
              multiline
              rows={3}
              placeholder="breifly describe your workflow"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              id="tag"
              fullWidth
              label="tag"
              onChange={handleValueChange}
              value={formValue?.tag || ''}
              placeholder="tag your workflow"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              id="image"
              fullWidth
              label="image"
              value={defaultRunner}
              onChange={(e) => {
                handleValueChange({
                  target: { id: 'image', value: e.target.value },
                });
              }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={defaultRunner}>{defaultRunner}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions variant="outlined">
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <LoadingButton
            loading={sharing}
            onClick={name == 'Download' ? handleDownload : handleShare}
            color="secondary"
          >
            {name || 'Share'}
          </LoadingButton>
          <LoadingButton
            loading={publishing}
            onClick={() => handleShare({ publish: true })}
            color="secondary"
          >
            Publish
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareBoard);
