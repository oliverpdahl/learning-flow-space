import { ReactNode } from 'react'
import {
  AppBar as MaterialAppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  useScrollTrigger,
  LinearProgress
} from '@material-ui/core'
import React from 'react'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { Link } from 'react-router-dom'
import NightsStayIcon from '@material-ui/icons/NightsStayOutlined'
import logo from '../logo.png'

type Props = {
  sessionLength?: number
  title?: string
  backTo?: string
  actions?: ReactNode
}

const AppBar = (props: Props) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 40
  })

  const ProgressBar = () => {
    if (props.sessionLength != 0) {
      return (
        <React.Fragment>
          <LinearProgress variant='determinate' value={props.sessionLength} />
        </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
          {/* <LinearProgress variant='determinate' value={0} /> */}
        </React.Fragment>
      )
    }
  }

  return (
    <MaterialAppBar
      elevation={trigger ? 4 : 0}
      position='sticky'
      color='default'
    >
      <Toolbar>
        {props.backTo && (
          <IconButton
            component={Link}
            to={props.backTo}
            color='inherit'
            edge='start'
          >
            <ArrowBackIcon titleAccess='Navigate Back' />
          </IconButton>
        )}
        {!props.backTo && (
          <img src={logo} style={{ height: '5vh' }} alt='Logo' />
        )}
        <Box mx={3} flex='auto'>
          {ProgressBar()}
        </Box>
        {props.actions}
      </Toolbar>
    </MaterialAppBar>
  )
}

export default AppBar
