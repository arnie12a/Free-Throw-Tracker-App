
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

  const getAggregatedMetrics = (seasons) => {
    if (!seasons || seasons.length === 0) return null;
  
    let totalPTS = 0, totalAST = 0, totalREB = 0;
    let totalGP = 0;
    let totalFTM = 0, totalFTA = 0;
  
    // Percentages averaged per season, not per game
    let totalFGPct = 0, total3PPct = 0;
  
    seasons.forEach(s => {
      totalPTS += s.PTS;
      totalAST += s.AST;
      totalREB += s.REB;
      totalGP += s.GP;
  
      // FT calculation
      totalFTM += s.FTM;
      totalFTA += s.FTA;
  
      // FG% and 3P% are season percentages averaged equally
      totalFGPct += s.FG_PCT;
      total3PPct += s.FG3_PCT;
    });
  
    const numSeasons = seasons.length;
  
    return {
      ppg: (totalPTS / totalGP).toFixed(1),
      apg: (totalAST / totalGP).toFixed(1),
      rpg: (totalREB / totalGP).toFixed(1),
      fgPct: ((totalFGPct / numSeasons) * 100).toFixed(1) + "%",
      threePct: ((total3PPct / numSeasons) * 100).toFixed(1) + "%",
      ftPct: totalFTA > 0 ? ((totalFTM / totalFTA) * 100).toFixed(1) + "%" : "N/A"
    };
  };
  

  const getPerGameValue = (season, metric) => {
    if (!season || !season.GP) return null;
  
    switch (metric) {
      case "PTS":
        return (season.PTS / season.GP).toFixed(1);
      case "AST":
        return (season.AST / season.GP).toFixed(1);
      case "REB":
        return (season.REB / season.GP).toFixed(1);
      default:
        return null;
    }
  };
  
  

    const seasonArray =
    seasonType === "regular"
        ? regularSeasonData[selectedPlayer?.Id] || []
        : postSeasonData[selectedPlayer?.Id] || [];
      
    const aggregated = getAggregatedMetrics(seasonArray);


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

            <div className="flex gap-6 items-start mb-6">
  
              {/* Player Photo */}
              <img
                src={getImageUrl(selectedPlayer.Id)}
                alt={selectedPlayer.Player}
                style={{ borderRadius: "8px", width: "150px" }}
              />

              {/* Aggregated Stats Box */}
              {aggregated && (
                <div className="bg-gray-100 p-4 rounded-lg shadow w-full max-w-sm">
                  <h3 className="font-semibold text-lg mb-3">
                    {seasonType === "regular" ? "Regular Season Averages" : "Postseason Averages"}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">

                    {/* Column 1: Per Game Stats */}
                    <div className="flex flex-col gap-2">
                      <p><strong>PPG:</strong> {aggregated.ppg}</p>
                      <p><strong>APG:</strong> {aggregated.apg}</p>
                      <p><strong>RPG:</strong> {aggregated.rpg}</p>
                    </div>

                    {/* Column 2: Percentages */}
                    <div className="flex flex-col gap-2">
                      <p><strong>FG%:</strong> {aggregated.fgPct}</p>
                      <p><strong>3P%:</strong> {aggregated.threePct}</p>
                      <p><strong>FT%:</strong> {aggregated.ftPct}</p>
                    </div>

                  </div>
                </div>
              )}


            </div>



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
                    legend: { display: true },
                
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const seasonIndex = context.dataIndex;
                          const seasonData = seasonArray[seasonIndex];
                          const value = context.parsed.y;
                
                          // Values already shown
                          let label = `${context.dataset.label}: ${value}`;
                
                          // Add per-game averages ONLY for PTS, AST, REB
                          if (["PTS", "AST", "REB"].includes(metric)) {
                            const perGame = getPerGameValue(seasonData, metric);
                            if (perGame !== null) {
                              label += ` (Avg: ${perGame} per game)`;
                            }
                          }
                
                          return label;
                        }
                      }
                    }
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
