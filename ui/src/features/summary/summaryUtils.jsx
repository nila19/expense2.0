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

export const buildCategoryIcon = memoize((icon) => {
  switch (icon) {
    case 'home':
      return <HomeIcon fontSize='small' />;
    case 'power':
      return <PowerIcon fontSize='small' />;
    case 'school':
      return <SchoolIcon fontSize='small' />;
    case 'wifi':
      return <WifiIcon fontSize='small' />;
    case 'phone_iphone':
      return <PhoneIphoneIcon fontSize='small' />;
    case 'local_mall':
      return <LocalMallIcon fontSize='small' />;
    case 'restaurant':
      return <RestaurantIcon fontSize='small' />;
    case 'shopping_cart':
      return <ShoppingCartIcon fontSize='small' />;
    case 'local_movies':
      return <LocalMoviesIcon fontSize='small' />;
    case 'flight':
      return <FlightIcon fontSize='small' />;
    case 'directions_car':
      return <DirectionsCarIcon fontSize='small' />;
    case 'local_gas_station':
      return <LocalGasStationIcon fontSize='small' />;
    case 'local_hospital':
      return <LocalHospitalIcon fontSize='small' />;
    default:
      return <CategoryIcon fontSize='small' />;
  }
});
