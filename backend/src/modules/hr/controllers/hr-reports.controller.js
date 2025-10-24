import hrReportsService from '../services/hr-reports.service.js';

export const getBirthdaysReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const report = await hrReportsService.getBirthdaysReport(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSeniorityReport = async (req, res) => {
  try {
    const report = await hrReportsService.getSeniorityReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTurnoverReport = async (req, res) => {
  try {
    const { year } = req.query;
    const report = await hrReportsService.getTurnoverReport(year ? parseInt(year) : undefined);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAbsenteeismReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await hrReportsService.getAbsenteeismReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayrollCostReport = async (req, res) => {
  try {
    const { year } = req.query;
    const report = await hrReportsService.getPayrollCostReport(year ? parseInt(year) : undefined);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRetirementProjection = async (req, res) => {
  try {
    const { years } = req.query;
    const report = await hrReportsService.getRetirementProjection(years ? parseInt(years) : undefined);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateWorkCertificate = async (req, res) => {
  try {
    const certificate = await hrReportsService.generateWorkCertificate(req.params.employeeId);
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateIncomeStatement = async (req, res) => {
  try {
    const { months } = req.query;
    const statement = await hrReportsService.generateIncomeStatement(
      req.params.employeeId,
      months ? parseInt(months) : undefined
    );
    res.json(statement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
