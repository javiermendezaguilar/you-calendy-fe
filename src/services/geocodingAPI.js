/**
 * Ultra-High-Performance Geocoding API Service
 * Optimized for speed, accuracy, and user experience with intelligent suggestions
 */

// Multiple free geocoding APIs for better performance and reliability
const GEOCODING_APIS = {
  nominatim: 'https://nominatim.openstreetmap.org',
  photon: 'https://photon.komoot.io',
  nominatim2: 'https://nominatim.openstreetmap.org', // Backup instance
  // Add more free instances as needed
};

// API performance tracking
const apiPerformance = {
  nominatim: { avgResponseTime: 300, successRate: 0.95, lastUsed: 0 },
  photon: { avgResponseTime: 150, successRate: 0.98, lastUsed: 0 },
  nominatim2: { avgResponseTime: 300, successRate: 0.95, lastUsed: 0 }
};

// City categories for better suggestions and ranking
const CITY_CATEGORIES = {
  // Major global cities (score 100)
  GLOBAL_METROPOLIS: [
    'new york', 'london', 'paris', 'tokyo', 'sydney', 'toronto', 'berlin', 'madrid', 'rome', 'amsterdam',
    'los angeles', 'chicago', 'houston', 'mumbai', 'delhi', 'bangalore', 'melbourne', 'vancouver', 'barcelona', 'milan',
    'karachi', 'lahore', 'islamabad', 'singapore', 'hong kong', 'seoul', 'bangkok', 'jakarta', 'dubai', 'cairo',
    'sao paulo', 'rio de janeiro', 'buenos aires', 'valencia', 'seville', 'malaga', 'bilbao', 'alicante'
  ],
  
  // National capitals (score 95)
  CAPITALS: [
    'islamabad', 'washington', 'london', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam', 'tokyo', 'canberra',
    'ottawa', 'new delhi', 'singapore', 'seoul', 'bangkok', 'jakarta', 'manila', 'kuala lumpur', 'taipei', 'abu dhabi',
    'riyadh', 'doha', 'kuwait city', 'tehran', 'baghdad', 'cairo', 'lagos', 'johannesburg', 'nairobi', 'casablanca',
    'tunis', 'algiers', 'lima', 'bogota', 'santiago', 'caracas', 'quito', 'buenos aires'
  ],
  
  // Major economic centers (score 90)
  ECONOMIC_HUBS: [
    'new york', 'london', 'singapore', 'hong kong', 'tokyo', 'frankfurt', 'zurich', 'dubai', 'mumbai', 'bangalore',
    'sao paulo', 'toronto', 'sydney', 'melbourne', 'amsterdam', 'paris', 'madrid', 'milan', 'seoul', 'taipei',
    'barcelona', 'valencia', 'bilbao', 'malaga', 'alicante', 'granada', 'murcia'
  ],
  
  // Tourist destinations (score 85)
  TOURIST_DESTINATIONS: [
    'paris', 'rome', 'london', 'barcelona', 'amsterdam', 'tokyo', 'sydney', 'singapore', 'dubai', 'cairo',
    'rio de janeiro', 'buenos aires', 'lima', 'bangkok', 'manila', 'hong kong', 'seoul', 'taipei', 'osaka', 'kyoto',
    'las vegas', 'miami', 'orlando', 'san diego', 'san francisco', 'seattle', 'boston', 'atlanta', 'denver', 'phoenix',
    'madrid', 'valencia', 'seville', 'malaga', 'granada', 'cordoba', 'alicante', 'palma', 'san sebastian', 'marbella'
  ],
  
  // Tech hubs (score 90)
  TECH_HUBS: [
    'san francisco', 'seattle', 'austin', 'boston', 'denver', 'atlanta', 'bangalore', 'hyderabad', 'singapore', 'tel aviv',
    'dublin', 'amsterdam', 'berlin', 'munich', 'stockholm', 'helsinki', 'toronto', 'vancouver', 'sydney', 'melbourne',
    'madrid', 'barcelona', 'valencia', 'bilbao', 'alicante'
  ],
  
  // Spanish cities (score 90-100 for Spanish client)
  SPANISH_CITIES: [
    'madrid', 'barcelona', 'valencia', 'seville', 'zaragoza', 'malaga', 'murcia', 'palma', 'las palmas', 'bilbao',
    'alicante', 'cordoba', 'valladolid', 'vigo', 'gijon', 'hospitalet', 'vitoria', 'coruna', 'granada', 'elche',
    'santa cruz', 'oviedo', 'santander', 'pamplona', 'almeria', 'burgos', 'salamanca', 'albacete', 'huelva', 'leon',
    'cadiz', 'tarragona', 'lleida', 'marbella', 'mataro', 'alcala', 'fuenlabrada', 'leganes', 'getafe', 'alcorcon',
    'torrejon', 'parla', 'coslada', 'mostoles', 'alcobendas', 'san sebastian', 'logrono', 'badajoz', 'lugo', 'ourense',
    'pontevedra', 'ceuta', 'melilla', 'dos hermanas', 'jerez', 'cartagena', 'aviles', 'ferrol', 'sabadell', 'terrassa',
    'badalona', 'castellon', 'algeciras', 'jaen', 'linares', 'donostia', 'gasteiz', 'irun', 'barakaldo', 'sant boi',
    'rubi', 'viladecans', 'cornella', 'el prat'
  ]
};

// Smart ranking system based on city importance and user context
const getCityRankingScore = (city, query, context = {}) => {
  const cityKey = city.value.toLowerCase().split(',')[0].trim();
  let baseScore = city.score || 50;
  
  // Category-based scoring
  for (const [category, cities] of Object.entries(CITY_CATEGORIES)) {
    if (cities.includes(cityKey)) {
      switch (category) {
        case 'GLOBAL_METROPOLIS':
          baseScore = Math.max(baseScore, 100);
          break;
        case 'CAPITALS':
          baseScore = Math.max(baseScore, 95);
          break;
        case 'ECONOMIC_HUBS':
        case 'TECH_HUBS':
          baseScore = Math.max(baseScore, 90);
          break;
        case 'TOURIST_DESTINATIONS':
          baseScore = Math.max(baseScore, 85);
          break;
        case 'SPANISH_CITIES':
          // Spanish cities get high priority for Spanish clients
          baseScore = Math.max(baseScore, 95);
          break;
      }
    }
  }
  
  // Spanish cities boost (since client is from Spain)
  if (CITY_CATEGORIES.SPANISH_CITIES.includes(cityKey)) {
    baseScore += 15; // Extra boost for Spanish cities
  }
  
  // Context-based scoring
  if (context.country) {
    const cityCountry = city.value.split(',').pop()?.trim().toLowerCase();
    const contextCountry = context.country.toLowerCase();
    if (cityCountry.includes(contextCountry)) {
      baseScore += 10; // Boost cities from user's country
    }
  }
  
  if (context.region) {
    const cityRegion = city.value.toLowerCase();
    if (cityRegion.includes(context.region.toLowerCase())) {
      baseScore += 5; // Boost cities from user's region
    }
  }
  
  // Population-based scoring (if available)
  if (city.population) {
    if (city.population > 10000000) baseScore += 5; // Mega cities
    else if (city.population > 5000000) baseScore += 3; // Large cities
    else if (city.population > 1000000) baseScore += 1; // Major cities
  }
  
  // Recent search boost
  if (searchAnalytics.userHistory.has(query.toLowerCase())) {
    baseScore += 2;
  }
  
  return Math.min(baseScore, 100); // Cap at 100
};

// Enhanced cache for instant suggestions with coordinates and fuzzy matching
const INSTANT_CITIES_CACHE = new Map([
  // Major world cities with coordinates for instant display
  ['new york', { value: 'New York, NY, USA', label: 'New York, NY, USA', coordinates: [40.7128, -74.0060], cached: true, score: 100 }],
  ['london', { value: 'London, UK', label: 'London, UK', coordinates: [51.5074, -0.1278], cached: true, score: 100 }],
  ['paris', { value: 'Paris, France', label: 'Paris, France', coordinates: [48.8566, 2.3522], cached: true, score: 100 }],
  ['tokyo', { value: 'Tokyo, Japan', label: 'Tokyo, Japan', coordinates: [35.6762, 139.6503], cached: true, score: 100 }],
  ['sydney', { value: 'Sydney, Australia', label: 'Sydney, Australia', coordinates: [-33.8688, 151.2093], cached: true, score: 100 }],
  ['toronto', { value: 'Toronto, Canada', label: 'Toronto, Canada', coordinates: [43.6532, -79.3832], cached: true, score: 100 }],
  ['berlin', { value: 'Berlin, Germany', label: 'Berlin, Germany', coordinates: [52.5200, 13.4050], cached: true, score: 100 }],
  ['madrid', { value: 'Madrid, Spain', label: 'Madrid, Spain', coordinates: [40.4168, -3.7038], cached: true, score: 100 }],
  ['rome', { value: 'Rome, Italy', label: 'Rome, Italy', coordinates: [41.9028, 12.4964], cached: true, score: 100 }],
  ['amsterdam', { value: 'Amsterdam, Netherlands', label: 'Amsterdam, Netherlands', coordinates: [52.3676, 4.9041], cached: true, score: 100 }],
  ['los angeles', { value: 'Los Angeles, CA, USA', label: 'Los Angeles, CA, USA', coordinates: [34.0522, -118.2437], cached: true, score: 100 }],
  ['chicago', { value: 'Chicago, IL, USA', label: 'Chicago, IL, USA', coordinates: [41.8781, -87.6298], cached: true, score: 100 }],
  ['houston', { value: 'Houston, TX, USA', label: 'Houston, TX, USA', coordinates: [29.7604, -95.3698], cached: true, score: 100 }],
  ['mumbai', { value: 'Mumbai, India', label: 'Mumbai, India', coordinates: [19.0760, 72.8777], cached: true, score: 100 }],
  ['delhi', { value: 'Delhi, India', label: 'Delhi, India', coordinates: [28.7041, 77.1025], cached: true, score: 100 }],
  ['bangalore', { value: 'Bangalore, India', label: 'Bangalore, India', coordinates: [12.9716, 77.5946], cached: true, score: 100 }],
  ['melbourne', { value: 'Melbourne, Australia', label: 'Melbourne, Australia', coordinates: [-37.8136, 144.9631], cached: true, score: 100 }],
  ['vancouver', { value: 'Vancouver, Canada', label: 'Vancouver, Canada', coordinates: [49.2827, -123.1207], cached: true, score: 100 }],
  ['barcelona', { value: 'Barcelona, Spain', label: 'Barcelona, Spain', coordinates: [41.3851, 2.1734], cached: true, score: 100 }],
  ['milan', { value: 'Milan, Italy', label: 'Milan, Italy', coordinates: [45.4642, 9.1900], cached: true, score: 100 }],
  
  // Pakistan cities
  ['karachi', { value: 'Karachi, Pakistan', label: 'Karachi, Pakistan', coordinates: [24.8607, 67.0011], cached: true, score: 100 }],
  ['lahore', { value: 'Lahore, Pakistan', label: 'Lahore, Pakistan', coordinates: [31.5204, 74.3587], cached: true, score: 100 }],
  ['islamabad', { value: 'Islamabad, Pakistan', label: 'Islamabad, Pakistan', coordinates: [33.6844, 73.0479], cached: true, score: 100 }],
  ['rawalpindi', { value: 'Rawalpindi, Pakistan', label: 'Rawalpindi, Pakistan', coordinates: [33.5651, 73.0169], cached: true, score: 95 }],
  ['faisalabad', { value: 'Faisalabad, Pakistan', label: 'Faisalabad, Pakistan', coordinates: [31.4504, 73.1350], cached: true, score: 95 }],
  ['peshawar', { value: 'Peshawar, Pakistan', label: 'Peshawar, Pakistan', coordinates: [34.0151, 71.5249], cached: true, score: 95 }],
  ['quetta', { value: 'Quetta, Pakistan', label: 'Quetta, Pakistan', coordinates: [30.1798, 66.9750], cached: true, score: 95 }],
  ['multan', { value: 'Multan, Pakistan', label: 'Multan, Pakistan', coordinates: [30.1575, 71.5249], cached: true, score: 95 }],
  ['hyderabad', { value: 'Hyderabad, Pakistan', label: 'Hyderabad, Pakistan', coordinates: [25.3960, 68.3578], cached: true, score: 95 }],
  ['gujranwala', { value: 'Gujranwala, Pakistan', label: 'Gujranwala, Pakistan', coordinates: [32.1877, 74.1945], cached: true, score: 90 }],
  
  // More US cities
  ['san francisco', { value: 'San Francisco, CA, USA', label: 'San Francisco, CA, USA', coordinates: [37.7749, -122.4194], cached: true, score: 95 }],
  ['seattle', { value: 'Seattle, WA, USA', label: 'Seattle, WA, USA', coordinates: [47.6062, -122.3321], cached: true, score: 95 }],
  ['boston', { value: 'Boston, MA, USA', label: 'Boston, MA, USA', coordinates: [42.3601, -71.0589], cached: true, score: 95 }],
  ['miami', { value: 'Miami, FL, USA', label: 'Miami, FL, USA', coordinates: [25.7617, -80.1918], cached: true, score: 95 }],
  ['las vegas', { value: 'Las Vegas, NV, USA', label: 'Las Vegas, NV, USA', coordinates: [36.1699, -115.1398], cached: true, score: 95 }],
  ['denver', { value: 'Denver, CO, USA', label: 'Denver, CO, USA', coordinates: [39.7392, -104.9903], cached: true, score: 95 }],
  ['atlanta', { value: 'Atlanta, GA, USA', label: 'Atlanta, GA, USA', coordinates: [33.7490, -84.3880], cached: true, score: 95 }],
  ['dallas', { value: 'Dallas, TX, USA', label: 'Dallas, TX, USA', coordinates: [32.7767, -96.7970], cached: true, score: 95 }],
  ['phoenix', { value: 'Phoenix, AZ, USA', label: 'Phoenix, AZ, USA', coordinates: [33.4484, -112.0740], cached: true, score: 95 }],
  ['detroit', { value: 'Detroit, MI, USA', label: 'Detroit, MI, USA', coordinates: [42.3314, -83.0458], cached: true, score: 95 }],
  ['orlando', { value: 'Orlando, FL, USA', label: 'Orlando, FL, USA', coordinates: [28.5383, -81.3792], cached: true, score: 90 }],
  ['san diego', { value: 'San Diego, CA, USA', label: 'San Diego, CA, USA', coordinates: [32.7157, -117.1611], cached: true, score: 90 }],
  ['portland', { value: 'Portland, OR, USA', label: 'Portland, OR, USA', coordinates: [45.5152, -122.6784], cached: true, score: 90 }],
  ['nashville', { value: 'Nashville, TN, USA', label: 'Nashville, TN, USA', coordinates: [36.1627, -86.7816], cached: true, score: 90 }],
  ['austin', { value: 'Austin, TX, USA', label: 'Austin, TX, USA', coordinates: [30.2672, -97.7431], cached: true, score: 90 }],
  
  // More Indian cities
  ['hyderabad', { value: 'Hyderabad, India', label: 'Hyderabad, India', coordinates: [17.3850, 78.4867], cached: true, score: 95 }],
  ['chennai', { value: 'Chennai, India', label: 'Chennai, India', coordinates: [13.0827, 80.2707], cached: true, score: 95 }],
  ['kolkata', { value: 'Kolkata, India', label: 'Kolkata, India', coordinates: [22.5726, 88.3639], cached: true, score: 95 }],
  ['pune', { value: 'Pune, India', label: 'Pune, India', coordinates: [18.5204, 73.8567], cached: true, score: 95 }],
  ['ahmedabad', { value: 'Ahmedabad, India', label: 'Ahmedabad, India', coordinates: [23.0225, 72.5714], cached: true, score: 95 }],
  ['jaipur', { value: 'Jaipur, India', label: 'Jaipur, India', coordinates: [26.9124, 75.7873], cached: true, score: 90 }],
  ['surat', { value: 'Surat, India', label: 'Surat, India', coordinates: [21.1702, 72.8311], cached: true, score: 90 }],
  ['lucknow', { value: 'Lucknow, India', label: 'Lucknow, India', coordinates: [26.8467, 80.9462], cached: true, score: 90 }],
  ['kanpur', { value: 'Kanpur, India', label: 'Kanpur, India', coordinates: [26.4499, 80.3319], cached: true, score: 90 }],
  ['nagpur', { value: 'Nagpur, India', label: 'Nagpur, India', coordinates: [21.1458, 79.0882], cached: true, score: 90 }],
  
  // More European cities
  ['munich', { value: 'Munich, Germany', label: 'Munich, Germany', coordinates: [48.1351, 11.5820], cached: true, score: 95 }],
  ['hamburg', { value: 'Hamburg, Germany', label: 'Hamburg, Germany', coordinates: [53.5511, 9.9937], cached: true, score: 95 }],
  ['cologne', { value: 'Cologne, Germany', label: 'Cologne, Germany', coordinates: [50.9375, 6.9603], cached: true, score: 90 }],
  ['frankfurt', { value: 'Frankfurt, Germany', label: 'Frankfurt, Germany', coordinates: [50.1109, 8.6821], cached: true, score: 90 }],
  ['stuttgart', { value: 'Stuttgart, Germany', label: 'Stuttgart, Germany', coordinates: [48.7758, 9.1829], cached: true, score: 90 }],
  ['lyon', { value: 'Lyon, France', label: 'Lyon, France', coordinates: [45.7640, 4.8357], cached: true, score: 95 }],
  ['marseille', { value: 'Marseille, France', label: 'Marseille, France', coordinates: [43.2965, 5.3698], cached: true, score: 95 }],
  ['toulouse', { value: 'Toulouse, France', label: 'Toulouse, France', coordinates: [43.6047, 1.4442], cached: true, score: 90 }],
  ['nice', { value: 'Nice, France', label: 'Nice, France', coordinates: [43.7102, 7.2620], cached: true, score: 90 }],
  ['naples', { value: 'Naples, Italy', label: 'Naples, Italy', coordinates: [40.8518, 14.2681], cached: true, score: 95 }],
  ['turin', { value: 'Turin, Italy', label: 'Turin, Italy', coordinates: [45.0703, 7.6869], cached: true, score: 90 }],
  ['palermo', { value: 'Palermo, Italy', label: 'Palermo, Italy', coordinates: [38.1157, 13.3613], cached: true, score: 90 }],
  ['valencia', { value: 'Valencia, Spain', label: 'Valencia, Spain', coordinates: [39.4699, -0.3763], cached: true, score: 95 }],
  ['seville', { value: 'Seville, Spain', label: 'Seville, Spain', coordinates: [37.3891, -5.9845], cached: true, score: 90 }],
  ['zaragoza', { value: 'Zaragoza, Spain', label: 'Zaragoza, Spain', coordinates: [41.6488, -0.8891], cached: true, score: 90 }],
  
  // Comprehensive Spanish cities coverage
  ['dos hermanas', { value: 'Dos Hermanas, Spain', label: 'Dos Hermanas, Spain', coordinates: [37.2833, -5.9167], cached: true, score: 90 }],
  ['malaga', { value: 'Málaga, Spain', label: 'Málaga, Spain', coordinates: [36.7213, -4.4214], cached: true, score: 95 }],
  ['murcia', { value: 'Murcia, Spain', label: 'Murcia, Spain', coordinates: [37.9922, -1.1307], cached: true, score: 90 }],
  ['palma', { value: 'Palma, Spain', label: 'Palma, Spain', coordinates: [39.5696, 2.6502], cached: true, score: 90 }],
  ['las palmas', { value: 'Las Palmas, Spain', label: 'Las Palmas, Spain', coordinates: [28.1248, -15.4300], cached: true, score: 90 }],
  ['bilbao', { value: 'Bilbao, Spain', label: 'Bilbao, Spain', coordinates: [43.2627, -2.9253], cached: true, score: 90 }],
  ['alicante', { value: 'Alicante, Spain', label: 'Alicante, Spain', coordinates: [38.3452, -0.4810], cached: true, score: 90 }],
  ['cordoba', { value: 'Córdoba, Spain', label: 'Córdoba, Spain', coordinates: [37.8882, -4.7794], cached: true, score: 90 }],
  ['valladolid', { value: 'Valladolid, Spain', label: 'Valladolid, Spain', coordinates: [41.6523, -4.7245], cached: true, score: 85 }],
  ['vigo', { value: 'Vigo, Spain', label: 'Vigo, Spain', coordinates: [42.2406, -8.7207], cached: true, score: 85 }],
  ['gijon', { value: 'Gijón, Spain', label: 'Gijón, Spain', coordinates: [43.5357, -5.6615], cached: true, score: 85 }],
  ['hospitalet', { value: 'Hospitalet, Spain', label: 'Hospitalet, Spain', coordinates: [41.3596, 2.0998], cached: true, score: 85 }],
  ['vitoria', { value: 'Vitoria, Spain', label: 'Vitoria, Spain', coordinates: [42.8467, -2.6716], cached: true, score: 85 }],
  ['coruna', { value: 'A Coruña, Spain', label: 'A Coruña, Spain', coordinates: [43.3713, -8.3960], cached: true, score: 85 }],
  ['granada', { value: 'Granada, Spain', label: 'Granada, Spain', coordinates: [37.1773, -3.5986], cached: true, score: 90 }],
  ['elche', { value: 'Elche, Spain', label: 'Elche, Spain', coordinates: [38.2622, -0.7011], cached: true, score: 80 }],
  ['santa cruz', { value: 'Santa Cruz de Tenerife, Spain', label: 'Santa Cruz de Tenerife, Spain', coordinates: [28.4636, -16.2518], cached: true, score: 85 }],
  ['oviedo', { value: 'Oviedo, Spain', label: 'Oviedo, Spain', coordinates: [43.3603, -5.8448], cached: true, score: 80 }],
  ['santander', { value: 'Santander, Spain', label: 'Santander, Spain', coordinates: [43.4623, -3.8099], cached: true, score: 80 }],
  ['pamplona', { value: 'Pamplona, Spain', label: 'Pamplona, Spain', coordinates: [42.8182, -1.6443], cached: true, score: 80 }],
  ['almeria', { value: 'Almería, Spain', label: 'Almería, Spain', coordinates: [36.8381, -2.4597], cached: true, score: 80 }],
  ['burgos', { value: 'Burgos, Spain', label: 'Burgos, Spain', coordinates: [42.3409, -3.6997], cached: true, score: 80 }],
  ['salamanca', { value: 'Salamanca, Spain', label: 'Salamanca, Spain', coordinates: [40.9701, -5.6635], cached: true, score: 80 }],
  ['albacete', { value: 'Albacete, Spain', label: 'Albacete, Spain', coordinates: [38.9942, -1.8584], cached: true, score: 80 }],
  ['huelva', { value: 'Huelva, Spain', label: 'Huelva, Spain', coordinates: [37.2578, -6.9507], cached: true, score: 80 }],
  ['leon', { value: 'León, Spain', label: 'León, Spain', coordinates: [42.5987, -5.5671], cached: true, score: 80 }],
  ['cadiz', { value: 'Cádiz, Spain', label: 'Cádiz, Spain', coordinates: [36.5298, -6.2926], cached: true, score: 80 }],
  ['tarragona', { value: 'Tarragona, Spain', label: 'Tarragona, Spain', coordinates: [41.1189, 1.2445], cached: true, score: 80 }],
  ['lleida', { value: 'Lleida, Spain', label: 'Lleida, Spain', coordinates: [41.6176, 0.6200], cached: true, score: 80 }],
  ['marbella', { value: 'Marbella, Spain', label: 'Marbella, Spain', coordinates: [36.5101, -4.8824], cached: true, score: 80 }],
  ['mataro', { value: 'Mataró, Spain', label: 'Mataró, Spain', coordinates: [41.5401, 2.4474], cached: true, score: 75 }],
  ['alcala', { value: 'Alcalá de Henares, Spain', label: 'Alcalá de Henares, Spain', coordinates: [40.4817, -3.3642], cached: true, score: 75 }],
  ['fuenlabrada', { value: 'Fuenlabrada, Spain', label: 'Fuenlabrada, Spain', coordinates: [40.2842, -3.7942], cached: true, score: 75 }],
  ['leganes', { value: 'Leganés, Spain', label: 'Leganés, Spain', coordinates: [40.3272, -3.7635], cached: true, score: 75 }],
  ['getafe', { value: 'Getafe, Spain', label: 'Getafe, Spain', coordinates: [40.3047, -3.7307], cached: true, score: 75 }],
  ['alcorcon', { value: 'Alcorcón, Spain', label: 'Alcorcón, Spain', coordinates: [40.3489, -3.8286], cached: true, score: 75 }],
  ['torrejon', { value: 'Torrejón de Ardoz, Spain', label: 'Torrejón de Ardoz, Spain', coordinates: [40.4614, -3.4978], cached: true, score: 75 }],
  ['parla', { value: 'Parla, Spain', label: 'Parla, Spain', coordinates: [40.2364, -3.7675], cached: true, score: 75 }],
  ['coslada', { value: 'Coslada, Spain', label: 'Coslada, Spain', coordinates: [40.4239, -3.5614], cached: true, score: 75 }],
  ['mostoles', { value: 'Móstoles, Spain', label: 'Móstoles, Spain', coordinates: [40.3228, -3.8647], cached: true, score: 75 }],
  ['alcobendas', { value: 'Alcobendas, Spain', label: 'Alcobendas, Spain', coordinates: [40.5475, -3.6419], cached: true, score: 75 }],
  ['san sebastian', { value: 'San Sebastián, Spain', label: 'San Sebastián, Spain', coordinates: [43.3183, -1.9812], cached: true, score: 85 }],
  ['logrono', { value: 'Logroño, Spain', label: 'Logroño, Spain', coordinates: [42.4627, -2.4449], cached: true, score: 80 }],
  ['badajoz', { value: 'Badajoz, Spain', label: 'Badajoz, Spain', coordinates: [38.8794, -6.9707], cached: true, score: 80 }],
  ['lugo', { value: 'Lugo, Spain', label: 'Lugo, Spain', coordinates: [43.0099, -7.5569], cached: true, score: 75 }],
  ['ourense', { value: 'Ourense, Spain', label: 'Ourense, Spain', coordinates: [42.3400, -7.8647], cached: true, score: 75 }],
  ['pontevedra', { value: 'Pontevedra, Spain', label: 'Pontevedra, Spain', coordinates: [42.4310, -8.6444], cached: true, score: 75 }],
  ['ceuta', { value: 'Ceuta, Spain', label: 'Ceuta, Spain', coordinates: [35.8883, -5.3162], cached: true, score: 75 }],
  ['melilla', { value: 'Melilla, Spain', label: 'Melilla, Spain', coordinates: [35.2923, -2.9381], cached: true, score: 75 }],
  
  // Additional Spanish cities for comprehensive coverage
  ['jerez', { value: 'Jerez de la Frontera, Spain', label: 'Jerez de la Frontera, Spain', coordinates: [36.6860, -6.1360], cached: true, score: 75 }],
  ['cartagena', { value: 'Cartagena, Spain', label: 'Cartagena, Spain', coordinates: [37.6057, -0.9864], cached: true, score: 75 }],
  ['aviles', { value: 'Avilés, Spain', label: 'Avilés, Spain', coordinates: [43.5547, -5.9243], cached: true, score: 70 }],
  ['ferrol', { value: 'Ferrol, Spain', label: 'Ferrol, Spain', coordinates: [43.4833, -8.2333], cached: true, score: 70 }],
  ['sabadell', { value: 'Sabadell, Spain', label: 'Sabadell, Spain', coordinates: [41.5489, 2.1074], cached: true, score: 70 }],
  ['terrassa', { value: 'Terrassa, Spain', label: 'Terrassa, Spain', coordinates: [41.5609, 2.0104], cached: true, score: 70 }],
  ['badalona', { value: 'Badalona, Spain', label: 'Badalona, Spain', coordinates: [41.4500, 2.2472], cached: true, score: 70 }],
  ['castellon', { value: 'Castellón de la Plana, Spain', label: 'Castellón de la Plana, Spain', coordinates: [39.9864, -0.0513], cached: true, score: 70 }],
  ['algeciras', { value: 'Algeciras, Spain', label: 'Algeciras, Spain', coordinates: [36.1408, -5.4526], cached: true, score: 70 }],
  ['jaen', { value: 'Jaén, Spain', label: 'Jaén, Spain', coordinates: [37.7796, -3.7849], cached: true, score: 70 }],
  ['linares', { value: 'Linares, Spain', label: 'Linares, Spain', coordinates: [38.0956, -3.6361], cached: true, score: 70 }],
  ['donostia', { value: 'Donostia-San Sebastián, Spain', label: 'Donostia-San Sebastián, Spain', coordinates: [43.3183, -1.9812], cached: true, score: 85 }],
  ['gasteiz', { value: 'Gasteiz-Vitoria, Spain', label: 'Gasteiz-Vitoria, Spain', coordinates: [42.8467, -2.6716], cached: true, score: 85 }],
  ['irun', { value: 'Irun, Spain', label: 'Irun, Spain', coordinates: [43.3394, -1.7894], cached: true, score: 70 }],
  ['barakaldo', { value: 'Barakaldo, Spain', label: 'Barakaldo, Spain', coordinates: [43.2956, -2.9856], cached: true, score: 70 }],
  ['sant boi', { value: 'Sant Boi de Llobregat, Spain', label: 'Sant Boi de Llobregat, Spain', coordinates: [41.3456, 2.0367], cached: true, score: 70 }],
  ['rubi', { value: 'Rubí, Spain', label: 'Rubí, Spain', coordinates: [41.4922, 2.0311], cached: true, score: 70 }],
  ['viladecans', { value: 'Viladecans, Spain', label: 'Viladecans, Spain', coordinates: [41.3144, 2.0142], cached: true, score: 70 }],
  ['cornella', { value: 'Cornellà de Llobregat, Spain', label: 'Cornellà de Llobregat, Spain', coordinates: [41.3578, 2.0700], cached: true, score: 70 }],
  ['el prat', { value: 'El Prat de Llobregat, Spain', label: 'El Prat de Llobregat, Spain', coordinates: [41.3244, 2.0944], cached: true, score: 70 }],
  
  // Asian cities
  ['singapore', { value: 'Singapore', label: 'Singapore', coordinates: [1.3521, 103.8198], cached: true, score: 100 }],
  ['hong kong', { value: 'Hong Kong', label: 'Hong Kong', coordinates: [22.3193, 114.1694], cached: true, score: 100 }],
  ['seoul', { value: 'Seoul, South Korea', label: 'Seoul, South Korea', coordinates: [37.5665, 126.9780], cached: true, score: 100 }],
  ['bangkok', { value: 'Bangkok, Thailand', label: 'Bangkok, Thailand', coordinates: [13.7563, 100.5018], cached: true, score: 100 }],
  ['jakarta', { value: 'Jakarta, Indonesia', label: 'Jakarta, Indonesia', coordinates: [-6.2088, 106.8456], cached: true, score: 100 }],
  ['manila', { value: 'Manila, Philippines', label: 'Manila, Philippines', coordinates: [14.5995, 120.9842], cached: true, score: 95 }],
  ['kuala lumpur', { value: 'Kuala Lumpur, Malaysia', label: 'Kuala Lumpur, Malaysia', coordinates: [3.1390, 101.6869], cached: true, score: 95 }],
  ['taipei', { value: 'Taipei, Taiwan', label: 'Taipei, Taiwan', coordinates: [25.0330, 121.5654], cached: true, score: 95 }],
  ['osaka', { value: 'Osaka, Japan', label: 'Osaka, Japan', coordinates: [34.6937, 135.5023], cached: true, score: 95 }],
  ['kyoto', { value: 'Kyoto, Japan', label: 'Kyoto, Japan', coordinates: [35.0116, 135.7681], cached: true, score: 90 }],
  ['yokohama', { value: 'Yokohama, Japan', label: 'Yokohama, Japan', coordinates: [35.4437, 139.6380], cached: true, score: 90 }],
  
  // Middle Eastern cities
  ['dubai', { value: 'Dubai, UAE', label: 'Dubai, UAE', coordinates: [25.2048, 55.2708], cached: true, score: 100 }],
  ['abu dhabi', { value: 'Abu Dhabi, UAE', label: 'Abu Dhabi, UAE', coordinates: [24.2992, 54.6973], cached: true, score: 95 }],
  ['riyadh', { value: 'Riyadh, Saudi Arabia', label: 'Riyadh, Saudi Arabia', coordinates: [24.7136, 46.6753], cached: true, score: 95 }],
  ['jeddah', { value: 'Jeddah, Saudi Arabia', label: 'Jeddah, Saudi Arabia', coordinates: [21.4858, 39.1925], cached: true, score: 90 }],
  ['doha', { value: 'Doha, Qatar', label: 'Doha, Qatar', coordinates: [25.2854, 51.5310], cached: true, score: 95 }],
  ['kuwait city', { value: 'Kuwait City, Kuwait', label: 'Kuwait City, Kuwait', coordinates: [29.3759, 47.9774], cached: true, score: 90 }],
  ['tehran', { value: 'Tehran, Iran', label: 'Tehran, Iran', coordinates: [35.6892, 51.3890], cached: true, score: 95 }],
  ['baghdad', { value: 'Baghdad, Iraq', label: 'Baghdad, Iraq', coordinates: [33.3152, 44.3661], cached: true, score: 90 }],
  
  // African cities
  ['cairo', { value: 'Cairo, Egypt', label: 'Cairo, Egypt', coordinates: [30.0444, 31.2357], cached: true, score: 100 }],
  ['lagos', { value: 'Lagos, Nigeria', label: 'Lagos, Nigeria', coordinates: [6.5244, 3.3792], cached: true, score: 95 }],
  ['johannesburg', { value: 'Johannesburg, South Africa', label: 'Johannesburg, South Africa', coordinates: [-26.2041, 28.0473], cached: true, score: 95 }],
  ['cape town', { value: 'Cape Town, South Africa', label: 'Cape Town, South Africa', coordinates: [-33.9249, 18.4241], cached: true, score: 95 }],
  ['nairobi', { value: 'Nairobi, Kenya', label: 'Nairobi, Kenya', coordinates: [-1.2921, 36.8219], cached: true, score: 90 }],
  ['casablanca', { value: 'Casablanca, Morocco', label: 'Casablanca, Morocco', coordinates: [33.5731, -7.5898], cached: true, score: 90 }],
  ['tunis', { value: 'Tunis, Tunisia', label: 'Tunis, Tunisia', coordinates: [36.8065, 10.1815], cached: true, score: 90 }],
  ['algiers', { value: 'Algiers, Algeria', label: 'Algiers, Algeria', coordinates: [36.7538, 3.0588], cached: true, score: 90 }],
  
  // South American cities
  ['sao paulo', { value: 'São Paulo, Brazil', label: 'São Paulo, Brazil', coordinates: [-23.5505, -46.6333], cached: true, score: 100 }],
  ['rio de janeiro', { value: 'Rio de Janeiro, Brazil', label: 'Rio de Janeiro, Brazil', coordinates: [-22.9068, -43.1729], cached: true, score: 100 }],
  ['buenos aires', { value: 'Buenos Aires, Argentina', label: 'Buenos Aires, Argentina', coordinates: [-34.6118, -58.3960], cached: true, score: 100 }],
  ['lima', { value: 'Lima, Peru', label: 'Lima, Peru', coordinates: [-12.0464, -77.0428], cached: true, score: 95 }],
  ['bogota', { value: 'Bogotá, Colombia', label: 'Bogotá, Colombia', coordinates: [4.7110, -74.0721], cached: true, score: 95 }],
  ['santiago', { value: 'Santiago, Chile', label: 'Santiago, Chile', coordinates: [-33.4489, -70.6693], cached: true, score: 95 }],
  ['caracas', { value: 'Caracas, Venezuela', label: 'Caracas, Venezuela', coordinates: [10.4806, -66.9036], cached: true, score: 90 }],
  ['quito', { value: 'Quito, Ecuador', label: 'Quito, Ecuador', coordinates: [-0.1807, -78.4678], cached: true, score: 90 }],
  
  // Canadian cities
  ['montreal', { value: 'Montreal, Canada', label: 'Montreal, Canada', coordinates: [45.5017, -73.5673], cached: true, score: 95 }],
  ['calgary', { value: 'Calgary, Canada', label: 'Calgary, Canada', coordinates: [51.0447, -114.0719], cached: true, score: 95 }],
  ['edmonton', { value: 'Edmonton, Canada', label: 'Edmonton, Canada', coordinates: [53.5461, -113.4938], cached: true, score: 90 }],
  ['ottawa', { value: 'Ottawa, Canada', label: 'Ottawa, Canada', coordinates: [45.4215, -75.6972], cached: true, score: 90 }],
  ['winnipeg', { value: 'Winnipeg, Canada', label: 'Winnipeg, Canada', coordinates: [49.8951, -97.1384], cached: true, score: 90 }],
  ['quebec city', { value: 'Quebec City, Canada', label: 'Quebec City, Canada', coordinates: [46.8139, -71.2080], cached: true, score: 90 }],
  
  // Australian cities
  ['brisbane', { value: 'Brisbane, Australia', label: 'Brisbane, Australia', coordinates: [-27.4698, 153.0251], cached: true, score: 95 }],
  ['perth', { value: 'Perth, Australia', label: 'Perth, Australia', coordinates: [-31.9505, 115.8605], cached: true, score: 95 }],
  ['adelaide', { value: 'Adelaide, Australia', label: 'Adelaide, Australia', coordinates: [-34.9285, 138.6007], cached: true, score: 90 }],
  ['gold coast', { value: 'Gold Coast, Australia', label: 'Gold Coast, Australia', coordinates: [-28.0167, 153.4000], cached: true, score: 90 }],
  ['newcastle', { value: 'Newcastle, Australia', label: 'Newcastle, Australia', coordinates: [-32.9267, 151.7789], cached: true, score: 90 }],
  ['canberra', { value: 'Canberra, Australia', label: 'Canberra, Australia', coordinates: [-35.2809, 149.1300], cached: true, score: 90 }],
]);

// Levenshtein distance for better fuzzy matching
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Enhanced fuzzy search with multiple algorithms and better scoring
const advancedFuzzyMatch = (query, text) => {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();
  
  // Exact match gets highest score
  if (textLower === queryLower) {
    return 1.0;
  }
  
  // Exact substring match at the beginning
  if (textLower.startsWith(queryLower)) {
    return 0.95;
  }
  
  // Exact substring match anywhere
  if (textLower.includes(queryLower)) {
    return 0.9;
  }
  
  // Word boundary match - check if query matches the start of any word
  const words = textLower.split(/[\s,.-]+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) {
      return 0.85;
    }
    if (word.includes(queryLower)) {
      return 0.8;
    }
  }
  
  // Handle common city name variations and abbreviations
  const cityVariations = {
    'nyc': 'new york',
    'ny': 'new york',
    'la': 'los angeles',
    'sf': 'san francisco',
    'dc': 'washington',
    'chi': 'chicago',
    'mia': 'miami',
    'lv': 'las vegas',
    'sea': 'seattle',
    'bos': 'boston',
    'atl': 'atlanta',
    'dal': 'dallas',
    'phx': 'phoenix',
    'det': 'detroit',
    'orl': 'orlando',
    'sd': 'san diego',
    'por': 'portland',
    'nash': 'nashville',
    'aus': 'austin',
    'lon': 'london',
    'par': 'paris',
    'ber': 'berlin',
    'mad': 'madrid',
    'rom': 'rome',
    'ams': 'amsterdam',
    'tok': 'tokyo',
    'syd': 'sydney',
    'mel': 'melbourne',
    'van': 'vancouver',
    'tor': 'toronto',
    'mon': 'montreal',
    'cal': 'calgary',
    'ott': 'ottawa',
    'win': 'winnipeg',
    'bri': 'brisbane',
    'per': 'perth',
    'ade': 'adelaide',
    'mum': 'mumbai',
    'del': 'delhi',
    'blr': 'bangalore',
    'hyd': 'hyderabad',
    'che': 'chennai',
    'kol': 'kolkata',
    'pun': 'pune',
    'kar': 'karachi',
    'lah': 'lahore',
    'isl': 'islamabad',
    'raw': 'rawalpindi',
    'fai': 'faisalabad',
    'pes': 'peshawar',
    'que': 'quetta',
    'mul': 'multan',
    'guj': 'gujranwala',
    'sin': 'singapore',
    'hk': 'hong kong',
    'seo': 'seoul',
    'ban': 'bangkok',
    'jak': 'jakarta',
    'man': 'manila',
    'kl': 'kuala lumpur',
    'tai': 'taipei',
    'osa': 'osaka',
    'kyo': 'kyoto',
    'dub': 'dubai',
    'abu': 'abu dhabi',
    'riy': 'riyadh',
    'jed': 'jeddah',
    'doh': 'doha',
    'cai': 'cairo',
    'lag': 'lagos',
    'joh': 'johannesburg',
    'cap': 'cape town',
    'nai': 'nairobi',
    'cas': 'casablanca',
    'tun': 'tunis',
    'alg': 'algiers',
    'sao': 'sao paulo',
    'rio': 'rio de janeiro',
    'bue': 'buenos aires',
    'lim': 'lima',
    'bog': 'bogota',
    'stg': 'santiago',
    'car': 'caracas',
    'qui': 'quito',
    // Spanish city abbreviations
    'dos': 'dos hermanas',
    'her': 'dos hermanas',
    'mal': 'malaga',
    'sev': 'seville',
    'val': 'valencia',
    'zar': 'zaragoza',
    'bil': 'bilbao',
    'ali': 'alicante',
    'cor': 'cordoba',
    'gra': 'granada',
    'mur': 'murcia',
    'pal': 'palma',
    'vig': 'vigo',
    'gij': 'gijon',
    'vit': 'vitoria',
    'san': 'san sebastian',
    'log': 'logrono',
    'bad': 'badajoz',
    'lug': 'lugo',
    'our': 'ourense',
    'pon': 'pontevedra',
    'ceu': 'ceuta',
    'mll': 'melilla'
  };
  
  // Check for abbreviation matches
  if (cityVariations[queryLower]) {
    const fullName = cityVariations[queryLower];
    if (textLower.includes(fullName)) {
      return 0.8;
    }
  }
  
  // Reverse check - if the text is an abbreviation of the query
  for (const [abbr, fullName] of Object.entries(cityVariations)) {
    if (textLower === abbr && queryLower.includes(fullName)) {
      return 0.8;
    }
  }
  
  // Levenshtein distance match with improved scoring
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const similarity = 1 - (distance / maxLength);
  
  // Adjust threshold based on query length
  const threshold = queryLower.length <= 3 ? 0.5 : queryLower.length <= 6 ? 0.6 : 0.7;
  
  if (similarity > threshold) {
    // Boost score for shorter queries that match longer text
    const lengthBoost = queryLower.length < textLower.length ? 0.1 : 0;
    return Math.min(similarity + lengthBoost, 0.85);
  }
  
  // Soundex-like matching for phonetic similarities
  const phoneticScore = getPhoneticSimilarity(queryLower, textLower);
  if (phoneticScore > 0.7) {
    return phoneticScore * 0.8; // Cap phonetic matches at 0.8
  }
  
  return 0;
};

// Phonetic similarity using simplified soundex algorithm
const getPhoneticSimilarity = (str1, str2) => {
  const soundex1 = getSoundex(str1);
  const soundex2 = getSoundex(str2);
  
  if (soundex1 === soundex2) {
    return 0.8;
  }
  
  // Check for partial soundex match
  const minLength = Math.min(soundex1.length, soundex2.length);
  let matches = 0;
  for (let i = 0; i < minLength; i++) {
    if (soundex1[i] === soundex2[i]) {
      matches++;
    }
  }
  
  return matches / Math.max(soundex1.length, soundex2.length);
};

// Simplified Soundex algorithm
const getSoundex = (str) => {
  const s = str.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return '';
  
  let result = s[0].toUpperCase();
  const mapping = {
    'b': '1', 'f': '1', 'p': '1', 'v': '1',
    'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
    'd': '3', 't': '3',
    'l': '4',
    'm': '5', 'n': '5',
    'r': '6'
  };
  
  let prevCode = '';
  for (let i = 1; i < s.length && result.length < 4; i++) {
    const code = mapping[s[i]] || '';
    if (code && code !== prevCode) {
      result += code;
    }
    prevCode = code;
  }
  
  return result.padEnd(4, '0');
};

// Request cancellation controller
let currentController = null;

// Enhanced response cache with TTL and localStorage persistence
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SEARCH_HISTORY_KEY = 'youcalendy_search_history';
const MAX_SEARCH_HISTORY = 50;

// Search analytics for improving suggestions
const searchAnalytics = {
  popularSearches: new Map(),
  userHistory: new Set(),
  
  recordSearch(query, selected) {
    if (query && query.length >= 2) {
      const normalizedQuery = query.toLowerCase().trim();
      this.userHistory.add(normalizedQuery);
      
      if (selected) {
        const count = this.popularSearches.get(normalizedQuery) || 0;
        this.popularSearches.set(normalizedQuery, count + 1);
      }
      
      this.saveToLocalStorage();
    }
  },
  
  getPopularSearches(limit = 5) {
    return Array.from(this.popularSearches.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query);
  },
  
  getUserHistory(limit = 10) {
    return Array.from(this.userHistory).slice(-limit);
  },
  
  saveToLocalStorage() {
    try {
      const data = {
        popularSearches: Array.from(this.popularSearches.entries()),
        userHistory: Array.from(this.userHistory)
      };
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save search analytics:', error);
    }
  },
  
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.popularSearches = new Map(parsed.popularSearches || []);
        this.userHistory = new Set(parsed.userHistory || []);
      }
    } catch (error) {
      console.warn('Failed to load search analytics:', error);
    }
  }
};

// Initialize search analytics
searchAnalytics.loadFromLocalStorage();

/**
 * Smart API selection based on performance metrics
 */
const selectBestAPI = () => {
  const apis = Object.keys(apiPerformance);
  
  // Sort by performance score (success rate * speed factor)
  const sortedApis = apis.sort((a, b) => {
    const scoreA = apiPerformance[a].successRate * (1000 / apiPerformance[a].avgResponseTime);
    const scoreB = apiPerformance[b].successRate * (1000 / apiPerformance[b].avgResponseTime);
    return scoreB - scoreA;
  });
  
  return sortedApis[0];
};

/**
 * Update API performance metrics
 */
const updateAPIPerformance = (apiName, responseTime, success) => {
  const perf = apiPerformance[apiName];
  if (perf) {
    // Update average response time (exponential moving average)
    perf.avgResponseTime = (perf.avgResponseTime * 0.8) + (responseTime * 0.2);
    
    // Update success rate
    perf.successRate = (perf.successRate * 0.9) + (success ? 0.1 : 0);
    perf.lastUsed = Date.now();
  }
};

/**
 * Multi-API search with fallback and load balancing
 */
const searchWithMultipleAPIs = async (query, limit = 8) => {
  const startTime = Date.now();
  const selectedAPI = selectBestAPI();
  
  try {
    let results = [];
    
    // Try Photon API first (fastest)
    if (selectedAPI === 'photon') {
      results = await searchPhotonAPI(query, limit);
      if (results.length > 0) {
        updateAPIPerformance('photon', Date.now() - startTime, true);
        return results;
      }
    }
    
    // Try Nominatim API
    results = await searchNominatimAPI(query, limit);
    if (results.length > 0) {
      updateAPIPerformance('nominatim', Date.now() - startTime, true);
      return results;
    }
    
    // Fallback to backup Nominatim instance
    results = await searchNominatimAPI(query, limit, 'nominatim2');
    updateAPIPerformance('nominatim2', Date.now() - startTime, results.length > 0);
    
    return results;
    
  } catch (error) {
    console.error('Geocoding API error', { api: selectedAPI, error });
    updateAPIPerformance(selectedAPI, Date.now() - startTime, false);
    
    // Try fallback APIs
    const fallbackAPIs = Object.keys(GEOCODING_APIS).filter(api => api !== selectedAPI);
    for (const api of fallbackAPIs) {
      try {
        const results = await searchNominatimAPI(query, limit, api);
        if (results.length > 0) {
          updateAPIPerformance(api, Date.now() - startTime, true);
          return results;
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding API failed', {
          api,
          error: fallbackError,
        });
        updateAPIPerformance(api, Date.now() - startTime, false);
      }
    }
    
    return [];
  }
};

/**
 * Photon API search (faster alternative to Nominatim)
 */
const searchPhotonAPI = async (query, limit) => {
  const params = new URLSearchParams({
    q: query,
    limit: Math.min(limit, 10),
    lang: 'en'
  });

  const response = await fetch(`${GEOCODING_APIS.photon}/api?${params.toString()}`, {
    headers: {
      'User-Agent': 'YouCalendy/1.0 (https://youcalendy.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Photon API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data.features
    .filter(item => item.properties.name && item.geometry.coordinates)
    .map(item => ({
      value: item.properties.name,
      label: item.properties.name,
      coordinates: item.geometry.coordinates,
      cached: false,
      fuzzyScore: 1.0,
      importance: item.properties.importance || 0,
      source: 'photon'
    }));
};

/**
 * Enhanced Nominatim API search
 */
const searchNominatimAPI = async (query, limit, apiKey = 'nominatim') => {
  const baseUrl = GEOCODING_APIS[apiKey];
  
  const params = new URLSearchParams({
    format: 'json',
    q: query,
    limit: Math.min(limit + 8, 20),
    addressdetails: '0',
    extratags: '0',
    namedetails: '0',
    'accept-language': 'en',
    'dedupe': '1',
    'class': 'place',
    'type': 'city,town,municipality,village,suburb',
    'countrycodes': '',
    'bounded': '0'
  });

  const response = await fetch(`${baseUrl}/search?${params.toString()}`, {
    headers: {
      'User-Agent': 'YouCalendy/1.0 (https://youcalendy.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data
    .filter(item => item.name && item.lat && item.lon)
    .map(item => {
      const displayName = item.display_name || item.name;
      const cityName = displayName.split(',')[0].trim();
      const fuzzyScore = advancedFuzzyMatch(query, cityName);
      
      return {
        value: cityName,
        label: displayName,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
        cached: false,
        fuzzyScore,
        importance: item.importance || 0,
        source: apiKey
      };
    })
    .filter(item => item.fuzzyScore > 0.5)
    .sort((a, b) => {
      if (Math.abs(a.fuzzyScore - b.fuzzyScore) > 0.1) {
        return b.fuzzyScore - a.fuzzyScore;
      }
      return b.importance - a.importance;
    });
};

/**
 * Enhanced instant suggestions with fuzzy matching and analytics
 */
const getInstantSuggestions = (query, limit = 5, context = {}) => {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  const results = [];
  const scoredResults = [];
  
  // First, try exact matches and prefix matches
  for (const [key, city] of INSTANT_CITIES_CACHE) {
    let matchScore = 0;
    let matchType = '';
    
    // Exact key match
    if (key === lowerQuery) {
      matchScore = 1.0;
      matchType = 'exact';
    }
    // Prefix match
    else if (key.startsWith(lowerQuery)) {
      matchScore = 0.95;
      matchType = 'prefix';
    }
    // Contains match
    else if (key.includes(lowerQuery)) {
      matchScore = 0.9;
      matchType = 'contains';
    }
    // Use enhanced fuzzy matching for typos and partial matches
    else {
      const fuzzyScore = advancedFuzzyMatch(query, city.value);
      if (fuzzyScore > 0.6) {
        matchScore = fuzzyScore;
        matchType = 'fuzzy';
      }
    }
    
    if (matchScore > 0) {
      // Get smart ranking score
      const rankingScore = getCityRankingScore(city, query, context);
      
      scoredResults.push({ 
        ...city, 
        matchScore, 
        matchType,
        rankingScore,
        // Final score combines match quality and city importance
        finalScore: matchScore * 0.7 + (rankingScore / 100) * 0.3
      });
    }
  }
  
  // Sort by final score and take top results
  scoredResults
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit)
    .forEach(result => {
      const city = { ...result };
      delete city.matchScore;
      delete city.matchType;
      delete city.rankingScore;
      delete city.finalScore;
      results.push(city);
    });
  
  return results;
};

/**
 * Check if cached response is still valid
 */
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Ultra-fast city search with multi-API support, intelligent caching, and analytics
 */
export const searchCitiesFast = async (query, limit = 8, context = {}) => {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Record search for analytics
  searchAnalytics.recordSearch(normalizedQuery, false);

  // Cancel previous request if still pending
  if (currentController) {
    currentController.abort();
  }

  // Get instant cache results with enhanced fuzzy matching and context
  const instantResults = getInstantSuggestions(normalizedQuery, Math.min(limit, 6), context);
  
  // If we have enough instant results and query is short, return early
  if (instantResults.length >= limit && normalizedQuery.length <= 4) {
    return instantResults.slice(0, limit);
  }
  
  // For very short queries (2-3 chars), prioritize instant results
  if (normalizedQuery.length <= 3 && instantResults.length >= 3) {
    return instantResults.slice(0, limit);
  }
  
  // Check response cache
  const cacheKey = `${normalizedQuery}_${limit}_${JSON.stringify(context)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    // Merge instant results with cached API results, avoiding duplicates
    const combinedResults = [...instantResults];
    const instantCities = new Set(instantResults.map(r => r.value.toLowerCase()));
    
    cached.data.forEach(result => {
      if (!instantCities.has(result.value.toLowerCase()) && combinedResults.length < limit) {
        combinedResults.push(result);
      }
    });
    
    return combinedResults;
  }

  // Create new controller for this request
  currentController = new AbortController();
  
  try {
    // Use multi-API search with smart fallback
    const apiResults = await searchWithMultipleAPIs(query, limit);

    // Apply smart ranking to API results
    const rankedApiResults = apiResults.map(result => ({
      ...result,
      rankingScore: getCityRankingScore(result, query, context),
      finalScore: result.fuzzyScore * 0.7 + (getCityRankingScore(result, query, context) / 100) * 0.3
    }));

    // Sort by final score
    rankedApiResults.sort((a, b) => b.finalScore - a.finalScore);

    // Remove duplicates within API results using Map for O(n) performance
    const uniqueApiResults = [];
    const seenValues = new Set();
    
    for (const result of rankedApiResults) {
      const normalizedValue = result.value.toLowerCase().trim();
      if (!seenValues.has(normalizedValue)) {
        seenValues.add(normalizedValue);
        uniqueApiResults.push(result);
        if (uniqueApiResults.length >= limit) break;
      }
    }

    // Cache the deduplicated API results
    responseCache.set(cacheKey, {
      data: uniqueApiResults,
      timestamp: Date.now()
    });

    // Combine instant results with API results, ensuring no duplicates
    const combinedResults = [...instantResults];
    const allSeenValues = new Set(instantResults.map(r => r.value.toLowerCase().trim()));
    
    uniqueApiResults.forEach(result => {
      const normalizedValue = result.value.toLowerCase().trim();
      if (!allSeenValues.has(normalizedValue) && combinedResults.length < limit) {
        allSeenValues.add(normalizedValue);
        combinedResults.push(result);
      }
    });

    return combinedResults;

  } catch (error) {
    if (error.name === 'AbortError') {
      // Request was cancelled, return instant results
      return instantResults;
    }
    
    console.error('Multi-API geocoding error:', error);
    // Return instant results as fallback
    return instantResults;
  } finally {
    currentController = null;
  }
};

/**
 * Optimized reverse geocoding
 */
export const reverseGeocodeAPI = async (lat, lon) => {
  if (!lat || !lon) return null;

  // Cancel previous request if still pending
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: '10',
      addressdetails: '1',
      'accept-language': 'en'
    });

    const response = await fetch(`${GEOCODING_APIS.nominatim}/reverse?${params.toString()}`, {
      signal: currentController.signal,
      headers: {
        'User-Agent': 'YouCalendy/1.0 (https://youcalendy.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      return {
        displayName: data.display_name,
        address: data.address || {},
        coordinates: [parseFloat(data.lat), parseFloat(data.lon)]
      };
    }

    return null;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  } finally {
    currentController = null;
  }
};

/**
 * Enhanced debounced search with intelligent delay adjustment
 */
export const debouncedSearchCities = (() => {
  let timeoutId;
  return (query, limit) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      
      // Adjust delay based on query length - shorter queries get faster response
      const adjustedDelay = query.length <= 3 ? 50 : query.length <= 6 ? 100 : 150;
      
      timeoutId = setTimeout(async () => {
        const results = await searchCitiesFast(query, limit);
        resolve(results);
      }, adjustedDelay);
    });
  };
})();

/**
 * Get user's search history for suggestions
 */
export const getUserSearchHistory = (limit = 5) => {
  return searchAnalytics.getUserHistory(limit);
};

/**
 * Get popular searches for suggestions
 */
export const getPopularSearches = (limit = 5) => {
  return searchAnalytics.getPopularSearches(limit);
};

/**
 * Record a successful search selection
 */
export const recordSearchSelection = (query) => {
  searchAnalytics.recordSearch(query, true);
};

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  searchAnalytics.userHistory.clear();
  searchAnalytics.popularSearches.clear();
  searchAnalytics.saveToLocalStorage();
};

/**
 * Get API performance statistics
 */
export const getAPIPerformanceStats = () => {
  return {
    apis: Object.keys(apiPerformance).map(api => ({
      name: api,
      avgResponseTime: Math.round(apiPerformance[api].avgResponseTime),
      successRate: Math.round(apiPerformance[api].successRate * 100),
      lastUsed: apiPerformance[api].lastUsed
    })),
    bestAPI: selectBestAPI(),
    cacheSize: responseCache.size,
    instantCacheSize: INSTANT_CITIES_CACHE.size
  };
};

/**
 * Get cached city suggestions (for backward compatibility)
 */
export const getCachedCitySuggestions = (query, limit = 10) => {
  return getInstantSuggestions(query, limit);
};

/**
 * Smart search with context awareness
 */
export const smartSearchCities = async (query, context = {}) => {
  const { country, limit = 8 } = context;
  
  // If we have country context, prioritize cities from that country
  if (country) {
    const countryCities = await getPopularCities(country, limit);
    if (countryCities.length > 0) {
      const instantResults = getInstantSuggestions(query, Math.min(limit, 3));
      const combinedResults = [...instantResults];
      
      countryCities.forEach(city => {
        if (!combinedResults.find(r => r.value.toLowerCase() === city.value.toLowerCase())) {
          combinedResults.push(city);
        }
      });
      
      if (combinedResults.length >= limit) {
        return combinedResults.slice(0, limit);
      }
    }
  }
  
  // Fall back to regular search
  return searchCitiesFast(query, limit);
};

/**
 * Legacy compatibility exports
 */
export const searchCities = searchCitiesFast;
export const reverseGeocode = reverseGeocodeAPI;

/**
 * Get popular cities for a country
 */
export const getPopularCities = async (countryCode, limit = 10) => {
  const popularByCountry = {
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    'GB': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
    'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
    'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
    'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
    'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat']
  };

  const cities = popularByCountry[countryCode] || [];
  return cities.slice(0, limit).map(city => ({
    value: city,
    label: city,
    cached: true
  }));
};

export default {
  searchCities,
  searchCitiesFast,
  getCachedCitySuggestions,
  reverseGeocode: reverseGeocodeAPI,
  reverseGeocodeAPI,
  debouncedSearchCities,
  getPopularCities,
  getUserSearchHistory,
  getPopularSearches,
  recordSearchSelection,
  clearSearchHistory,
  smartSearchCities,
  getAPIPerformanceStats,
};
