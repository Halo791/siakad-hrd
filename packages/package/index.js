const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const authenticated = require('./src/routes')
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Base path for views
const baseViewPath = path.join(__dirname, 'src/views');

// Subdirectories organized by feature
const subdirectories = [
  'layouts',
  'pages',
  'pages/dashboard',
  'pages/apps',
  'pages/apps/email',
  'pages/apps/shop',
  'pages/cms',
  'pages/charts',
  'components/bootstrap',
  'plugins',
  'pages/forms',
  'pages/table',
  'pages/authentication',
  'pages/error',
  'pages/widgets'
];

// Set the view engine to EJS and configure the view directories
app.set('view engine', 'ejs');
app.set('views', subdirectories.map(dir => path.join(baseViewPath, dir)));

// Serve static files from the 'assets' directory
app.use('/node/demo', express.static(path.join(__dirname, 'public/assets')));

// Use express-ejs-layouts --------
app.use(expressLayouts);
app.use(express.json());
app.use(cookieParser());

// Register the routes--
app.get('/', (req, res) => {
      res.redirect('/node/demo');
});
app.group("/node/demo", (router) => {
      router.use('/', authenticated);
})
    
// Start the server --------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});