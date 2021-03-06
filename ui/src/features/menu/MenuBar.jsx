import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

// @material-ui/core components
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// @material-ui/icons
import DashboardIcon from '@material-ui/icons/Dashboard';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import SearchIcon from '@material-ui/icons/Search';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BarChartIcon from '@material-ui/icons/BarChart';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import EuroIcon from '@material-ui/icons/Euro';
import AddIcon from '@material-ui/icons/Add';
import LocationCityIcon from '@material-ui/icons/LocationCity';

import Button from 'components/CustomButtons/Button.js';

import { ROUTE } from 'app/config';
import { selectStartupData } from 'features/startup/startupSlice';
import { selectAppGlobal, setSelectedCity, setAccountsExpanded, setShowChartBlock } from 'features/appGlobalSlice';
import { loadChart } from 'features/dashboard/chart/chartSlice';

const buildCityIcon = (currency) => {
  switch (currency) {
    case 'USD':
      return <AttachMoneyIcon />;
    case 'INR':
      return <EuroIcon />;
    default:
      return '';
  }
};

export const MenuBar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedCity, accountsExpanded, showChartBlock } = useSelector(selectAppGlobal);
  const { cities } = useSelector(selectStartupData);

  const [anchorEl, setAnchorEl] = useState(null);

  const isDashboard = location.pathname === ROUTE.DASHBOARD;

  const handleCityClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCitySelect = (id) => {
    if (id !== selectedCity) {
      dispatch(setSelectedCity(id));
    }
    setAnchorEl(null);
  };

  const handleAccountExpansion = () => {
    dispatch(setAccountsExpanded(!accountsExpanded));
  };

  const handleShowChartBlock = () => {
    dispatch(setShowChartBlock(!showChartBlock));
    if (!showChartBlock) {
      dispatch(loadChart(selectedCity));
    }
  };

  const city = selectedCity ? _.find(cities, { id: selectedCity }) : null;
  const menuItems = cities.map((e) => (
    <MenuItem key={e.id} onClick={() => handleCitySelect(e.id)} style={{ fontSize: 12 }}>
      {e.name}
    </MenuItem>
  ));

  return (
    <div style={{ marginLeft: '13px', marginTop: '8px' }}>
      <Grid container spacing={2}>
        <Grid container item lg={6} spacing={2}>
          <Button component={RouterLink} to='/dashboard' color='primary' size='sm'>
            <DashboardIcon /> Dashboard
          </Button>
          <Button component={RouterLink} to='/summary' color='success' size='sm'>
            <FilterNoneIcon /> Monthly Summary
          </Button>
          <Button component={RouterLink} to='/search' color='rose' size='sm'>
            <SearchIcon /> Search
          </Button>
        </Grid>
        <Grid container item justify='flex-end' lg={6} spacing={2}>
          <Button
            disabled={!isDashboard}
            onClick={handleShowChartBlock}
            color={showChartBlock ? 'success' : 'warning'}
            size='sm'
          >
            {showChartBlock ? <AddIcon /> : <BarChartIcon />}
          </Button>
          <Button disabled={!isDashboard} onClick={handleAccountExpansion} color='primary' size='sm'>
            {accountsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
          {city && (
            <Button
              disabled={!isDashboard}
              onClick={handleCityClick}
              color='primary'
              size='sm'
              style={{ minWidth: 120 }}
            >
              <LocationCityIcon /> {city.name}
            </Button>
          )}
          {city && (
            <Menu
              id='simple-menu'
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => handleCitySelect(city.id)}
            >
              {menuItems}
            </Menu>
          )}
          {city && (
            <Button justIcon simple disabled color='success' size='sm'>
              {buildCityIcon(city.currency)}
            </Button>
          )}
        </Grid>
      </Grid>
    </div>
  );
};
