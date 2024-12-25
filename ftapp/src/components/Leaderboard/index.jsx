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
                        <DialogTitle sx={{ backgroundColor: '#2d75bd', color: 'white', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold">
                            {selectedPlayer.PLAYER}
                            </Typography>
                        </DialogTitle>
                        <DialogContent dividers sx={{ padding: 3 }}>
                            {/* Player Image */}
                            <Box display="flex" justifyContent="center" mb={3}>
                            <img
                                src={getImageUrl(selectedPlayer.index)} // Use the player's ID to fetch the image
                                alt={`${selectedPlayer.PLAYER}`}
                                style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                border: '3px solid #2d75bd',
                                objectFit: 'cover',
                                }}
                                onError={(e) => (e.target.src = 'defaultPlayerImage.png')} // Fallback to a default image
                            />
                            </Box>

                            {/* Player Stats */}
                            <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Games Played:</strong> {selectedPlayer.GP}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Points:</strong> {selectedPlayer.PTS}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Field Goal Percentage:</strong> {selectedPlayer['FG%']}%
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Three Point Percentage:</strong> {selectedPlayer['3P%']}%
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Rebounds:</strong> {selectedPlayer.REB}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Assists:</strong> {selectedPlayer.AST}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Steals:</strong> {selectedPlayer.STL}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Blocks:</strong> {selectedPlayer.BLK}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1">
                                <strong>Turnovers:</strong> {selectedPlayer.TOV}
                                </Typography>
                            </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', padding: 2 }}>
                            <Button
                            onClick={handleCloseModal}
                            variant="contained"
                            color="primary"
                            sx={{
                                fontWeight: 'bold',
                                textTransform: 'none',
                                paddingX: 3,
                                paddingY: 1,
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
