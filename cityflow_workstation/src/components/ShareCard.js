import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Fade,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import theme from '@/theme';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { deleteWorkflow, getWorkflow } from '@/utils/dataset';
import { download } from '@/utils/local';

export default function ShareCard({
  data,
  width,
  height,
  showInfo,
  borderRadius = 5,
  titleSize = 'h4',
  minWidth = 100,
  minHeight = 100,
  maxHeight = 600,
  maxWidth = 600,
  onClick,
  selected,
  edit,
  local,
}) {
  const { id, name, author, description, screenShot, label, score, icon } =
    data;
  const [hover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    deleteWorkflow(id).then(() => {
      setIsVisible(false);
    });
  };

  return (
    <>
      {isVisible && data && (
        <Card
          sx={{
            minWidth: minWidth,
            minHeight: minHeight,
            maxHeight,
            borderRadius: borderRadius,
            height: height,
            width: width,
            border:
              hover || selected
                ? `2px solid ${theme.palette.primary.main}`
                : theme.palette.primary.border,
            cursor: 'pointer',
            boxShadow: '4px 4px 10px 0px rgba(0,0,0,0.2)',
          }}
          style={{
            backgroundImage: screenShot ? `url(${screenShot})` : `url(${icon})`,
            backgroundSize: screenShot ? 'cover' : 50,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={onClick}
        >
          <CardContent
            sx={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {edit && (
              <Box sx={{ position: 'relative', height: '5%' }}>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: -5,
                    top: -10,
                    zIndex: 1,
                  }}
                  onClick={handleMenuClick}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
              </Box>
            )}
            <Typography variant={titleSize} sx={{ flexGrow: 1 }}>
              {name}
            </Typography>
            {score && (
              <Box position="relative">
                <Typography
                  variant={titleSize}
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: 0,
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                  }}
                >
                  {score.toFixed(2)}
                </Typography>
              </Box>
            )}

            {showInfo ? (
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.primary.main }}
                >
                  {author && `@${author}${label ? ' | ' + label : ''}`}
                </Typography>
                <Typography variant="caption">{`${description}`}</Typography>
              </Stack>
            ) : (
              <Fade in={hover}>
                <Stack spacing={1}>
                  <Typography variant="caption">{`${description}`}</Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    {author && `@${author}`}
                  </Typography>
                </Stack>
              </Fade>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
