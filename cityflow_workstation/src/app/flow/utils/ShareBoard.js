import * as React from 'react';
import {
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState, useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { getFlowData, download } from '@/utils/local';
import theme from '@/theme';
import { saveWorkflow } from '@/utils/dataset';
import { connect } from 'react-redux';
import { useLocalStorage, getLocalStorage } from '@/utils/local';

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
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const defaultRunner = getLocalStorage('DEFAULT_RUNNER');

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleDownload = useCallback(async () => {
    setSaving(true);
    setAuthor(formValue.author);
    const { nodes, edges, ...res } = props.state;
    const flowData = await getFlowData({
      rfInstance,
      state: { ...res, ...formValue },
    }).then((flowData) => {
      setSaving(false);
      return flowData;
    });
    download(flowData);
    setDialogOpen(false);
  }, [rfInstance, formValue]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setAuthor(formValue.author);
    const { nodes, edges, ...res } = props.state;
    const flowData = await getFlowData({
      rfInstance,
      state: { ...res, ...formValue, basic: false, private: true },
    });
    const flowId = await saveWorkflow(flowData)
      .then((flowId) => {
        return flowId;
      })
      .finally(() => {
        setSaving(false);
      });
    setDialogOpen(false);
  }, [rfInstance, formValue]);

  const handleShare = useCallback(
    async ({ publish }) => {
      publish ? setPublishing(true) : setSaving(true);
      setAuthor(formValue.author);
      const { nodes, edges, ...res } = props.state;
      const flowData = await getFlowData({
        rfInstance,
        state: { ...res, ...formValue, basic: false, private: false },
      });
      const flowId = await saveWorkflow(flowData)
        .then((flowId) => {
          publish ? setPublishing(true) : setSaving(true);
          return flowId;
        })
        .finally(() => {
          publish ? setPublishing(false) : setSaving(false);
        });
      if (publish && flowId) {
        window.location.href = `/flow?id=${flowId}&pinBoard=true`;
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
      image: props.state?.image || defaultRunner,
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
            border: theme.palette.node.border,
            background: theme.palette.node.main,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 20 }}>{name || 'Share'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="name"
              id="name"
              value={formValue?.name || ''}
              onChange={handleValueChange}
              placeholder="what problem are you dealing with (e.g walkability)?"
              InputLabelProps={{ shrink: true }}
            />
            <Stack>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <TextField
                  fullWidth
                  label="city"
                  id="city"
                  value={formValue?.city || ''}
                  onChange={handleValueChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
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
              id="image"
              fullWidth
              label="image"
              value={formValue?.image || defaultRunner}
              onChange={handleValueChange}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>

        <DialogActions variant="outlined">
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <LoadingButton
            loading={saving}
            onClick={
              name == 'Download'
                ? handleDownload
                : name == 'Save'
                ? handleSave
                : handleShare
            }
            color="primary"
          >
            {name || 'Save'}
          </LoadingButton>
          <LoadingButton
            loading={publishing}
            onClick={() => handleShare({ publish: true })}
            color="primary"
          >
            Publish
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ShareBoard);
