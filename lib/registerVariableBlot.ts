import Quill from "quill";

let alreadyRegistered = false;

export function registerVariableBlot() {
  if (alreadyRegistered) return;
  alreadyRegistered = true;

  const Inline = Quill.import("blots/inline");

  class VariableBlot extends Inline {
    static blotName = "variable";
    static className = "custom-variable";
    static tagName = "span";

    static create(value: string) {
      const node = super.create();
      node.setAttribute("data-name", value);
      node.setAttribute("contenteditable", "false");
      node.innerText = `{{${value}}}`;
      return node;
    }

    static formats(node: HTMLElement) {
      return node.getAttribute("data-name");
    }
  }

  Quill.register(VariableBlot);
}
