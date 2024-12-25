import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Material UI components
import { TextField, RadioGroup, FormControlLabel, Radio, Button, FormControl, FormLabel, Grid, Box } from '@mui/material';

export default function AddFTSession() {
  const [date, setDate] = useState('');
  const [ftMade, setFTMade] = useState(0);
  const [ftAttempted, setFTAttempted] = useState(0);
  const [sessionType, setSessionType] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleRadioChange = (e) => {
    setSessionType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ftMade > ftAttempted) {
      console.log('Impossible! Try again');
      return;
    }

    try {
      const percentage = Math.round((ftMade / ftAttempted) * 100);
      await addDoc(collection(db, 'ftsessions'), {
        ftMade: ftMade,
        ftAttempted: ftAttempted,
        percentage: percentage,
        date: date,
        sessionType: sessionType,
        uid: currentUser.uid,
      });
      navigate('/FTSummary');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 3, width: '100%', maxWidth: 400 }}>
        <h1 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '31px' }}>Add Free Throw Session</h1>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Free Throws Made"
                type="number"
                fullWidth
                value={ftMade}
                onChange={(e) => setFTMade(parseInt(e.target.value))}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Free Throws Attempted"
                type="number"
                fullWidth
                value={ftAttempted}
                onChange={(e) => setFTAttempted(parseInt(e.target.value))}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Session Type</FormLabel>
                <RadioGroup row value={sessionType} onChange={handleRadioChange}>
                  <FormControlLabel value="game" control={<Radio />} label="Game" />
                  <FormControlLabel value="practice" control={<Radio />} label="Practice" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  py: 1.5,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}
