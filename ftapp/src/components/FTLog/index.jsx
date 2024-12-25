import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  useMediaQuery,
} from '@mui/material';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/authContext';

export default function FTLog() {
  const [FTSessions, setFTSessions] = useState([]);
  const { currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [editFTMade, setEditFTMade] = useState('');
  const [editFTAttempted, setEditFTAttempted] = useState('');
  const [editSessionType, setEditSessionType] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getFTSession = async () => {
    const specificUID = currentUser.uid;
    const q = query(collection(db, 'ftsessions'), where('uid', '==', specificUID));

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFTSessions(sessions);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'ftsessions', id));
    setDeleteModalOpen(false);
    getFTSession();
  };

  const handleEditSubmit = async () => {
    if (editFTAttempted >= editFTMade) {
      await setDoc(doc(db, 'ftsessions', currentSession.id), {
        ...currentSession,
        ftAttempted: editFTAttempted,
        ftMade: editFTMade,
        percentage: Math.round((editFTMade / editFTAttempted) * 100),
        sessionType: editSessionType,
      });
      setEditModalOpen(false);
      getFTSession();
    }
  };

  useEffect(() => {
    getFTSession();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 pt-16 rounded-2xl">
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">FT Made</TableCell>
                <TableCell align="center">FT Attempted</TableCell>
                <TableCell align="center">Session Type</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FTSessions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((session) => (
                <TableRow hover key={session.id}>
                  <TableCell align="center">{session.date}</TableCell>
                  <TableCell align="center">{session.ftMade}</TableCell>
                  <TableCell align="center">{session.ftAttempted}</TableCell>
                  <TableCell align="center">{session.sessionType}</TableCell>
                  <TableCell align="center">
                    <Button color="primary" onClick={() => {
                      setCurrentSession(session);
                      setEditFTMade(session.ftMade);
                      setEditFTAttempted(session.ftAttempted);
                      setEditSessionType(session.sessionType);
                      setEditModalOpen(true);
                    }}>
                      Edit
                    </Button>
                    <Button color="error" onClick={() => {
                      setCurrentSession(session);
                      setDeleteModalOpen(true);
                    }}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={FTSessions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullScreen={isMobile}>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <TextField
            label="FT Made"
            type="number"
            value={editFTMade}
            onChange={(e) => setEditFTMade(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="FT Attempted"
            type="number"
            value={editFTAttempted}
            onChange={(e) => setEditFTAttempted(e.target.value)}
            fullWidth
            margin="dense"
          />
          <RadioGroup
            value={editSessionType}
            onChange={(e) => setEditSessionType(e.target.value)}
            row
            style={{ marginTop: '16px' }}
          >
            <FormControlLabel value="game" control={<Radio />} label="Game" />
            <FormControlLabel value="practice" control={<Radio />} label="Practice" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditSubmit} color="primary">
            Save
          </Button>
          <Button onClick={() => setEditModalOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} fullScreen={isMobile}>
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>Are you sure you want to delete this session?</DialogContent>
        <DialogActions>
          <Button onClick={() => handleDelete(currentSession.id)} color="error">
            Delete
          </Button>
          <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
