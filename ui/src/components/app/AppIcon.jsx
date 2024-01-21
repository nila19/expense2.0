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

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TransformIcon from '@mui/icons-material/Transform';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MuseumIcon from '@mui/icons-material/Museum';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SubtitlesIcon from '@mui/icons-material/Subtitles';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import RectangleIcon from '@mui/icons-material/Rectangle';

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
  NotificationsActiveIcon: NotificationsActiveIcon,
  HistoryIcon: HistoryIcon,
  DonutLargeIcon: DonutLargeIcon,
  AddShoppingCartIcon: AddShoppingCartIcon,
  TransformIcon: TransformIcon,
  CreditCardIcon: CreditCardIcon,
  account_balance: AccountBalanceIcon,
  credit_card: CreditCardIcon,
  attach_money: AttachMoneyIcon,
  museum: MuseumIcon,
  yes: DoneIcon,
  no: CloseIcon,
  rectangle: RectangleIcon,
};

export const AppIcon = memoize(({ icon, clickable, color, fontSize }) => {
  const cursor = clickable ? 'pointer' : 'auto';
  const AppIcon = iconMap[icon] ? iconMap[icon] : SubtitlesIcon;
  return (
    <AppIcon
      fontSize={fontSize ? fontSize : 'small'}
      color={color ? color : 'primary'}
      style={{ top: '1px', cursor: cursor }}
    />
  );
});

export const buildIconOptions = memoize(() => {
  return ['savings', 'account_balance', 'credit_card', 'attach_money', 'museum'].map((e) => ({
    key: e,
    label: e,
  }));
});

export const buildColorOptions = memoize(() => {
  return ['red', 'blue', 'green'].map((e) => ({ key: e, label: e }));
});
