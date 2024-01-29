// @mui material components
import React, { useState } from 'react';

import { Grid, Card, Badge, Tooltip } from '@mui/material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

import { AppIcon } from 'components/app/AppIcon';

const AppTabBadge = ({ badge, idx, handleTabChange, children }) => {
  return (
    <Badge variant='dot' color='error' invisible={!badge} onClick={() => handleTabChange(idx)}>
      {children}
    </Badge>
  );
};

const buildAppTabs = (tabs, handleTabChange) => {
  return (
    tabs && (
      <Grid container spacing={2} columns={3}>
        {tabs.map(({ tabName, tabIcon, badge }, i) => (
          <Tooltip title={tabName} placement='top'>
            <Grid item xs={1} key={i}>
              <AppTabBadge badge={badge} idx={i} handleTabChange={handleTabChange}>
                <AppIcon icon={tabIcon} color='white' clickable />
              </AppTabBadge>
            </Grid>
          </Tooltip>
        ))}
      </Grid>
    )
  );
};

export const AppSection = ({ headerColor, title, content, tabs }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const getTabContent = (currentTab) => {
    const { tabContent } = tabs[currentTab];
    return tabContent;
  };

  const getContent = () => content || getTabContent(currentTab);

  return (
    <Card sx={{ marginTop: '35px', marginLeft: '5px', marginRight: '5px' }}>
      <MDBox padding='0.25rem'>
        <MDBox
          variant='gradient'
          bgColor={headerColor}
          borderRadius='lg'
          coloredShadow={headerColor}
          pl={2}
          py={1}
          pr={0.5}
          mt={-5}
          height='3rem'
        >
          <Grid container spacing={2} columns={24}>
            <Grid item xs={tabs ? 3 : 6}>
              <MDTypography variant='subtitle2' textTransform='uppercase' fontWeight='light' color='white' pt={0.8}>
                {title}
              </MDTypography>
            </Grid>
            <Grid item xs={3}>
              {buildAppTabs(tabs, handleTabChange)}
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={1} pb={1} px={1}>
          {getContent()}
        </MDBox>
      </MDBox>
    </Card>
  );
};
