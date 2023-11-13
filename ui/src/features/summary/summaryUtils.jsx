import React from 'react';

import memoize from 'memoize-one';

// @mui/icons-material
import HomeIcon from '@mui/icons-material/Home';
import PowerIcon from '@mui/icons-material/Power';
import SchoolIcon from '@mui/icons-material/School';
import WifiIcon from '@mui/icons-material/Wifi';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CategoryIcon from '@mui/icons-material/Category';

const iconMap = {
  home: HomeIcon,
  power: PowerIcon,
  school: SchoolIcon,
  wifi: WifiIcon,
  phone_iphone: PhoneIphoneIcon,
  local_mall: LocalMallIcon,
  restaurant: RestaurantIcon,
  shopping_cart: ShoppingCartIcon,
  local_movies: LocalMoviesIcon,
  flight: FlightIcon,
  directions_car: DirectionsCarIcon,
  local_gas_station: LocalGasStationIcon,
  local_hospital: LocalHospitalIcon,
  local_laundry_service: CategoryIcon,
};

export const buildCategoryIcon = memoize((icon) => {
  const MyIcon = iconMap[icon];
  return <MyIcon fontSize='small' />;
});
