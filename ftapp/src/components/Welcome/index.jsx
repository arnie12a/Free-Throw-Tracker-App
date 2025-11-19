
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar
} from '@mui/material';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);



export default function Welcome() {
  const [players, setPlayers] = useState([]);
  const [regularSeasonData, setRegularSeasonData] = useState({});
  const [postSeasonData, setPostSeasonData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [seasonType, setSeasonType] = useState("regular");
    const [metric, setMetric] = useState("PTS");


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

  // resets pagination when searching for player
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  

  // Filter by search
  const filteredPlayers = players.filter((player) => {
    const fullName = player.Player?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
  
    return fullName.includes(term);
  });
  

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

  const aggregateStats = (seasons) => {
    if (!seasons || seasons.length === 0) return null;
  
    // Totals for counting stats
    const totals = seasons.reduce((acc, s) => {
      acc.GP += s.GP;
      acc.PTS += s.PTS;   // total points (already per season total if your JSON is totals)
      acc.AST += s.AST;
      acc.REB += s.REB;
      acc.FG_PCT += s.FG_PCT;
      acc.FG3_PCT += s.FG3_PCT;
      acc.FT_PCT += s.FT_PCT;
      return acc;
    }, { GP:0, PTS:0, AST:0, REB:0, FG_PCT:0, FG3_PCT:0, FT_PCT:0 });
  
    const numSeasons = seasons.length;
  
    return {
      GP: totals.GP,
      PTS: totals.PTS,   // total points across all seasons
      AST: totals.AST,   // total assists
      REB: totals.REB,   // total rebounds
      FG_PCT: (totals.FG_PCT / numSeasons * 100).toFixed(1) + '%',   // average FG%
      FG3_PCT: (totals.FG3_PCT / numSeasons * 100).toFixed(1) + '%', // average 3P%
      FT_PCT: (totals.FT_PCT / numSeasons * 100).toFixed(1) + '%',   // average FT%
    };
  };

    const seasonArray =
    seasonType === "regular"
        ? regularSeasonData[selectedPlayer?.Id] || []
        : postSeasonData[selectedPlayer?.Id] || [];

    const chartSeasons = seasonArray.map((s) => s.SEASON_ID);

    const chartValues = seasonArray.map((s) => {
    switch (metric) {
        case "PTS": return s.PTS;
        case "AST": return s.AST;
        case "REB": return s.REB;
        case "FG%": return (s.FG_PCT * 100).toFixed(1);
        case "3P%": return (s.FG3_PCT * 100).toFixed(1);
        case "FT%": return (s.FT_PCT * 100).toFixed(1);
        default: return 0;
    }
    });

  
  

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-100 pt-16">
        <h1 className="text-xl sm:text-3xl font-bold mb-2 text-center">
            Compare Your Shooting With The NBA Greats
        </h1>

        <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
            Tap on any NBA player to explore their trends and career stats.
        </p>


      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6 mb-6"
      />

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
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
                style={{ marginBottom: "16px", borderRadius: "8px", width: "150px" }}
                />

                {/* ---- NEW: Toggle Buttons ---- */}
                <div className="flex gap-4 mb-4">
                <Button
                    variant={seasonType === "regular" ? "contained" : "outlined"}
                    onClick={() => setSeasonType("regular")}
                >
                    Regular Season
                </Button>

                <Button
                    variant={seasonType === "post" ? "contained" : "outlined"}
                    onClick={() => setSeasonType("post")}
                >
                    Postseason
                </Button>
                </div>

                {/* ---- Metric Toggle ---- */}
                <div className="flex gap-3 mb-6 overflow-x-auto">
                {["PTS", "AST", "REB", "FG%", "3P%", "FT%"].map((m) => (
                    <Button
                    key={m}
                    variant={metric === m ? "contained" : "outlined"}
                    onClick={() => setMetric(m)}
                    >
                    {m}
                    </Button>
                ))}
                </div>

                {/* ---- Line Chart ---- */}
                <Line
                data={{
                    labels: chartSeasons, // array of season labels from computed data
                    datasets: [
                    {
                        label: `${selectedPlayer.Player} ${metric}`,
                        data: chartValues, // computed metric values
                        borderWidth: 3,
                        tension: 0.3
                    }
                    ]
                }}
                options={{
                    responsive: true,
                    plugins: {
                    legend: { display: true }
                    },
                    scales: {
                    y: {
                        beginAtZero: false
                    }
                    }
                }}
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
