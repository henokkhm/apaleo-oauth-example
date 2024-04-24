const path = require('path');
const express = require('express');
require('dotenv').config();

const { axios } = require('./config/axiosInstance');
const { logger } = require('./config/logger');
const { morganMiddleware } = require('./middlewares/morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(morganMiddleware);

app.get('/', (req, res) => {
  return res.render('index', { title: 'Apaleo OAuth Example' });
});

// The following route accepts the authorization code from Apaleo
app.get('/auth/apaleo/redirect', (req, res) => {
  const queryParams = req.query;
  return res.render('auth-apaleo-redirect', {
    title: 'Data Returned From Apaleo',
    queryParams,
  });
});

// The following route accepts the authorization code from the
// front-end (to mimic a SPA), and sends it to Apaleo in order to
// exchange it for an access token, refresh token, and user profile info
// If successful, it redirects the user to the dashboard
app.post('/auth/apaleo/token-exchange-handler', (req, res) => {
  logger.info('Query String Parameters:', req.query);
  logger.info('JSON Request Body:', req.body);

  const { errorId, code, state, session_state } = req.body;

  if (errorId) {
    // we get an error if the user doesn't give consent.
    // The frontend should redirect to the home page, and use
    // React-toastify to notify the user
    logger.error(`Apaleo returned error with code ${errorId}`);
    return res
      .status(500)
      .send({ message: `Apaleo returned error with code ${errorId}` });
  }

  /**
   * The session_state value contains a salted cryptographic hash of Client ID, origin URL, and OpenID Provider’s browser state.
   * TODO: Can we this to figure out if the user was trying to log in or register?
   */

  try {
    // STEP 7: Exchange the auth-code for Access token and
    const data = new URLSearchParams();
    const { APALEO_CLIENT_ID, APALEO_CLIENT_SECRET } = process.env;

    if (!APALEO_CLIENT_ID) {
      logger.error('APALEO_CLIENT_ID not set in environment variables');
    }

    if (!APALEO_CLIENT_SECRET) {
      logger.error('APALEO_CLIENT_SECRET not set in environment variables');
    }

    data.append('client_id', APALEO_CLIENT_ID);
    data.append('client_secret', APALEO_CLIENT_SECRET);
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append(
      'redirect_uri',
      'https://apaleo-oauth-example.onrender.com/dashboard',
    );

    axios
      .post('https://identity.apaleo.com/connect/token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((response) => {
        logger.info('Apaleo /connect/token endpoint response:', response.data);

        /**
         * Example response from Apaleo
         * {
         *   "id_token": "eyJhbG.............aGV_EyOANg",
         *   "access_token": "eyJhbGciOi.....Upe6r6hHNLiNQ",
         *   "expires_in": 3600,
         *   "token_type": "Bearer",
         *   "refresh_token": "_A4CpoIDT.......qYEpxEW8g",
         *   "scope": "openid profile availability.read rates.read reservations.read identity:account-users.read offline_access"
         * }
         *
         *  From Apaleo's Docs
         *  ==================
         *
         *  access_token........An access token that can be provided in subsequent calls, for example to apaleo API services.
         *  id_token............It is sent to the client application as part of an OpenID Connect flow. It is used by the client to authenticate the user.
         *  expires_in..........The time period (in seconds) for which the access token is valid. After this time period, the token will no longer be valid, and a new one must be retrieved.
         *  token_type..........How the access token may be used: always Bearer.
         *  refresh_token.......This token is included if the offline_access scope was requested and granted. This is a long-lived token that can be used to automatically generate a new access_token when the current one expires. This should be kept confidential.
         *  scope...............A space-separated list of scopes that have been granted for this access_token.
         */

        const {
          id_token,
          access_token,
          expires_in,
          token_type,
          refresh_token,
          scope,
        } = response.data;

        if (
          !id_token ||
          !access_token ||
          !expires_in ||
          !token_type ||
          !refresh_token ||
          !scope
        ) {
          logger.error("Missing fields in Apaleo's response");
        }

        // TODO: Save response data to database

        // STEP 10: Use Access token to request private data from api.apaleo.com

        axios
          .get('https://api.apaleo.com/inventory/v1/properties/MUC', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then((response) => {
            logger.info(
              'Response from api.apaleo.com/inventory/v1/properties/MUC:',
              response.data,
            );
            return res
              .status(200)
              .send({
                message: 'successfully fetched data from Apaleo',
                data: response.data,
              });
          })
          .catch((error) => {
            logger.error(
              `Error while fetching data from api.apaleo.com/inventory/v1/properties/MUC ${error}`,
            );
            return res
              .status(500)
              .send({ message: `Error while fetching data from api.apaleo.com` });
          });
      })
      .catch((error) => {
        logger.error(`Error exchanging auth-code for access token ${error}`);
        return res
          .status(500)
          .send({ message: `Error exchanging auth-code for access token` });
      });
  } catch (error) {
    logger.error(`Error in /token-exchange-handler ${error}`);
  }
});

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});
