import { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import './App.css';
import { extractFramesFromVideo } from './extractFrames';
import { Theme, Typography } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { createStyles } from '@material-ui/core';
import { LinearProgress } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    images: {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(1),
        width: theme.spacing(16),
        height: theme.spacing(16),
      },
    },
  }),
);

function App() {
  const [sources] = useState([
    "https://sumer-dev-2.joystream.app/storage/asset/v0/5FuptcSboufhRcwxn8JE6MXLJtGfhBmFvP1bqwh3p3D4dYKc",
    "https://sumer-dev-2.joystream.app/storage/asset/v0/5GKTQfWbwZAB8jga2VbwLZRSwfsjVBi4c2ZEH4LgRAT4MKft",
    "https://sumer-dev-2.joystream.app/storage/asset/v0/5HEzeVFhsx4h2nGVLh5SLL5XR66mN51jdC59Crfpn5APpkxj",
    "https://sumer-dev-2.joystream.app/storage/asset/v0/5FMGcHNAop6bDgHMSTS1waSHYz82mLP43KPSkdb5emQ9SLQ8",
    "https://sumer-dev-2.joystream.app/storage/asset/v0/5EyvUgQjngCWwGN95pRrWrbAQsrh7pAYc87R9ASJX3eswVEc",
    "https://video.keralalivestream.com/storage/asset/v0/5DqFvYRsTUGzsks3eoF5YANQy8r3c8J21CbppccXX9yeBadQ"
  ])
  const [src, setSrc] = useState(sources[0])
  const [fps, setFps] = useState(1)
  const [rowSize, setRowSize] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [frames, setFrames] = useState([])

  const classes = useStyles();

  useEffect(() => {
    if (src !== '' && fps > 0 && rowSize > 0) {
      setIsLoading(true)
      extractFramesFromVideo(src, fps, rowSize).then(newFrames => {
        setIsLoading(false)
        setFrames(newFrames)
      }).catch(err => {
        setIsLoading(false)
        console.error(err)
      })
    }
  }, [src, fps, rowSize])

  const updateSrc = (event: ChangeEvent<{}>, value: string | null, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<string> | undefined) => {
    setSrc(value || '')
  }

  const updateSrcOnBlur = (event: FocusEvent<HTMLDivElement> & { target: HTMLInputElement}) => {
      setSrc((prev) => prev !== event.target.value ? event.target.value : prev)
  }

  const updateFps = (e: { target: { value: any; }; }) => {
    const newValue = Number(e.target.value)
    if(newValue < 1) {
      setFps(1)
    } else {
      setFps(newValue)
    }
  }

  const updateRowSize = (e: { target: { value: any; }; }) => {
    const newValue = Number(e.target.value)
    if(newValue < 1) {
      setRowSize(1)
    } else {
      setRowSize(newValue)
    }
  }

  return (
    <div className={classes.root} >
      <Grid
        container
        spacing={3}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item lg={6} xs={12} className={classes.root}>
          <Typography>Settings:</Typography>
          <Autocomplete
              freeSolo
              style={{ width: '100%' }}
              options={sources}
              onChange={(updateSrc)}
              onBlur={updateSrcOnBlur}
              value={src}
              renderInput={(params) => <TextField {...params} label="Video src" variant="filled" />} />
          <TextField variant="filled" fullWidth id="fps" label="FPS" value={fps} onChange={updateFps} />
          <TextField variant="filled" fullWidth id="rowSize" label="Frames Per Line" value={rowSize} onChange={updateRowSize} />
          <LinearProgress hidden={!isLoading} />
          <Typography hidden={frames.length === 0}>Extracted Frames:</Typography>
        </Grid>
        <Grid item lg={6} xs={12}>
          {src && (<video controls height={300} src={src}></video>)}
        </Grid>
        {frames.map((imgSrc, index) => (
          <Grid item xs={12} key={index}>
            <Typography>Image {index}</Typography>
            <img src={imgSrc} alt={`i-${index}`} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default App;
