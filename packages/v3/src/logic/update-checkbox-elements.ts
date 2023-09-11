export function updateCheckboxElements(checkboxes: HTMLInputElement[], value: string | string[]) {
  if (checkboxes.length === 0) {
    return
  }

  if (checkboxes.length === 1 && checkboxes[0]) {
    checkboxes[0].checked = Boolean(value)
    return
  }

  checkboxes
    .filter((checkbox) => !checkbox.defaultChecked || !checkbox.disabled)
    .forEach((checkbox) => {
      checkbox.checked = Array.isArray(value)
        ? value.find((data) => data === checkbox.value) != null
        : value === checkbox.value
    })
}
