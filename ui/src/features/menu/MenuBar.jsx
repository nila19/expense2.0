import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

import { Grid, Menu, MenuItem } from '@mui/material';

import MDButton from 'components/MDButton';

import { AppIcon } from 'components/app/AppIcon';
import { ROUTE } from 'app/config';
import { ENV } from 'app/constants';
import { selectStartup, selectStartupData, setReloadDashboard } from 'features/startup/startupSlice';
import { selectAppGlobal, setSelectedCity, setAccountsExpanded, setShowChartBlock } from 'features/appGlobalSlice';
import { resetFilters } from 'features/dashboard/dashboardGlobalSlice';
import { loadChart } from 'features/dashboard/chart/chartSlice';

const buildCityIcon = (currency) => {
  switch (currency) {
    case 'USD':
      return <AppIcon icon='AttachMoneyIcon' color='success' />;
    case 'INR':
      return <AppIcon icon='EuroIcon' color='success' />;
    default:
      return <></>;
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
          <MDButton
            component={RouterLink}
            to='/dashboard'
            color='primary'
            variant='text'
            size='medium'
            startIcon={<AppIcon icon='DashboardIcon' />}
          >
            Dashboard
          </MDButton>
          <MDButton
            component={RouterLink}
            to='/summary'
            onClick={() => dispatch(resetFilters())}
            color='warning'
            variant='text'
            size='medium'
            startIcon={<AppIcon icon='FilterNoneIcon' color='warning' />}
          >
            Monthly Summary
          </MDButton>
          <MDButton
            component={RouterLink}
            to='/search'
            onClick={() => dispatch(resetFilters())}
            color='info'
            variant='text'
            size='medium'
            startIcon={<AppIcon icon='SearchIcon' color='info' />}
          >
            Search
          </MDButton>
          <MDButton
            component={RouterLink}
            to='/admin'
            onClick={() => dispatch(resetFilters())}
            color='success'
            variant='text'
            size='medium'
            startIcon={<AppIcon icon='SupervisorAccountIcon' color='success' />}
          >
            Admin
          </MDButton>
        </Grid>
        <Grid container item justifyContent='flex-end' lg={6} spacing={2}>
          <MDButton variant='text' color={isNonPROD ? 'warning' : 'success'} size='large'>
            {env}
          </MDButton>
          <MDButton disabled={!isDashboard} onClick={handleReloadDashboard} iconOnly={true} variant='text' size='large'>
            <AppIcon icon='AutorenewIcon' color={reloadDashboard ? 'error' : 'warning'} />
          </MDButton>
          <MDButton disabled={!isDashboard} onClick={handleShowChartBlock} size='large' iconOnly={true} variant='text'>
            <AppIcon
              icon={showChartBlock ? 'AddIcon' : 'BarChartIcon'}
              color={showChartBlock ? 'success' : 'warning'}
            />
          </MDButton>
          <MDButton
            disabled={!isDashboard}
            onClick={handleAccountExpansion}
            color='info'
            size='large'
            iconOnly={true}
            variant='text'
          >
            <AppIcon icon={accountsExpanded ? 'ExpandLessIcon' : 'ExpandMoreIcon'} color='info' />
          </MDButton>
          {city && (
            <MDButton
              disabled={!isDashboard}
              onClick={handleCityClick}
              color='info'
              iconOnly={true}
              variant='text'
              size='large'
              style={{ minWidth: 120 }}
              startIcon={<AppIcon icon='LocationCityIcon' color='info' />}
            >
              {city.name}
            </MDButton>
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
            <MDButton disabled iconOnly={true} variant='text' color='success' size='large'>
              {buildCityIcon(city.currency)}
            </MDButton>
          )}
        </Grid>
      </Grid>
    </div>
  );
};
