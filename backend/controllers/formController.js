const Form = require('../models/Form');
const Response = require('../models/Response');
const { Op } = require('sequelize');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
exports.createForm = async (req, res) => {
  try {
    const { title, description, fields } = req.body;

    const form = await Form.create({
      title,
      description,
      fields,
      createdBy: req.user.id,
    });

    res.status(201).json({ ...form.toJSON(), _id: form.id });
  } catch (error) {
    console.error(`Create Form Error: ${error.message}`);
    res.status(500).json({ message: 'Server error creating form' });
  }
};

// @desc    Get all forms of the authenticated user
// @route   GET /api/forms
// @access  Private
exports.getForms = async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { createdBy: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    
    // Enrich forms with response counts
    const enrichedForms = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.count({ where: { formId: form.id } });
        return {
          ...form.toJSON(),
          _id: form.id,
          responseCount,
        };
      })
    );

    res.json(enrichedForms);
  } catch (error) {
    console.error(`Get Forms Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving forms' });
  }
};

// @desc    Get form by ID (Public for taking form)
// @route   GET /api/forms/:id
// @access  Public
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ ...form.toJSON(), _id: form.id });
  } catch (error) {
    console.error(`Get Form By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving form' });
  }
};

// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private
exports.updateForm = async (req, res) => {
  try {
    const { title, description, fields } = req.body;

    let form = await Form.findByPk(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Verify ownership
    if (form.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this form' });
    }

    await form.update({
      title: title || form.title,
      description: description !== undefined ? description : form.description,
      fields: fields || form.fields,
    });

    res.json({ ...form.toJSON(), _id: form.id });
  } catch (error) {
    console.error(`Update Form Error: ${error.message}`);
    res.status(500).json({ message: 'Server error updating form' });
  }
};

// @desc    Delete a form and all its responses
// @route   DELETE /api/forms/:id
// @access  Private
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Verify ownership
    if (form.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    // Delete responses first (Foreign key constraint onDelete: 'CASCADE' can also handle this, but explicit cleanup is robust)
    await Response.destroy({ where: { formId: form.id } });

    // Delete form
    await form.destroy();

    res.json({ message: 'Form and responses deleted successfully' });
  } catch (error) {
    console.error(`Delete Form Error: ${error.message}`);
    res.status(500).json({ message: 'Server error deleting form' });
  }
};

// @desc    Duplicate an existing form
// @route   POST /api/forms/:id/duplicate
// @access  Private
exports.duplicateForm = async (req, res) => {
  try {
    const sourceForm = await Form.findByPk(req.params.id);
    if (!sourceForm) {
      return res.status(404).json({ message: 'Source form not found' });
    }

    // Verify ownership
    if (sourceForm.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to duplicate this form' });
    }

    const duplicatedForm = await Form.create({
      title: `${sourceForm.title} (Copy)`,
      description: sourceForm.description,
      fields: sourceForm.fields,
      createdBy: req.user.id,
    });

    res.status(201).json({ ...duplicatedForm.toJSON(), _id: duplicatedForm.id });
  } catch (error) {
    console.error(`Duplicate Form Error: ${error.message}`);
    res.status(500).json({ message: 'Server error duplicating form' });
  }
};

// @desc    Get dashboard stats for user forms
// @route   GET /api/forms/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's forms
    const forms = await Form.findAll({ where: { createdBy: userId } });
    const formIds = forms.map((f) => f.id);

    const totalForms = forms.length;

    // Total responses for user's forms
    const totalResponses = await Response.count({
      where: { formId: formIds },
    });

    // Recent forms (last 5)
    const recentForms = await Form.findAll({
      where: { createdBy: userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Enrich recent forms with responses count
    const enrichedRecentForms = await Promise.all(
      recentForms.map(async (form) => {
        const responseCount = await Response.count({ where: { formId: form.id } });
        return {
          ...form.toJSON(),
          _id: form.id,
          responseCount,
        };
      })
    );

    // Recent responses (last 5)
    const recentResponses = await Response.findAll({
      where: { formId: formIds },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Form,
          attributes: ['title'],
        },
      ],
    });

    // Remap recentResponses to match mongoose populated structure
    const formattedRecentResponses = recentResponses.map((r) => {
      const json = r.toJSON();
      return {
        _id: json.id,
        answers: json.answers,
        submittedAt: json.createdAt,
        formId: {
          id: json.formId,
          title: json.Form?.title || 'Form',
        },
      };
    });

    // Submissions count per form
    const submissionsPerForm = await Promise.all(
      forms.map(async (form) => {
        const count = await Response.count({ where: { formId: form.id } });
        return {
          formId: form.id,
          title: form.title,
          count,
        };
      })
    );

    // Submission trends over last 7 days
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const responsesInLastSevenDays = await Response.findAll({
      where: {
        formId: formIds,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    responsesInLastSevenDays.forEach((resp) => {
      const dateStr = new Date(resp.createdAt).toISOString().split('T')[0];
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++;
      }
    });

    const trendData = Object.keys(trendMap).map((date) => ({
      date,
      count: trendMap[date],
    }));

    res.json({
      totalForms,
      totalResponses,
      recentForms: enrichedRecentForms,
      recentResponses: formattedRecentResponses,
      submissionsPerForm,
      trendData,
    });
  } catch (error) {
    console.error(`Dashboard Stats Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving dashboard stats' });
  }
};
