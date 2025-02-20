import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/authContext';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Typography, Grid, Box } from '@mui/material';


export default function Leaderboard() {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [players, setPlayers] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [userFTPercentage, setUserFTPercentage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [playersPerPage] = useState(6);
    const [isFiltered, setIsFiltered] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const handleFilter = () => {
        const range = 1;
        const filtered = allPlayers.filter(player =>
            Math.abs(player['FT%'] - userFTPercentage) <= range
        );
        setPlayers(filtered);
        setCurrentPage(1);
        setIsFiltered(true);
    };

    const handleReset = () => {
        setPlayers(allPlayers);
        setCurrentPage(1);
        setIsFiltered(false);
    };

    const filterPlayers = players.filter(user =>
        `${user.PLAYER}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUserFreeThrowPercentage = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "users"), where("uid", "==", specificUID));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserFTPercentage(userData[0].ftPercentage);
    };

    const getImageUrl = (id) => {
        return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`;
    };

    const handleOpenModal = (player) => {
        setSelectedPlayer(player);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPlayer(null);
    };

    useEffect(() => {
        getUserFreeThrowPercentage();
        fetch('/nbaPlayerData.json')
            .then(response => response.json())
            .then(data => {
                setPlayers(data);
                setAllPlayers(data);
            })
            .catch(error => console.error('Error fetching the JSON file:', error));
    }, []);

    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    const currentPlayers = filterPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

    const totalPlayers = filterPlayers.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);

    return (
        <div className="container mx-auto p-6 bg-gray-100 pt-16">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mr-4"
                onClick={handleFilter}
            >
                See Your NBA Comparison
            </button>

            {isFiltered && (
                <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mr-4"
                    onClick={handleReset}
                >
                    Reset
                </button>
            )}

            <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6"
            />

            <p className="mb-4 pt-4 text-lg">Total players: {filterPlayers.length}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {currentPlayers.length > 0 ? (
                    currentPlayers.map(player => (
                        <div
                            key={player.PLAYER}
                            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                            onClick={() => handleOpenModal(player)}
                        >
                            <img src={getImageUrl(player.index)} alt={player.PLAYER} className="w-full h-48 object-cover rounded-t-lg" />
                            <div className="bg-gradient-to-r from-orange-400 to-gray-400 p-4">
                                <h2 className="text-xl font-semibold text-white">{player.PLAYER}</h2>
                                <p className="text-white">Free Throw Percentage: {player['FT%']}%</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-700 text-center col-span-3">No players found</p>
                )}
            </div>

            <div className="flex justify-center mt-8">
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                    size='large'
                />
            </div>

            <Dialog
  open={showModal}
  onClose={handleCloseModal}
  fullWidth
  maxWidth="sm"
>
  {selectedPlayer && (
    <>
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          backgroundColor: '#2d75bd',
          color: 'white',
          textAlign: 'center',
          paddingY: 2,
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {selectedPlayer.PLAYER}
        </Typography>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        dividers
        sx={{
          padding: 4,
          backgroundColor: '#f9f9f9',
        }}
      >
        {/* Player Image */}
        <Box display="flex" justifyContent="center" mb={4}>
          <img
            src={getImageUrl(selectedPlayer.index)}
            alt={`${selectedPlayer.PLAYER}`}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '4px solid #2d75bd',
              objectFit: 'cover',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.target.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
            onError={(e) => (e.target.src = 'defaultPlayerImage.png')}
          />
        </Box>

        {/* Player Stats */}
        <Grid container spacing={3}>
          {[
            { label: 'Games Played', value: selectedPlayer.GP },
            { label: 'Points', value: selectedPlayer.PTS },
            { label: 'Field Goal Percentage', value: `${selectedPlayer['FG%']}%` },
            { label: 'Three Point Percentage', value: `${selectedPlayer['3P%']}%` },
            { label: 'Rebounds', value: selectedPlayer.REB },
            { label: 'Assists', value: selectedPlayer.AST },
            { label: 'Steals', value: selectedPlayer.STL },
            { label: 'Blocks', value: selectedPlayer.BLK },
            { label: 'Turnovers', value: selectedPlayer.TOV },
          ].map((stat, index) => (
            <Grid key={index} item xs={12} sm={6}>
              <Typography variant="body1" fontSize="1rem" color="text.secondary">
                <strong>{stat.label}:</strong> {stat.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          justifyContent: 'center',
          padding: 3,
          backgroundColor: '#f9f9f9',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <Button
          onClick={handleCloseModal}
          variant="contained"
          sx={{
            backgroundColor: '#2d75bd',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            paddingX: 4,
            paddingY: 1.5,
            '&:hover': {
              backgroundColor: '#235a91',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>

        </div>
    );
}
