export const textInputContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const textInputLabelStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#111827',
};

export const getTextInputStyle = (hasError: boolean): React.CSSProperties => ({
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  outline: 'none',
  fontSize: 16,
});

export const textInputHelperStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 12,
};

export const textInputErrorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: 12,
};

