import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup
} from '@material-ui/core'
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
  const [currentTool, setCurrentTool] = useState('typing')

  const sessionRef = firebase.database().ref('Session')
  const interactRef = firebase.database().ref('Interact')

  const focusThreshold = 5000

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
    /*window.addEventListener('keydown', createKeyDown)
    window.addEventListener('click', createClick)

    var myConfObj = {
      iframeMouseOver : false
    }
    window.addEventListener('blur',function(){
      if(myConfObj.iframeMouseOver){
        console.log('Wow! Iframe Click!');
      }
    });
    
    document.getElementById('embeddedTool')?.addEventListener('mouseover',function(){
       myConfObj.iframeMouseOver = true;
    });
    document.getElementById('embeddedTool')?.addEventListener('mouseout',function(){
        myConfObj.iframeMouseOver = false;
    });*/

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
  return (
    <>
      <AppBar
        title=''
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
      <div
        id='wrapperDiv'
        tabIndex={0}
        onClick={createClick}
        onKeyDown={createKeyDown}
        style={{ width: '100%', height: '100%' }}
      >
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
          <ButtonGroup
            style={{ width: '100%' }}
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
