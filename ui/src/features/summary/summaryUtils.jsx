import React from 'react';

import memoize from 'memoize-one';

// @material-ui/icons
import HomeIcon from '@material-ui/icons/Home';
import PowerIcon from '@material-ui/icons/Power';
import SchoolIcon from '@material-ui/icons/School';
import WifiIcon from '@material-ui/icons/Wifi';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import FlightIcon from '@material-ui/icons/Flight';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import CategoryIcon from '@material-ui/icons/Category';

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
