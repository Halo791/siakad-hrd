const DataArray = require('../config/constant-array');

// Dashboard Controller ---------------
const DashboardController = async (req, res) => {
  let resp = { status: false, message: 'Oops Samething went wrong?', data: null }
  const url = req.url;
  const data = DataArray.StudentListArray;
  res.render("index", { currentUrl: url, login_user:req.user, data: data, headerTitle: 'Dashboard' });
}

// Dashboard2 Controller ---------------
const Dashboard2Controller = async (req, res) => {
  const url = req.url;
  res.render("index-2", { currentUrl: url, login_user:req.user, headerTitle: 'Dashboard 2'});
}

// Dashboard3 Controller ---------------
const Dashboard3Controller = async (req, res) => {
  const url = req.url;
  res.render("index-3", { currentUrl: url, login_user:req.user, headerTitle: 'Dashboard 3'});
}

// Invoices Controller ---------------
const InvoicesController = async (req, res) => {
  const url = req.url;
  const data = DataArray.InvoicesListArray;
  res.render("page-invoices", { currentUrl: url, data: data, headerTitle: 'Invoices'});
}
// Transaction Controller ---------------
const TransactionController = async (req, res) => {
  const url = req.url;
  const data = DataArray.TransactionListArray;
  res.render("page-transaction", { currentUrl: url, data: data, headerTitle: 'Transaction'});
}

module.exports = {
  DashboardController,
  Dashboard2Controller,
  Dashboard3Controller,
  InvoicesController,
  TransactionController
}
  