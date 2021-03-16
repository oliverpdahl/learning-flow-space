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
import formErrorMessages from '../utils/formErrorMessages'
import { useState } from 'react'
import { Route, Redirect } from 'react-router'

const Home = () => {
  const { register, errors, handleSubmit, reset } = useForm<{ name: string }>()

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
      <Wrapper>
        <Box>
          <ButtonGroup
            size='large'
            color='primary'
            aria-label='large outlined primary button group'
            fullWidth
          >
            <Button
              color='primary'
              size='large'
              component={Link}
              to={routes.typing}
              variant='contained'
            >
              Typing
            </Button>
            <Button
              color='primary'
              size='large'
              component={Link}
              to={routes.sketchpad}
              variant='contained'
            >
              Sketchpad
            </Button>
          </ButtonGroup>
        </Box>
        {/* <Typography paragraph variant='h5'>
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
        </form> */}
        {/* This is where the webpage is embedded */}
        <Route
          path={routes.sketchpad}
          children={
            <embed
              src='https://sketch.io/sketchpad/?'
              style={{ width: '100%', flex: 1, height: '87vh' }}
            />
          }
        />
        <Route
          path={routes.typing}
          children={
            <embed
              src='https://www.typing.com/student/lessons'
              style={{ width: '100%', flex: 1, height: '87vh' }}
            />
          }
        />
      </Wrapper>
    </>
  )
}

export default Home
