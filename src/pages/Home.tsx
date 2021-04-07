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
  const [sessionID, setSessionID] = useState()

  const sessionRef = firebase.database().ref('Session')
  const interactRef = firebase.database().ref('Interact')

  const focusThreshold = 1000

  /*const applyFocusToSession = () => {
    sessionRef.child(sessionID).update({'focused': focusedState})
  }*/

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
      })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      checkFocus()
    }, 1000)
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
    var seshref = sessionRef.push(session)
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
          <Typography paragraph>
            {sessionStart === 0
              ? ''
              : 'Session Started at ' + sessionStartAsDate()}
          </Typography>
          <Typography paragraph>
            {focusedState ? 'FOCUSED' : 'FOCUS UP NOW!!'}
          </Typography>
          <Typography paragraph variant='h5'>
            Welcome to your new app!
          </Typography>

          <Typography paragraph variant='h5'>
            Don't forget to configure your firebase settings in{' '}
            <code>/src/firebase/firebase.ts</code>
          </Typography>

          <Box mt={6}>
            <Typography paragraph>
              This is an example form using react-hook-form
            </Typography>
          </Box>
          <form
            onSubmit={handleSubmit(vals => {
              console.log(vals)
              reset()
            })}
          >
            <TextField
              label='Enter your name'
              name='name'
              variant='outlined'
              fullWidth
              inputRef={register({
                required: formErrorMessages.required
              })}
              error={!!errors.name}
              helperText={errors.name?.message || ' '}
            />
            <Button type='submit' color='primary'>
              Submit
            </Button>
          </form>
        </Wrapper>
      </div>
    </>
  )
}

export default Home
