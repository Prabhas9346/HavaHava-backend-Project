const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('havahava.db'); // Adjust path as per your project structure
const app = express();

app.use(express.json());

// Route to get airport details by iata_code
app.get('/airport', (req, res) => {
  const { iata_code } = req.query;

  if (!iata_code) {
    return res.status(400).json({ error: 'iata_code parameter is required' });
  }

  const sql = `
    SELECT 
      Airport.id AS airport_id,
      Airport.icao_code,
      Airport.iata_code,
      Airport.name AS airport_name,
      Airport.type AS airport_type,
      Airport.latitude_deg,
      Airport.longitude_deg,
      Airport.elevation_ft,
      City.id AS city_id,
      City.name AS city_name,
      City.country_id AS city_country_id,
      City.is_active AS city_is_active,
      City.lat AS city_latitude,
      City.long AS city_longitude,
      Country.id AS country_id,
      Country.name AS country_name,
      Country.country_code_two,
      Country.country_code_three,
      Country.mobile_code,
      Country.continent_id
    FROM 
      Airport
    LEFT JOIN 
      City ON Airport.city_id = City.id
    LEFT JOIN 
      Country ON City.country_id = Country.id
    WHERE 
      Airport.iata_code = ?
    LIMIT 1;
  `;

  db.get(sql, [iata_code], (err, row) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Airport not found' });
    }

    // Construct the response object
    const response = {
      airport: {
        id: row.airport_id,
        icao_code: row.icao_code,
        iata_code: row.iata_code,
        name: row.airport_name,
        type: row.airport_type,
        latitude_deg: row.latitude_deg,
        longitude_deg: row.longitude_deg,
        elevation_ft: row.elevation_ft,
        address: {
          city: {
            id: row.city_id,
            name: row.city_name,
            country_id: row.city_country_id,
            is_active: row.city_is_active,
            lat: row.city_latitude,
            long: row.city_longitude
          },
          country: {
            id: row.country_id,
            name: row.country_name,
            country_code_two: row.country_code_two,
            country_code_three: row.country_code_three,
            mobile_code: row.mobile_code,
            continent_id: row.continent_id
          }
        }
      }
    };

    res.json(response);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
