
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar
} from '@mui/material';

export default function Welcome() {
  const [players, setPlayers] = useState([]);
  const [regularSeasonData, setRegularSeasonData] = useState({});
  const [postSeasonData, setPostSeasonData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Load JSON files
  useEffect(() => {
    fetch('/playersFreeThrowStats.json')
      .then(res => res.json())
      .then(data => setPlayers(data));

    fetch('/regular_season2.json')
      .then(res => res.json())
      .then(data => setRegularSeasonData(data));

    fetch('/post_season2.json')
      .then(res => res.json())
      .then(data => {
        setPostSeasonData(data);
      });
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
      <h1 className="text-3xl font-bold mb-6 text-center">Compare Your Shooting With The NBA Greats</h1>

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

      {/* Modal with season stats */}
      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        {selectedPlayer && (
          <>
            <DialogTitle>{selectedPlayer.Player}</DialogTitle>
            <DialogContent>
              <img
                src={getImageUrl(selectedPlayer.Id)}
                alt={selectedPlayer.Player}
                style={{ marginBottom: '16px', borderRadius: '8px', width: '150px' }}
              />

              <h3>Regular Season Stats</h3>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Season</TableCell>
                    <TableCell align="right">GP</TableCell>
                    <TableCell align="right">PTS</TableCell>
                    <TableCell align="right">AST</TableCell>
                    <TableCell align="right">REB</TableCell>
                    <TableCell align="right">FG%</TableCell>
                    <TableCell align="right">3P%</TableCell>
                    <TableCell align="right">FT%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regularSeasonData[selectedPlayer.Id]?.map((season, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{season.SEASON_ID}</TableCell>
                      <TableCell align="right">{season.GP}</TableCell>
                      <TableCell align="right">{season.PTS}</TableCell>
                      <TableCell align="right">{season.AST}</TableCell>
                      <TableCell align="right">{season.REB}</TableCell>
                      <TableCell align="right">{(season.FG_PCT * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right">{(season.FG3_PCT * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right">{(season.FT_PCT * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <h3 style={{ marginTop: '20px' }}>Post Season Stats</h3>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Season</TableCell>
                    <TableCell align="right">GP</TableCell>
                    <TableCell align="right">PTS</TableCell>
                    <TableCell align="right">AST</TableCell>
                    <TableCell align="right">REB</TableCell>
                    <TableCell align="right">FG%</TableCell>
                    <TableCell align="right">3P%</TableCell>
                    <TableCell align="right">FT%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postSeasonData[selectedPlayer.Id]?.map((season, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{season.SEASON_ID}</TableCell>
                      <TableCell align="right">{season.GP}</TableCell>
                      <TableCell align="right">{season.PTS}</TableCell>
                      <TableCell align="right">{season.AST}</TableCell>
                      <TableCell align="right">{season.REB}</TableCell>
                      <TableCell align="right">{(season.FG_PCT * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right">{(season.FG3_PCT * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right">{(season.FT_PCT * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
