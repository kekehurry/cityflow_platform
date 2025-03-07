import * as React from 'react';
import {
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState, useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { getFlowData, download } from '@/utils/local';
import theme from '@/theme';
import { saveWorkflow } from '@/utils/dataset';
import { connect } from 'react-redux';
import { getLocalStorage } from '@/utils/local';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const mapStateToProps = (state, ownProps) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

const ShareBoard = (props) => {
  const { dialogOpen, setDialogOpen, name } = props;
  const rfInstance = useReactFlow();
  const [formValue, setFormValue] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const defaultRunner = getLocalStorage('DEFAULT_RUNNER');
  const userName = getLocalStorage('USER_NAME');

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleCoverChange = (event) => {
    setImageLoading(true);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormValue({ ...formValue, screenShot: e.target.result });
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = useCallback(async () => {
    setSaving(true);
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
      const { nodes, edges, ...res } = props.state;
      const flowData = await getFlowData({
        rfInstance,
        state: {
          ...res,
          ...formValue,
          basic: false,
          private: false,
          category: 'workflows',
        },
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
    setFormValue({
      name: props.state?.name || '',
      description: props.state?.description || '',
      tag: props.state?.tag || '',
      category: props.state?.category || '',
      author: userName || '',
      packages: props.state?.packages || '',
      image: props.state?.image || defaultRunner,
    });
  }, [
    props.state?.name,
    props.state?.description,
    props.state?.tag,
    props.state?.city,
    userName,
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
                  label="category"
                  id="category"
                  value={formValue?.category || ''}
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
          <Stack sx={{ width: '100%', pt: 2 }}>
            <LoadingButton
              sx={{
                fontSize: 8,
                width: '100%',
                height: 40,
                color: 'gray',
                borderColor: 'gray',
              }}
              loading={imageLoading}
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<CloudUploadIcon />}
            >
              <input
                type="file"
                onChange={handleCoverChange}
                style={{
                  clip: 'rect(0 0 0 0)',
                  clipPath: 'inset(50%)',
                  height: 1,
                  overflow: 'hidden',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  whiteSpace: 'nowrap',
                  width: 1,
                }}
                accept=".png,.jpg"
              />
              <Typography variant="caption" sx={{ ontSize: 8 }}>
                Upload Cover Image
              </Typography>
            </LoadingButton>
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
