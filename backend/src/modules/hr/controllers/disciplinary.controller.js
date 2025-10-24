import disciplinaryService from '../services/disciplinary.service.js';

export const createAction = async (req, res) => {
  try {
    const action = await disciplinaryService.createAction(req.body, req.user.id);
    res.status(201).json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const notifyEmployee = async (req, res) => {
  try {
    const action = await disciplinaryService.notifyEmployee(req.params.actionId, req.body);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const recordEmployeeResponse = async (req, res) => {
  try {
    const action = await disciplinaryService.recordEmployeeResponse(req.params.actionId, req.body.response);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const makeDecision = async (req, res) => {
  try {
    const action = await disciplinaryService.makeDecision(req.params.actionId, req.body, req.user.id);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const recordAppeal = async (req, res) => {
  try {
    const action = await disciplinaryService.recordAppeal(req.params.actionId);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resolveAppeal = async (req, res) => {
  try {
    const action = await disciplinaryService.resolveAppeal(req.params.actionId, req.body.resolution);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const closeAction = async (req, res) => {
  try {
    const action = await disciplinaryService.closeAction(req.params.actionId);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelAction = async (req, res) => {
  try {
    const action = await disciplinaryService.cancelAction(req.params.actionId, req.body.reason);
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getActionById = async (req, res) => {
  try {
    const action = await disciplinaryService.getActionById(req.params.actionId);
    if (!action) {
      return res.status(404).json({ error: 'Acción disciplinaria no encontrada' });
    }
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActionsByEmployee = async (req, res) => {
  try {
    const actions = await disciplinaryService.getActionsByEmployee(req.params.employeeId);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listActions = async (req, res) => {
  try {
    const result = await disciplinaryService.listActions(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const stats = await disciplinaryService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeDisciplinaryHistory = async (req, res) => {
  try {
    const history = await disciplinaryService.getEmployeeDisciplinaryHistory(req.params.employeeId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
