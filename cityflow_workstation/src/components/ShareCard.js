import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Fade,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import theme from '@/theme';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { deleteWorkflow, searchWorkflow } from '@/utils/dataset';
// import { deleteUserFlow } from '@/utils/local';

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
  const { id, name, author, description, screenShot, label, score } = data;
  const [hover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleDelete = () => {
    // local
    //   ? deleteUserFlow(id).then(() => {
    //       setIsVisible(false);
    //     })
    //   :
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
                : '1px solid #212121',
            cursor: 'pointer',
          }}
          style={{
            backgroundImage: screenShot && `url(${screenShot})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left',
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
            <Box sx={{ position: 'relative' }}>
              {edit && (
                <IconButton
                  onClick={handleDelete}
                  size="large"
                  sx={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    zIndex: 1,
                  }}
                >
                  <RemoveCircleIcon fontSize="large" color="red" />
                </IconButton>
              )}
            </Box>
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
