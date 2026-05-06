const express = require('express');
const router = express.Router();
const AdminControllers = require('../controllers/AdminController');
const AuthController = require('../controllers/AuthenticationController');
// const mw = require('../config/authMiddleware');
require('express-group-routes')

router.get("/index", AdminControllers.DashboardController);
router.get("/dashboard", AdminControllers.DashboardController);
router.get("/index-2", AdminControllers.Dashboard2Controller);
router.get("/index-3", AdminControllers.Dashboard3Controller);
router.get("/index-4", (req, res) => { res.render("index-4", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dashboard 4' }); });
router.get("/index-5", (req, res) => { res.render("index-5", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dashboard 5' }); });
router.get("/index-6", (req, res) => { res.render("index-6", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dashboard 6' }); });
router.get("/index-7", (req, res) => { res.render("index-7", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dashboard 7' }); });
router.get("/index-8", (req, res) => { res.render("index-8", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dashboard 8' }); });
router.get("/my-wallet", (req, res) => { res.render("my-wallet", { login_user: req.user, currentUrl: req.url, headerTitle: 'My Wallet' }); });
router.get("/page-invoices", AdminControllers.InvoicesController );
router.get("/page-transaction", AdminControllers.TransactionController);
router.get("/cards-center", (req, res) => { res.render("cards-center", { login_user: req.user, currentUrl: req.url, headerTitle: 'Cards Center' }); });
router.get("/transaction-details", (req, res) => { res.render("transaction-details", { login_user: req.user, currentUrl: req.url, headerTitle: 'Transaction Details' }); });

// CMS --
router.get("/content", (req, res) => { res.render("content", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/content-add", (req, res) => { res.render("content-add", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/menu", (req, res) => { res.render("menu", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/email-template", (req, res) => { res.render("email-template", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/add-email", (req, res) => { res.render("add-email", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/blog", (req, res) => { res.render("cms-blog", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/add-blog", (req, res) => { res.render("add-blog", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });
router.get("/blog-category", (req, res) => { res.render("blog-category", { login_user: req.user, currentUrl: req.url, headerTitle: 'CMS' }); });

// Users Manager-- 
router.get("/app-profile", (req, res) => { res.render("app-profile", { login_user: req.user, currentUrl: req.url, headerTitle: 'App Profile' }); });
router.get("/post-details", (req, res) => { res.render("post-details", { login_user: req.user, currentUrl: req.url, headerTitle: 'Post Details' }); });
router.get("/app-calender", (req, res) => { res.render("app-calender", { login_user: req.user, currentUrl: req.url, headerTitle: 'App Calendar' }); });
// Email Manager--
router.get("/email-compose", (req, res) => { res.render("email-compose", { login_user: req.user, currentUrl: req.url, headerTitle: 'Email Compose' }); });
router.get("/email-inbox", (req, res) => { res.render("email-inbox", { login_user: req.user, currentUrl: req.url, headerTitle: 'Email Inbox' }); });
router.get("/email-read", (req, res) => { res.render("email-read", { login_user: req.user, currentUrl: req.url, headerTitle: 'Email Read' }); });
// Shop Manager--
router.get("/ecom-product-grid", (req, res) => { res.render("ecom-product-grid", { login_user: req.user, currentUrl: req.url, headerTitle: 'Product Grid' }); });
router.get("/ecom-product-list", (req, res) => { res.render("ecom-product-list", { login_user: req.user, currentUrl: req.url, headerTitle: 'Product List' }); });
router.get("/ecom-product-detail", (req, res) => { res.render("ecom-product-detail", { login_user: req.user, currentUrl: req.url, headerTitle: 'Product Detail' }); });
router.get("/ecom-product-order", (req, res) => { res.render("ecom-product-order", { login_user: req.user, currentUrl: req.url, headerTitle: 'Product Order' }); });
router.get("/ecom-checkout", (req, res) => { res.render("ecom-checkout", { login_user: req.user, currentUrl: req.url, headerTitle: 'Ecom Checkout' }); });
router.get("/ecom-invoice", (req, res) => { res.render("ecom-invoice", { login_user: req.user, currentUrl: req.url, headerTitle: 'Ecom Invoice' }); });
router.get("/ecom-customers", (req, res) => { res.render("ecom-customers", { login_user: req.user, currentUrl: req.url, headerTitle: 'Ecom Customers' }); });

// Chart --
router.get("/chart-flot", (req, res) => { res.render("chart-flot", { login_user: req.user, currentUrl: req.url, headerTitle: 'Chart Flot' }); });
router.get("/chart-morris", (req, res) => { res.render("chart-morris", { login_user: req.user, currentUrl: req.url, headerTitle: 'Morris Chart' }); });
router.get("/chart-chartjs", (req, res) => { res.render("chart-chartjs", { login_user: req.user, currentUrl: req.url, headerTitle: 'Chart Chartjs' }); });
router.get("/chart-chartist", (req, res) => { res.render("chart-chartist", { login_user: req.user, currentUrl: req.url, headerTitle: 'Chart Chartist' }); });
router.get("/chart-sparkline", (req, res) => { res.render("chart-sparkline", { login_user: req.user, currentUrl: req.url, headerTitle: 'Chart Sparkline' }); });
router.get("/chart-peity", (req, res) => { res.render("chart-peity", { login_user: req.user, currentUrl: req.url, headerTitle: 'Chart Peity' }); });

// bootstrap --
router.get("/ui-accordion", (req, res) => { res.render("ui-accordion", { login_user: req.user, currentUrl: req.url, headerTitle: 'Accordion' }); });
router.get("/ui-alert", (req, res) => { res.render("ui-alert", { login_user: req.user, currentUrl: req.url, headerTitle: 'Alert' }); });
router.get("/ui-badge", (req, res) => { res.render("ui-badge", { login_user: req.user, currentUrl: req.url, headerTitle: 'Badge' }); });
router.get("/ui-button", (req, res) => { res.render("ui-button", { login_user: req.user, currentUrl: req.url, headerTitle: 'Buttons' }); });
router.get("/ui-modal", (req, res) => { res.render("ui-modal", { login_user: req.user, currentUrl: req.url, headerTitle: 'Modal' }); });
router.get("/ui-button-group", (req, res) => { res.render("ui-button-group", { login_user: req.user, currentUrl: req.url, headerTitle: 'Button Group' }); });
router.get("/ui-list-group", (req, res) => { res.render("ui-list-group", { login_user: req.user, currentUrl: req.url, headerTitle: 'List Group' }); });
router.get("/ui-card", (req, res) => { res.render("ui-card", { login_user: req.user, currentUrl: req.url, headerTitle: 'Card' }); });
router.get("/ui-carousel", (req, res) => { res.render("ui-carousel", { login_user: req.user, currentUrl: req.url, headerTitle: 'Carousel' }); });
router.get("/ui-dropdown", (req, res) => { res.render("ui-dropdown", { login_user: req.user, currentUrl: req.url, headerTitle: 'Dropdown' }); });
router.get("/ui-popover", (req, res) => { res.render("ui-popover", { login_user: req.user, currentUrl: req.url, headerTitle: 'Popover' }); });
router.get("/ui-progressbar", (req, res) => { res.render("ui-progressbar", { login_user: req.user, currentUrl: req.url, headerTitle: 'Progressbar' }) });
router.get("/ui-tab", (req, res) => { res.render("ui-tab", { login_user: req.user, currentUrl: req.url, headerTitle: 'Tab' }); });
router.get("/ui-typography", (req, res) => { res.render("ui-typography", { login_user: req.user, currentUrl: req.url, headerTitle: 'Typography' }); });
router.get("/ui-pagination", (req, res) => { res.render("ui-pagination", { login_user: req.user, currentUrl: req.url, headerTitle: 'Pagination' }) });
router.get("/ui-grid", (req, res) => { res.render("ui-grid", { login_user: req.user, currentUrl: req.url, headerTitle: 'Grid' }); });
router.get("/ui-media-object", (req, res) => { res.render("ui-media-object", { login_user: req.user, currentUrl: req.url, headerTitle: 'Media Object' }); });

// Plugins --
router.get("/uc-select2", (req, res) => { res.render("uc-select2", { login_user: req.user, currentUrl: req.url, headerTitle: 'Select2' }); });
router.get("/uc-nestable", (req, res) => { res.render("uc-nestable", { login_user: req.user, currentUrl: req.url, headerTitle: 'Nestable' }); });
router.get("/uc-noui-slider", (req, res) => { res.render("uc-noui-slider", { login_user: req.user, currentUrl: req.url, headerTitle: 'UI Slider' }); });
router.get("/uc-sweetalert", (req, res) => { res.render("uc-sweetalert", { login_user: req.user, currentUrl: req.url, headerTitle: 'Sweet Alert' }); });
router.get("/uc-toastr", (req, res) => { res.render("uc-toastr", { login_user: req.user, currentUrl: req.url, headerTitle: 'Toastr' }); });
router.get("/map-jqvmap", (req, res) => { res.render("map-jqvmap", { login_user: req.user, currentUrl: req.url, headerTitle: 'Jqvmap' }); });
router.get("/uc-lightgallery", (req, res) => { res.render("uc-lightgallery", { login_user: req.user, currentUrl: req.url, headerTitle: 'Light Gallery' }); });

// widget -- 
router.get("/widget-card", (req, res) => { res.render("widget-card", { login_user: req.user, currentUrl: req.url, headerTitle: 'Widget'}); });
router.get("/widget-chart", (req, res) => { res.render("widget-chart", { login_user: req.user, currentUrl: req.url, headerTitle: 'Widget'}); });
router.get("/widget-list", (req, res) => { res.render("widget-list", { login_user: req.user, currentUrl: req.url, headerTitle: 'Widget'}); });

// Forms -- 
router.get("/form-element", (req, res) => { res.render("form-element", { login_user: req.user, currentUrl: req.url, headerTitle: 'Element' }); });
router.get("/form-wizard", (req, res) => { res.render("form-wizard", { login_user: req.user, currentUrl: req.url, headerTitle: 'Wizard' }); });
router.get("/form-ckeditor", (req, res) => { res.render("form-ckeditor", { login_user: req.user, currentUrl: req.url, headerTitle: 'CkEditor' }); });
router.get("/form-pickers", (req, res) => { res.render("form-pickers", { login_user: req.user, currentUrl: req.url, headerTitle: 'Pickers' }); });
router.get("/form-validation", (req, res) => { res.render("form-validation", { login_user: req.user, currentUrl: req.url, headerTitle: 'Form Validation' }); });
// Table -- 
router.get("/table-bootstrap-basic", (req, res) => { res.render("table-bootstrap-basic", { login_user: req.user, currentUrl: req.url, headerTitle: 'Bootstrap' }); });
router.get("/table-datatable-basic", (req, res) => { res.render("table-datatable-basic", { login_user: req.user, currentUrl: req.url, headerTitle: 'DataTable' }); });

router.get("/empty-page", (req, res) => { res.render("empty-page", { login_user: req.user, currentUrl: req.url, headerTitle: 'Empty Page' }); });

// Authentication --    
const withOutLayoutPageRoute = [
  { name: "page-login" },
  { name: "page-register" },
  { name: "page-forgot-password" },
  { name: "page-lock-screen" },
  { name: "page-error-400" },
  { name: "page-error-403" },
  { name: "page-error-404" },
  { name: "page-error-500" },
  { name: "page-error-503" },
];

router.get("/", function (req, res) {
  const token = req.cookies.token;
  if (token && (req.url === '/')) {
    res.redirect('dashboard');
  } else {
    res.render("page-login", { layout: false, message: req.query.message || null });
  }
});
router.post('/login-store', AuthController.login);
router.post('/register-store', AuthController.RegisterStore);
router.get('/logout', AuthController.logout);

for (let i = 0; i < withOutLayoutPageRoute.length; i++) {
  router.get(`/${withOutLayoutPageRoute[i].name}`, function (req, res) {
    const token = req.cookies.token;
    if (token && (req.url == '' || req.url == '/page-login' || req.url == '/page-register')) {
      res.redirect('/dashboard');
    } else {
      const message = req.query.message || null;
      res.render(`${withOutLayoutPageRoute[i].name}`, { layout: false, message: message });
    }
  });
}
// Error--
router.get('*', function (req, res) {
  res.render('page-error-404', { layout: false });
});


module.exports = router;