type Field = {
  id: number;
  fieldName: string;
  fieldValue: any;
};

export function updateFieldsState(
  prev: Field[],
  updatedField: { fieldName: string; fieldValue: string }
): Field[] {
  const targetField = prev.find((f) => f.fieldName === updatedField.fieldName);
  if (!targetField) return prev;

  const duplicateExists = prev.some(
    (f) => f.fieldName === updatedField.fieldName && f.id !== targetField.id
  );
  if (duplicateExists && updatedField.fieldName !== "") return prev;

  return prev.map((f) =>
    f.id === targetField.id
      ? {
          ...f,
          fieldName: updatedField.fieldName,
          fieldValue: updatedField.fieldValue,
        }
      : f
  );
}
