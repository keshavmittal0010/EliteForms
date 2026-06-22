const Form = require('../models/Form');
const Response = require('../models/Response');

// @desc    Submit a response to a form
// @route   POST /api/responses/:formId
// @access  Public
exports.submitResponse = async (req, res) => {
  try {
    const { answers } = req.body;
    const { formId } = req.params;

    // Validate form structure exists
    const form = await Form.findByPk(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Validation: enforce required fields constraints
    for (const field of form.fields) {
      if (field.required) {
        const answer = answers[field.id];
        if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          return res.status(400).json({ message: `Field "${field.label}" is required` });
        }
      }
    }

    // Save response
    const response = await Response.create({
      formId,
      answers,
    });

    res.status(201).json({ message: 'Response submitted successfully', response });
  } catch (error) {
    console.error(`Submit Response Error: ${error.message}`);
    res.status(500).json({ message: 'Server error submitting response' });
  }
};

// @desc    Get all responses for a form
// @route   GET /api/responses/:formId
// @access  Private
exports.getResponsesByForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { search } = req.query;

    // Validate form exists
    const form = await Form.findByPk(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Verify ownership
    if (form.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view responses for this form' });
    }

    // Retrieve responses
    let responses = await Response.findAll({
      where: { formId },
      order: [['createdAt', 'DESC']],
    });

    // Apply search filter if keyword query is present
    if (search) {
      const searchLower = search.toLowerCase();
      responses = responses.filter((resp) => {
        const answersObj = resp.answers;
        return Object.values(answersObj).some((val) => {
          if (val === null || val === undefined) return false;
          if (Array.isArray(val)) {
            return val.some((item) => String(item).toLowerCase().includes(searchLower));
          }
          return String(val).toLowerCase().includes(searchLower);
        });
      });
    }

    // Format output to align with frontend Mongoose properties mapping
    const formattedResponses = responses.map((r) => {
      const json = r.toJSON();
      return {
        _id: json.id,
        answers: json.answers,
        submittedAt: json.createdAt,
        formId: json.formId,
      };
    });

    res.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields,
      },
      responses: formattedResponses,
    });
  } catch (error) {
    console.error(`Get Responses Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving responses' });
  }
};

// @desc    Delete a response
// @route   DELETE /api/responses/:responseId
// @access  Private
exports.deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await Response.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check form ownership
    const form = await Form.findByPk(response.formId);
    if (!form) {
      // Clean up orphaned response record
      await response.destroy();
      return res.json({ message: 'Orphaned response deleted' });
    }

    if (form.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this response' });
    }

    await response.destroy();
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error(`Delete Response Error: ${error.message}`);
    res.status(500).json({ message: 'Server error deleting response' });
  }
};
