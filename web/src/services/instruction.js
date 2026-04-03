import api from './api';

// ─── InstructionController  /api/recipe/:recipeId/instruction ────────────────

// POST /api/recipe/:recipeId/instruction
// Body: { stepNumber, description }
//   stepNumber: integer >= 1 (required)
//   description: string (required)
// Response: InstructionResponseDTO { id, stepNumber, description, recipeId }
export const addInstruction = (recipeId, instructionData) =>
    api.post(`/api/recipe/${recipeId}/instruction`, instructionData);

// GET /api/recipe/:recipeId/instruction
// Returns instructions sorted by stepNumber ASC
// Response: InstructionResponseDTO[]
export const getInstructions = (recipeId) =>
    api.get(`/api/recipe/${recipeId}/instruction`);

// GET /api/recipe/:recipeId/instruction/:id
// Response: InstructionResponseDTO
export const getInstructionById = (recipeId, id) =>
    api.get(`/api/recipe/${recipeId}/instruction/${id}`);

// PUT /api/recipe/:recipeId/instruction/:id
// Body: { stepNumber, description }
// Response: InstructionResponseDTO
export const updateInstruction = (recipeId, id, instructionData) =>
    api.put(`/api/recipe/${recipeId}/instruction/${id}`, instructionData);

// DELETE /api/recipe/:recipeId/instruction/:id
// Response: 204 No Content
export const deleteInstruction = (recipeId, id) =>
    api.delete(`/api/recipe/${recipeId}/instruction/${id}`);

const instructionAPI = {
    addInstruction,
    getInstructions,
    getInstructionById,
    updateInstruction,
    deleteInstruction,
};

export default instructionAPI;