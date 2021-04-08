import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Drawer,
  Chip,
  Divider
} from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'
import routes from './routes'
import Alert from '@material-ui/lab/Alert'
import AlertTitle from '@material-ui/lab/AlertTitle'
import Wrapper from '../components/Wrapper'
import AppBar from '../components/AppBar'
import { useForm } from 'react-hook-form'
import firebase from '../firebase'
import { useEffect, useState } from 'react'
import formErrorMessages from '../utils/formErrorMessages'
import { noWait } from 'recoil'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<{ name: string }>()
  const [sessionStart, setSessionStart] = useState(0)
  const [focusedState, setFocusedState] = useState(true)
  const [focusedWarningState, setFocusedWarningState] = useState(false)
  const [focusLock, setFocusLock] = useState(false)
  const [sessionID, setSessionID] = useState('')
  let stringArray: string[] = []
  const [focusedUsers, setFocusedUsers] = useState(stringArray)
  const [currentTool, setCurrentTool] = useState('typing')
  const [iframeLoaded, setIFrameLoaded] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sessionRef = firebase.database().ref('Session')
  const interactRef = firebase.database().ref('Interact')

  const focusThreshold = 5000
  const warningThreshold = 3000

  const updateFocusedState = () => {
    if (!!sessionID) {
      sessionRef.child(sessionID).update({ focused: focusedState })
    }
  }

  const getSessionID = () => {
    sessionRef
      .orderByChild('userID')
      .equalTo(firebase.auth().currentUser?.uid || '')
      .limitToLast(1)
      .on('value', snapshot => {
        const sessions = snapshot.val()
        const ids = []
        for (let id in sessions) {
          ids.push(id)
        }
        setSessionID(ids[0])
      })
  }

  const getFocusedUsers = () => {
    sessionRef
      .orderByChild('focused')
      .equalTo(true)
      .on('value', snapshot => {
        const sessions = snapshot.val()
        let focusedUsersCollect: string[] = []
        for (let id in sessions) {
          focusedUsersCollect.push(sessions[id].userName)
        }
        setFocusedUsers(focusedUsersCollect)
      })
  }

  const checkFocus = () => {
    interactRef
      .orderByChild('userID')
      .equalTo(firebase.auth().currentUser?.uid || '')
      .limitToLast(1)
      .on('value', snapshot => {
        const interacts = snapshot.val()
        const lasttwointeracts = []
        for (let id in interacts) {
          lasttwointeracts.push({ id, ...interacts[id] })
        }
        if (!focusLock) {
          if (!!lasttwointeracts[0]) {
            const t1 = lasttwointeracts[0].time
            const now = new Date().getTime()
            const dif = now - t1
            if (dif > focusThreshold) {
              setFocusedState(false)
            } else if (dif > warningThreshold) {
              setFocusedWarningState(true)
            } else {
              setFocusedState(true)
              setFocusedWarningState(false)
            }
          } else {
            setFocusedState(true)
            setFocusedWarningState(false)
          }
        }
      })
  }

  const handleFocus = () => {
    checkFocus()
    updateFocusedState()
    getFocusedUsers()
  }

  useEffect(() => {
    const timer = setInterval(() => {
      handleFocus()
    }, 1000)
    window.addEventListener('beforeunload', ev => {
      if (!!sessionID) {
        sessionRef.child(sessionID).update({ focused: false })
      }
      setFocusLock(true)
    })

    return () => {
      clearInterval(timer)
    }
  })

  const createSession = () => {
    const now = new Date().getTime()
    const session = {
      time: now,
      focused: false,
      userID: firebase.auth().currentUser?.uid || '',
      userName: firebase.auth().currentUser?.displayName || ''
    }
    sessionRef.push(session)
    getSessionID()
    return now
  }

  const checkSetSession = () => {
    if (sessionStart === 0) {
      setSessionStart(createSession())
    }
  }

  const createClick = () => {
    const now = new Date().getTime()

    checkSetSession()

    const interact = {
      time: now,
      type: 'click',
      userID: firebase.auth().currentUser?.uid || '',
      userName: firebase.auth().currentUser?.displayName || ''
    }
    interactRef.push(interact)
  }

  const createKeyDown = () => {
    const now = new Date().getTime()

    checkSetSession()

    const interact = {
      time: now,
      type: 'keydown',
      userID: firebase.auth().currentUser?.uid || '',
      userName: firebase.auth().currentUser?.displayName || ''
    }
    interactRef.push(interact)
  }

  const sessionStartAsDate = () => {
    const date = new Date(sessionStart)
    return date.toLocaleString()
  }

  const focusAlert = () => {
    if (!focusedState) {
      return (
        <Alert severity='error'>
          <AlertTitle>Unfocused</AlertTitle>
          You might have left the page and have lost your focus — to restart
          your focus <strong>Click Here!</strong>
        </Alert>
      )
    } else if (focusedWarningState) {
      return (
        <Alert severity='warning'>
          <AlertTitle>Check In</AlertTitle>
          <strong>Click Here </strong> to check in and show that you are still
          on the page — <strong>don't loose your focus!</strong>
        </Alert>
      )
    } else {
      return (
        <Alert severity='success'>
          <AlertTitle>Focused</AlertTitle>
          You're doing great —{' '}
          <strong onClick={setDrawerToOpen}>Click Here</strong> to see who else
          is active!
        </Alert>
      )
    }
  }

  const getFocusedUserMap = () => {
    let testFocusedUsers = ['test1', 'test2', 'test3']
    return (
      <p>
        {testFocusedUsers.map(username => (
          <Chip
            color='primary'
            style={{ marginLeft: '4px' }}
            label={username}
          />
        ))}
      </p>
    )
  }

  const getLoosingFocusUserMap = () => {
    let testFocusedUsers = ['test1', 'test2', 'test3']
    return (
      <p>
        {testFocusedUsers.map(username => (
          <Chip style={{ marginLeft: '4px' }} label={username} />
        ))}
      </p>
    )
  }

  const getUnfocusedUserMap = () => {
    let testFocusedUsers = ['test1', 'test2', 'test3']
    return (
      <p>
        {testFocusedUsers.map(username => (
          <Chip
            color='secondary'
            style={{ marginLeft: '4px' }}
            label={username}
          />
        ))}
      </p>
    )
  }

  const setToolToTyping = () => {
    setCurrentTool('typing')
  }

  const setToolToSketch = () => {
    setCurrentTool('sketch')
  }

  const embedTool = () => {
    if (currentTool === 'sketch') {
      return (
        <iframe
          id='embeddedTool'
          src='https://sketch.io/sketchpad'
          style={{
            height: '75vh',
            left: '0',
            position: 'relative',
            top: '0',
            width: '100%'
          }}
        />
      )
    } else {
      return (
        <iframe
          id='embeddedTool'
          src='https://www.typing.com/student/lessons'
          style={{
            height: '75vh',
            left: '0',
            position: 'relative',
            top: '0',
            width: '100%'
          }}
        />
      )
    }
  }

  const setDrawerToOpen = () => {
    setDrawerOpen(true)
  }

  const setDrawerToClosed = () => {
    setDrawerOpen(false)
  }

  return (
    <>
      <AppBar
        title={
          sessionStart === 0
            ? ''
            : 'Focus Session Started on ' + sessionStartAsDate()
        }
        actions={
          <Button
            color='primary'
            size='small'
            component={Link}
            to={routes.signin}
            variant='contained'
          >
            Sign In
          </Button>
        }
      />
      <React.Fragment key={'right'}>
        <Drawer anchor={'right'} open={drawerOpen} onClose={setDrawerToClosed}>
          <Box m={2}>
            {getFocusedUserMap()}
            <Divider />
            {getLoosingFocusUserMap()}
            <Divider />
            {getUnfocusedUserMap()}
          </Box>
        </Drawer>
      </React.Fragment>
      <div
        id='wrapperDiv'
        tabIndex={0}
        onClick={createClick}
        onKeyDown={createKeyDown}
        style={{ width: '100%', height: '100%' }}
      >
        <Wrapper>
          {focusAlert()}
          <ButtonGroup
            style={{ width: '100%', marginTop: '10px' }}
            variant='contained'
            size='large'
            color='primary'
          >
            <Button style={{ width: '50%' }} onClick={setToolToTyping}>
              Typing
            </Button>
            <Button style={{ width: '50%' }} onClick={setToolToSketch}>
              Sketchpad
            </Button>
          </ButtonGroup>
          {embedTool()}
        </Wrapper>
      </div>
    </>
  )
}

export default Home
