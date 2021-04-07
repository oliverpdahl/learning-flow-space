import { Box, Typography, TextField, Button } from '@material-ui/core'
import { Link } from 'react-router-dom'
import routes from './routes'
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
  const [focusedState, setFocusedState] = useState(false)
  const [focusLock, setFocusLock] = useState(false)
  const [sessionID, setSessionID] = useState('')
  let stringArray: string[] = []
  const [focusedUsers, setFocusedUsers] = useState(stringArray)

  const sessionRef = firebase.database().ref('Session')
  const interactRef = firebase.database().ref('Interact')

  const focusThreshold = 1000

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
            } else {
              setFocusedState(true)
            }
          } else {
            setFocusedState(false)
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
    return date.toString()
  }

  const getFocusedUserString = () => {
    let focusedUserString = ''
    for (var username of focusedUsers) {
      focusedUserString += username + ' is focused | '
    }
    return focusedUserString
  }

  return (
    <>
      <AppBar
        title='fullstrapp'
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
      <div onClick={createClick} onKeyDown={createKeyDown} tabIndex={0}>
        <Wrapper>
          <Typography paragraph>{getFocusedUserString()}</Typography>
          <Typography paragraph>
            {sessionStart === 0
              ? ''
              : 'Session Started at ' + sessionStartAsDate()}
          </Typography>
          <Typography paragraph>
            {focusedState ? 'FOCUSED' : 'FOCUS UP NOW!!'}
          </Typography>
        </Wrapper>
      </div>
    </>
  )
}

export default Home
