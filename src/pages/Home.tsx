import { Box, Typography, TextField, Button } from '@material-ui/core'
import { Link } from 'react-router-dom'
import routes from './routes'
import Wrapper from '../components/Wrapper'
import AppBar from '../components/AppBar'
import { useForm } from 'react-hook-form'
import firebase from '../firebase'
import { useEffect, useState } from 'react'
import formErrorMessages from '../utils/formErrorMessages'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<{ name: string }>()
  const [sessionStart, setSessionStart] = useState(0)

  const createSession = () => {
    const sessionRef = firebase.database().ref('Session')
    const now = new Date().getTime()
    const session = {
      time: now,
      userID: firebase.auth().currentUser?.uid || '',
      userName: firebase.auth().currentUser?.displayName || ''
    }
    sessionRef.push(session)
  }

  const createClick = () => {
    const interactRef = firebase.database().ref('Interact')
    const now = new Date().getTime()
    const interact = {
      time: now,
      type: 'click'
    }
    interactRef.push(interact)
  }

  const createKeyDown = () => {
    const interactRef = firebase.database().ref('Interact')
    const now = new Date().getTime()
    const interact = {
      time: now,
      type: 'keydown'
    }
    interactRef.push(interact)
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
          {sessionStart === 0 ? '' : sessionStart}
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
