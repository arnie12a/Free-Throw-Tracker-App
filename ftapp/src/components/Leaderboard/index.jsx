import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/authContext';

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
    const [targetPage, setTargetPage] = useState('');

    const handleFilter = () => {
        const range = 1;
        const filtered = allPlayers.filter(player =>
            Math.abs(player['FT%'] - userFTPercentage) <= range
        );
        setPlayers(filtered);
        setCurrentPage(1); // Reset to the first page after filtering
        setIsFiltered(true); // Show the reset button
    };

    const handleReset = () => {
        setPlayers(allPlayers);
        setCurrentPage(1); // Reset to the first page after resetting
        setIsFiltered(false); // Hide the reset button
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

    useEffect(() => {
        getUserFreeThrowPercentage();
        fetch('/players_ft.json')
            .then(response => response.json())
            .then(data => {
                setPlayers(data);
                setAllPlayers(data);
            })
            .catch(error => console.error('Error fetching the JSON file:', error));
    }, []);

    // Pagination logic
    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    const currentPlayers = filterPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

    const totalPlayers = filterPlayers.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setShowModal(false);
        }
    };

    // Determine the range of pages to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage === 1) {
                pageNumbers.push(1, 2, 3, '...', totalPages);
            } else if (currentPage === totalPages) {
                pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else if (currentPage === 2) {
                pageNumbers.push(1, 2, 3, '...', totalPages);
            } else if (currentPage === totalPages - 1) {
                pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    const handleEllipsisClick = () => {
        setShowModal(true);
    };

    const handleTargetPageChange = (e) => {
        setTargetPage(e.target.value);
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        const pageNumber = parseInt(targetPage, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            paginate(pageNumber);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Leaderboard</h1>
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

            <div className="mb-6"></div>

            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="mb-4">Total players: {filterPlayers.length}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPlayers.length > 0 ? (
                    currentPlayers.map(player => (
                        <div key={player.PLAYER} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                            <img src={getImageUrl(player.id)} alt={player.PLAYER} className="w-full h-48 object-cover rounded-t-lg" />
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
                <nav>
                    <ul className="flex list-none">
                        <li className="mx-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-800 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        {pageNumbers.map((number, index) => (
                            <li key={index} className="mx-2">
                                {number === '...' ? (
                                    <button
                                        onClick={handleEllipsisClick}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded"
                                    >
                                        ...
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => paginate(number)}
                                        className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                                    >
                                        {number}
                                    </button>
                                )}
                            </li>
                        ))}
                        <li className="mx-2">
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-800 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <form onSubmit={handleModalSubmit}>
                            <label className="block mb-2 text-gray-800">Enter page number:</label>
                            <input
                                type="number"
                                value={targetPage}
                                onChange={handleTargetPageChange}
                                className="p-2 border border-gray-300 rounded-lg w-full mb-4"
                                min="1"
                                max={totalPages}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Go
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
