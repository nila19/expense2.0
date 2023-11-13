import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

// @mui/material components
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// @mui/icons-material
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import AddIcon from '@mui/icons-material/Add';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

import Button from 'components/CustomButtons/Button.js';

import { ROUTE } from 'app/config';
import { ENV } from 'app/constants';
import { selectStartup, selectStartupData, setReloadDashboard } from 'features/startup/startupSlice';
import { selectAppGlobal, setSelectedCity, setAccountsExpanded, setShowChartBlock } from 'features/appGlobalSlice';
import { resetFilters } from 'features/dashboard/dashboardGlobalSlice';
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
  const { reloadDashboard, env } = useSelector(selectStartup);

  const [anchorEl, setAnchorEl] = useState(null);

  const isDashboard = location.pathname === ROUTE.DASHBOARD || location.pathname === ROUTE.BASE;
  const isNonPROD = env !== ENV.PROD;

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

  const handleReloadDashboard = () => {
    dispatch(setReloadDashboard(selectedCity));
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
          <Button
            component={RouterLink}
            to='/summary'
            onClick={() => dispatch(resetFilters())}
            color='success'
            size='sm'
          >
            <FilterNoneIcon /> Monthly Summary
          </Button>
          <Button component={RouterLink} to='/search' onClick={() => dispatch(resetFilters())} color='rose' size='sm'>
            <SearchIcon /> Search
          </Button>
          <Button component={RouterLink} to='/admin' onClick={() => dispatch(resetFilters())} color='warning' size='sm'>
            <SupervisorAccountIcon /> Admin
          </Button>
        </Grid>
        <Grid container item justifyContent='flex-end' lg={6} spacing={2}>
          <Button color={isNonPROD ? 'rose' : 'success'} size='sm'>
            {env}
          </Button>
          <Button
            disabled={!isDashboard}
            onClick={handleReloadDashboard}
            color={reloadDashboard ? 'warning' : 'primary'}
            size='sm'
          >
            <AutorenewIcon />
          </Button>
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
