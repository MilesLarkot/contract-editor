export function syncEditorField(
  editorRef: any,
  updatedField: { fieldName: string; fieldValue: string }
) {
  if (!editorRef.current || !updatedField.fieldName) return;

  editorRef.current.updateFieldValue(
    updatedField.fieldName,
    updatedField.fieldValue
  );
}
