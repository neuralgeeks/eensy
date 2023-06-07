import * as ts from 'typescript'

/**
 * Creates a typescript source file given its UTF-8 content.
 * Returns the ts.Node that represents the whole file.
 */
export function createSourceFile(content: string, name = 'file.ts'): ts.Node {
  return ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true)
}

/**
 * Recursively matches a regex inside a ts.Node.
 * Returns true if the ts.Node contains directly or indirectly (through children)
 * a text that matches the regex.
 */
export function matchTextFromNode(node: ts.Node, regex: RegExp): boolean {
  if (node.getChildCount() === 0) return !!node.getText().match(regex)

  return node
    .getChildren()
    .map((child) => matchTextFromNode(child, regex))
    .reduce((a, b) => a || b, false)
}
