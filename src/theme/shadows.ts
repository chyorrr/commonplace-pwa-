export const shadows = {
  // Delicate paper resting on surface
  paperFlat: {
    shadowColor: '#5A4E45',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(90, 78, 69, 0.04)',
  },
  
  // Standard card elevation
  paperCard: {
    shadowColor: '#4B4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    boxShadow: '0px 4px 10px rgba(75, 64, 55, 0.08)',
  },

  // Lifted polaroid or card
  paperLifted: {
    shadowColor: '#4B4037',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
    boxShadow: '0px 9px 18px rgba(75, 64, 55, 0.12)',
  },

  // Floating desk drag object
  deskFloating: {
    shadowColor: '#3F352D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
    boxShadow: '0px 14px 22px rgba(63, 53, 45, 0.2)',
  },

  // Soft inset tape shadow
  tapeShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06)',
  }
};
