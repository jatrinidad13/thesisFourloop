CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    middle_name VARCHAR(150),
    last_name VARCHAR(150) NOT NULL,
    ext_name VARCHAR(150),
    roles VARCHAR(150) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL;

UPDATE users
SET roles = 'admin'
WHERE id = 8;

select * from users

DELETE FROM users;

-- creating table for waste_data
CREATE TABLE waste_data (
    id_waste SERIAL PRIMARY KEY,
    month VARCHAR(3),
    year VARCHAR(4),
    week VARCHAR(2),
    day VARCHAR(3),
    waste_collected INTEGER,
    recycled INTEGER,
    sanitary_landfills INTEGER,
    plastic INTEGER,
    pet INTEGER,
    metal INTEGER,
    glass INTEGER,
    paper INTEGER
);

alter table waste_data rename COLUMN glasse to glass;
--input for waste_data
INSERT INTO waste_data (
    month, year, week, day, waste_collected, recycled, sanitary_landfills,
    plastic, pet, metal,
    glass, paper
) VALUES
('Jul', '2024', '1', 'Mon', 142800, 2740, 140060, 360, 300, 380, 400, 1300),
('Jul', '2024', '1', 'Tue', 140700, 2670, 138030, 360, 290, 370, 380, 1270),
('Jul', '2024', '1', 'Wed', 136500, 2550, 133950, 340, 270, 350, 350, 1250),
('Jul', '2024', '1', 'Thu', 134400, 2460, 131940, 320, 260, 330, 320, 1220),
('Jul', '2024', '1', 'Fri', 119700, 2330, 117370, 290, 230, 290, 320, 1220),
('Jul', '2024', '1', 'Sat', 119700, 2350, 117350, 300, 230, 290, 320, 1220),
('Jul', '2024', '1', 'Sun', 10500, 1570, 8930, 190, 150, 170, 170, 890),
('Jul', '2024', '2', 'Mon', 130200, 2540, 127660, 350, 280, 330, 390, 1190),
('Jul', '2024', '2', 'Tue', 142800, 2820, 139980, 420, 330, 390, 430, 1250),
('Jul', '2024', '2', 'Wed', 142800, 2830, 139970, 400, 320, 370, 420, 1270),
('Jul', '2024', '2', 'Thu', 138600, 2720, 136880, 380, 310, 350, 410, 1230),
('Jul', '2024', '2', 'Fri', 147000, 3040, 143960, 450, 350, 410, 460, 1230),
('Jul', '2024', '2', 'Sat', 107100, 2510, 104590, 320, 260, 310, 320, 1150),
('Jul', '2024', '2', 'Sun', 10500, 1690, 8810, 200, 180, 170, 170, 900);

select * from waste_data;

select * from markers;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

CREATE TABLE markers (
  id_markers SERIAL PRIMARY KEY,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

drop TABLE pins;