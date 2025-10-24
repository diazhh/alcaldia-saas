import dependentService from '../services/dependent.service.js';

export const createDependent = async (req, res) => {
  try {
    const dependent = await dependentService.createDependent(req.body);
    res.status(201).json(dependent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getDependentsByEmployee = async (req, res) => {
  try {
    const dependents = await dependentService.getDependentsByEmployee(req.params.employeeId);
    res.json(dependents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDependentById = async (req, res) => {
  try {
    const dependent = await dependentService.getDependentById(req.params.id);
    if (!dependent) {
      return res.status(404).json({ error: 'Dependiente no encontrado' });
    }
    res.json(dependent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDependent = async (req, res) => {
  try {
    const dependent = await dependentService.updateDependent(req.params.id, req.body);
    res.json(dependent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDependent = async (req, res) => {
  try {
    const dependent = await dependentService.deleteDependent(req.params.id);
    res.json(dependent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMinorChildren = async (req, res) => {
  try {
    const children = await dependentService.getMinorChildren(req.params.employeeId);
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const calculateChildBonus = async (req, res) => {
  try {
    const bonusPerChild = req.query.bonusPerChild || 150;
    const result = await dependentService.calculateChildBonus(req.params.employeeId, parseFloat(bonusPerChild));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listDependents = async (req, res) => {
  try {
    const result = await dependentService.listDependents(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const stats = await dependentService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
