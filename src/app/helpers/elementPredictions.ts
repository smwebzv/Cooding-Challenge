export function areElementsStructurallyEqual(el1: any, el2: any) {
  if (el1.tagName !== el2.tagName) {
    return false; // Different tag names
  }

  if (el1.parentNode.tagName !== el2.parentNode.tagName) return false; // Parents are not same tag name

  // Define attributes to ignore during comparison
  const compareAtributes = ['class', 'id'];

  // Compare attributes
  for (let i = 0; i < el1.attributes.length; i++) {
    const attr1 = el1.attributes[i]?.name;
    const attr2 = el2.attributes[i]?.name;

    if (compareAtributes.includes(attr1) && compareAtributes.includes(attr2)) {
      if (el1.getAttribute(attr1) !== el2.getAttribute(attr2)) {
        return false; // Different attributes
      }
    }
  }

  // Compare child elements
  if (el1.childElementCount !== el2.childElementCount) {
    return false; // Different number of child elements
  }

  for (let i = 0; i < el1.childElementCount; i++) {
    if (!areElementsStructurallyEqual(el1.children[i], el2.children[i])) {
      return false; // Child elements are not structurally equal
    }
  }

  return true; // Elements are structurally equal
}
