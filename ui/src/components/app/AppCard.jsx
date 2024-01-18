// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { AppIcon } from "components/app/AppIcon";

export const AppCard = ({ color, titleIcon, title, body, footer, ...others }) => {
  return (
    <Card sx={{ height: "100%", marginTop: "35px", marginLeft: "5px" }} {...others}>
      <MDBox padding="0.25rem">
        <MDBox
          variant="gradient"
          bgColor={color}
          borderRadius="lg"
          coloredShadow={color}
          py={1}
          pr={0.5}
          mt={-5}
          height="3rem"
        >
          <Grid container spacing={2} columns={12}>
            <Grid item xs={1}>
              <MDBox pl={1} pt={1}>
                <AppIcon icon={titleIcon} clickable={false} color="white" />
              </MDBox>
            </Grid>
            <Grid item xs={11}>
              <MDTypography
                variant="subtitle2"
                textTransform="uppercase"
                fontWeight="light"
                color="white"
                pt={0.8}
              >
                {title}
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={1} pb={1} px={0}>
          <MDBox padding="1rem">{body}</MDBox>
          {footer && (
            <>
              <Divider />
              <MDBox padding="1rem">{footer}</MDBox>
            </>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
};
