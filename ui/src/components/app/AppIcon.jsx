import React from 'react';

import memoize from 'memoize-one';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import EuroIcon from '@mui/icons-material/Euro';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';
import BeenhereIcon from '@mui/icons-material/Beenhere';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import TouchAppIcon from '@mui/icons-material/TouchApp';
import FlagIcon from '@mui/icons-material/Flag';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';

import PaymentIcon from '@mui/icons-material/Payment';
import DehazeIcon from '@mui/icons-material/Dehaze';
import FilterTiltShiftIcon from '@mui/icons-material/FilterTiltShift';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ErrorIcon from '@mui/icons-material/Error';

import SubtitlesIcon from '@mui/icons-material/Subtitles';

const iconMap = {
  // dashboard
  DashboardIcon: DashboardIcon,
  FilterNoneIcon: FilterNoneIcon,
  SupervisorAccountIcon: SupervisorAccountIcon,
  ExpandLessIcon: ExpandLessIcon,
  ExpandMoreIcon: ExpandMoreIcon,
  BarChartIcon: BarChartIcon,
  AttachMoneyIcon: AttachMoneyIcon,
  EuroIcon: EuroIcon,
  LocationCityIcon: LocationCityIcon,
  AutorenewIcon: AutorenewIcon,
  // categories
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
  // bill-tab
  NotificationsActiveIcon: NotificationsActiveIcon,
  HistoryIcon: HistoryIcon,
  DonutLargeIcon: DonutLargeIcon,
  // add-expense-tab
  AddShoppingCartIcon: AddShoppingCartIcon,
  TransformIcon: TransformIcon,
  // accounts
  CreditCardIcon: CreditCardIcon,
  credit_card: CreditCardIcon,
  account_balance: AccountBalanceIcon,
  attach_money: AttachMoneyIcon,
  museum: MuseumIcon,
  AccessTimeIcon: AccessTimeIcon,
  BlockIcon: BlockIcon,
  BeenhereIcon: BeenhereIcon,
  // expense-edits
  EditIcon: EditIcon,
  DeleteIcon: DeleteIcon,
  ArrowUpwardIcon: ArrowUpwardIcon,
  ArrowDownwardIcon: ArrowDownwardIcon,
  TrendingFlatIcon: TrendingFlatIcon,
  KeyboardTabIcon: KeyboardTabIcon,
  ArrowBackIcon: ArrowBackIcon,
  ArrowForwardIcon: ArrowForwardIcon,
  // bills
  PaymentIcon: PaymentIcon,
  DehazeIcon: DehazeIcon,
  FilterTiltShiftIcon: FilterTiltShiftIcon,
  MenuOpenIcon: MenuOpenIcon,
  // buttons
  AddIcon: AddIcon,
  SaveIcon: SaveIcon,
  SearchIcon: SearchIcon,
  // flags
  yes: DoneIcon,
  no: CloseIcon,
  ShoppingBasketIcon: ShoppingBasketIcon,
  // flags
  TouchAppIcon: TouchAppIcon,
  FlagIcon: FlagIcon,
  FilterAltIcon: FilterAltIcon,
  ErrorIcon: ErrorIcon,
};

export const AppIcon = memoize(({ icon, clickable, color, fontSize }) => {
  const cursor = clickable ? { cursor: 'pointer' } : {};
  const AppIcon = iconMap[icon] ? iconMap[icon] : SubtitlesIcon;
  return (
    <AppIcon
      fontSize={fontSize ? fontSize : 'small'}
      color={color ? color : 'primary'}
      style={{ top: '1px', ...cursor }}
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
