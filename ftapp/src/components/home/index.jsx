import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, Slider, Typography } from '@mui/material';

const Home = () => {
  const { currentUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [position, setPosition] = useState('');
  const [goal, setGoal] = useState(0);
  const [ftPercentage, setFTPercentage] = useState(0);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormVisible(false);
    await setDoc(doc(db, 'users', currentUser.uid), {
      firstName,
      lastName,
      email,
      uid: currentUser.uid,
      ftGoalPercentage: goal,
      position,
    });
  };

  const getUserInfo = async () => {
    const specificUID = currentUser.uid;
    const q = query(collection(db, 'users'), where('uid', '==', specificUID));

    const querySnapshot = await getDocs(q);
    const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setFullName(`${userData[0].firstName} ${userData[0].lastName}`);
    if (userData[0].position !== 'None') {
      setGoal(userData[0].ftGoalPercentage);
      setPosition(userData[0].position);
      setFormVisible(false);
    } else {
      setFirstName(userData[0].firstName);
      setLastName(userData[0].lastName);
      setEmail(userData[0].email);
      setFormVisible(true);
    }
    setFTPercentage(userData[0].ftPercentage);
    setDifference(userData[0].ftGoalPercentage - userData[0].ftPercentage);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border border-gray-200">
        {fullName && goal && position ? (
          <div className="text-center">
            <Typography variant="h4" className="font-extrabold text-gray-800">
              Welcome, {fullName}
            </Typography>
            <div className="mt-4">
              <Typography variant="h6" color="textSecondary">Position: {position}</Typography>
              <Typography variant="h6" color="textSecondary" className="mt-2 pb-4">
                FT Percentage: {ftPercentage}%
              </Typography>
              <Typography variant="h6" color="textSecondary" className="mt-2 pb-4">
                {difference < 0 ? (
                  <>
                    You are shooting{' '}
                    <span className="text-red-500">{Math.abs(difference).toFixed(2)}%</span> under your goal. Keep grinding!
                  </>
                ) : (
                  <>
                    You are shooting{' '}
                    <span className="text-green-500">{difference.toFixed(2)}%</span> above your goal! Congratulations!
                  </>
                )}
              </Typography>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Typography variant="h6" color="textSecondary">No Data yet</Typography>
            <Typography variant="body2" color="textSecondary" className="mt-2">
              Please update your profile to see the information here.
            </Typography>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formVisible && (
        <Dialog open={formVisible} onClose={() => setFormVisible(false)} fullWidth>
          <DialogTitle>Add Your Info</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Position</InputLabel>
              <Select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                label="Position"
              >
                <MenuItem value="Point guard">Point guard</MenuItem>
                <MenuItem value="Shooting guard">Shooting guard</MenuItem>
                <MenuItem value="Small forward">Small forward</MenuItem>
                <MenuItem value="Power forward">Power forward</MenuItem>
                <MenuItem value="Center">Center</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body1" className="mt-2">Goal for Free Throw Percentage:</Typography>
            <Slider
              value={goal}
              onChange={(e, newValue) => setGoal(newValue)}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormVisible(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Home;
