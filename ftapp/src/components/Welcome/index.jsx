import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar
} from '@mui/material';

export default function Welcome() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Load JSON file from public folder
  useEffect(() => {
    fetch('/playersFreeThrowStats.json')
      .then(response => response.json())
      .then(data => setPlayers(data))
      .catch(error => console.error('Error fetching JSON:', error));
  }, []);

  // Filter by search
  const filteredPlayers = players.filter(player =>
    player.Player.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  // Modal handlers
  const handleOpenModal = (player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  const getImageUrl = (id) =>
    `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`;

  return (
    <div className="container mx-auto p-6 bg-gray-100 pt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Compare Your Shooting with NBA Greats</h1>

      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6 mb-6"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Player</strong></TableCell>
              <TableCell align="right"><strong>FT</strong></TableCell>
              <TableCell align="right"><strong>FTA</strong></TableCell>
              <TableCell align="right"><strong>Percentage</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPlayers.map((player) => (
              <TableRow
                key={player.Id}
                hover
                style={{ cursor: 'pointer' }}
                onClick={() => handleOpenModal(player)}
              >
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar
                      src={getImageUrl(player.Id)}
                      alt={player.Player}
                      sx={{ width: 40, height: 40 }}
                    />
                    {player.Player}
                  </div>
                </TableCell>
                <TableCell align="right">{player.FT}</TableCell>
                <TableCell align="right">{player.FTA}</TableCell>
                <TableCell align="right">{(player.Percentage * 100).toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-center mt-8">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, page) => setCurrentPage(page)}
          color="primary"
          size="large"
        />
      </div>

      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        {selectedPlayer && (
          <>
            <DialogTitle>{selectedPlayer.Player}</DialogTitle>
            <DialogContent>
              <p><strong>Free Throws Made:</strong> {selectedPlayer.FT}</p>
              <p><strong>Free Throws Attempted:</strong> {selectedPlayer.FTA}</p>
              <p><strong>Percentage:</strong> {(selectedPlayer.Percentage * 100).toFixed(2)}%</p>
              <img
                src={getImageUrl(selectedPlayer.Id)}
                alt={selectedPlayer.Player}
                style={{ marginTop: '16px', borderRadius: '8px', width: '100%' }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
