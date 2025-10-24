import savingsBankService from '../services/savings-bank.service.js';

export const createSavingsAccount = async (req, res) => {
  try {
    const account = await savingsBankService.createSavingsAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSavingsAccountByEmployee = async (req, res) => {
  try {
    const account = await savingsBankService.getSavingsAccountByEmployee(req.params.employeeId);
    if (!account) {
      return res.status(404).json({ error: 'Cuenta de caja de ahorro no encontrada' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listSavingsAccounts = async (req, res) => {
  try {
    const result = await savingsBankService.listSavingsAccounts(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRates = async (req, res) => {
  try {
    const account = await savingsBankService.updateRates(req.params.employeeId, req.body);
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const recordContribution = async (req, res) => {
  try {
    const contribution = await savingsBankService.recordContribution(req.body);
    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const requestLoan = async (req, res) => {
  try {
    const loan = await savingsBankService.requestLoan(req.body);
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const approveLoan = async (req, res) => {
  try {
    const loan = await savingsBankService.approveLoan(req.params.loanId, req.user.id);
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectLoan = async (req, res) => {
  try {
    const loan = await savingsBankService.rejectLoan(req.params.loanId);
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const recordLoanPayment = async (req, res) => {
  try {
    const loan = await savingsBankService.recordLoanPayment(req.params.loanId, req.body.amount);
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getActiveLoans = async (req, res) => {
  try {
    const loans = await savingsBankService.getActiveLoans(req.params.employeeId);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const stats = await savingsBankService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
