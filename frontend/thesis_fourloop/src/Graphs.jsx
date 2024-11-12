import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "./Graphs.css";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Title,
} from "chart.js";

// Register the necessary components
ChartJS.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Title
);

const Graphs = () => {
  const [wasteData, setWasteData] = useState([]);
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'weekly'
  const [showMainData, setShowMainData] = useState(true); // Toggle between main data and waste diversion
  const [chartOptions, setChartOptions] = useState({
    scales: {
      x: {
        type: "category",
        ticks: {
          color: "black",
          font: { size: 14, family: "Arial", weight: "bold" },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
          font: { size: 12, family: "Verdana" },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "black",
          font: { size: 12, family: "Tahoma" },
        },
      },
    },
  });

  // Fetch data from the PostgreSQL API
  useEffect(() => {
    fetch("https://thesisfourloop.onrender.com/api/waste_data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setWasteData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Function to handle media query changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleMediaQueryChange = () => {
      if (mediaQuery.matches) {
        // If the media query matches (screen width <= 768px)
        setChartOptions((prevOptions) => ({
          ...prevOptions,
          scales: {
            x: { ...prevOptions.scales.x, ticks: { display: false } },
            y: { ...prevOptions.scales.y, ticks: { display: false } },
          },
        }));
      } else {
        // If the media query does not match (screen width > 768px)
        setChartOptions((prevOptions) => ({
          ...prevOptions,
          scales: {
            x: {
              ...prevOptions.scales.x,
              ticks: {
                display: true,
                color: "black",
                font: { size: 12, family: "Arial", weight: "bold" },
              },
            },
            y: {
              ...prevOptions.scales.y,
              ticks: {
                display: true,
                color: "black",
                font: { size: 12, family: "Verdana" },
              },
            },
          },
        }));
      }
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    handleMediaQueryChange(); // Initial check

    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  // Helper function to aggregate data weekly
  const aggregateWeeklyData = (data) => {
    const weeklyData = [];
    const weeks = {};

    data.forEach((entry) => {
      const weekKey = `${entry.week} ${entry.month} ${entry.year}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: entry.week,
          month: entry.month,
          year: entry.year,
          waste_collected: 0,
          recycled: 0,
          sanitary_landfills: 0,
          plastic: 0,
          pet: 0,
          metal: 0,
          glass: 0,
          paper: 0,
        };
      }

      // Accumulate values while ensuring to handle undefined gracefully
      weeks[weekKey].waste_collected += Number(entry.waste_collected) || 0;
      weeks[weekKey].recycled += Number(entry.recycled) || 0;
      weeks[weekKey].sanitary_landfills += Number(entry.sanitary_landfills) || 0;
      weeks[weekKey].plastic += Number(entry.plastic) || 0;
      weeks[weekKey].pet += Number(entry.pet) || 0;
      weeks[weekKey].metal += Number(entry.metal) || 0;
      weeks[weekKey].glass += Number(entry.glass) || 0;
      weeks[weekKey].paper += Number(entry.paper) || 0;
    });

    for (const week in weeks) {
      weeklyData.push(weeks[week]);
    }

    return weeklyData;
  };

  // Switch between daily and weekly view
  const displayData = viewMode === "weekly" ? aggregateWeeklyData(wasteData) : wasteData;

  // Function to get datasets based on the toggle
  const getDatasets = () => {
    if (showMainData) {
      return [
        {
          label: "Waste Collected",
          data: displayData.map((data) => Number(data.waste_collected) || 0),
          backgroundColor: "#064FF0",
          borderColor: "#064FF0",
          fill: false,
        },
        {
          label: "Recycled",
          data: displayData.map((data) => Number(data.recycled) || 0),
          backgroundColor: "#FFC0CB",
          borderColor: "#FFC0CB",
          fill: false,
        },
        {
          label: "Sanitary Landfills",
          data: displayData.map((data) => Number(data.sanitary_landfills) || 0),
          backgroundColor: "#FFA500",
          borderColor: "#FFA500",
          fill: false,
        },
      ];
    } else {
      return [
        {
          label: "Plastic",
          data: displayData.map((data) => Number(data.plastic) || 0),
          backgroundColor: "#FFA500",
          borderColor: "#FFA500",
          fill: false,
        },
        {
          label: "PET",
          data: displayData.map((data) => Number(data.pet) || 0),
          backgroundColor: "#00FF00",
          borderColor: "#00FF00",
          fill: false,
        },
        {
          label: "Metal/Tin Cans",
          data: displayData.map((data) => Number(data.metal) || 0),
          backgroundColor: "#FF0000",
          borderColor: "#FF0000",
          fill: false,
        },
        {
          label: "Glass Bottles",
          data: displayData.map((data) => Number(data.glass) || 0),
          backgroundColor: "#0000FF",
          borderColor: "#0000FF",
          fill: false,
        },
        {
          label: "Paper/Carton",
          data: displayData.map((data) => Number(data.paper) || 0),
          backgroundColor: "#800080",
          borderColor: "#800080",
          fill: false,
        },
      ];
    }
  };

  // Loading state if data hasn't been fetched yet
  if (wasteData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Graphs">
      <div className="graph-buttons">
        <div className="daily-weekly">
          <button onClick={() => setViewMode("daily")} id="daily">
            Daily View
          </button>
          <button onClick={() => setViewMode("weekly")}>Weekly View</button>
        </div>
        <div className="main-waste">
          <button onClick={() => setShowMainData(true)}>Main Data</button>
          <button onClick={() => setShowMainData(false)}>Waste Diversion</button>
        </div>
      </div>
      <div className="chart-container">
        <Line
          data={{
            labels: displayData.map((data) => {
              const weekNumber = data.week;
              return viewMode === "weekly"
                ? `Week ${weekNumber} (${data.month})`
                : `Day ${data.day}, Week ${weekNumber} (${data.month})`;
            }),
            datasets: getDatasets(),
          }}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default Graphs;
