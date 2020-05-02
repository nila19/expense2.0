import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

// material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
// core components
import Card from 'components/Card/Card.js';
import CardBody from 'components/Card/CardBody.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardFooter from 'components/Card/CardFooter.js';

import styles from 'assets/jss/material-dashboard-react/components/customTabsStyle.js';

const useStyles = makeStyles(styles);

export default function CustomTabs(props) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, value) => {
    setValue(value);
  };
  const classes = useStyles();
  const { headerColor, plainTabs, tabs, title, rtlActive } = props;
  const cardTitle = classNames({
    [classes.cardTitle]: true,
    [classes.cardTitleRTL]: rtlActive,
  });
  return (
    <Card plain={plainTabs} style={{ marginBottom: '10px' }}>
      <CardHeader color={headerColor} plain={plainTabs} style={{ padding: '8px' }}>
        {title !== undefined ? (
          <div
            className={cardTitle}
            style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '2px', paddingBottom: '2px' }}
          >
            {title}
          </div>
        ) : null}
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.displayNone,
            scrollButtons: classes.displayNone,
          }}
          style={{ paddingLeft: '5px', paddingRight: '5px' }}
          variant='scrollable'
          scrollButtons='auto'
        >
          {tabs.map((prop, idx) => {
            var icon = {};
            if (prop.tabIcon) {
              icon = {
                icon: <prop.tabIcon />,
              };
            }
            return (
              <Tab
                classes={{
                  root: classes.tabRootButton,
                  selected: classes.tabSelected,
                  wrapper: classes.tabWrapper,
                }}
                style={{ padding: '3px', paddingRight: '5px', marginLeft: '5px', marginRight: '5px' }}
                key={idx}
                label={prop.tabName}
                {...icon}
              />
            );
          })}
        </Tabs>
      </CardHeader>
      <CardBody style={{ padding: '10px 20px' }}>
        {tabs.map((prop, idx) => {
          if (idx === value) {
            return <div key={idx}>{prop.tabContent}</div>;
          }
          return null;
        })}
      </CardBody>
      {tabs.map((prop, idx) => {
        if (idx === value && prop.tabFooter) {
          return (
            <CardFooter stats key={idx} style={{ textAlign: 'center' }}>
              <div>{prop.tabFooter}</div>
            </CardFooter>
          );
        }
        return null;
      })}
    </Card>
  );
}

CustomTabs.propTypes = {
  headerColor: PropTypes.oneOf(['warning', 'success', 'danger', 'info', 'primary', 'rose']),
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabName: PropTypes.string.isRequired,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node.isRequired,
      tabFooter: PropTypes.node,
    })
  ),
  rtlActive: PropTypes.bool,
  plainTabs: PropTypes.bool,
};
